import json
import os
import unittest
from unittest.mock import patch

import httpx

from api.app import create_app


PDF = b"%PDF-1.4\n%%EOF\n"


class GatewayTests(unittest.IsolatedAsyncioTestCase):
    async def request(self, handler, method, path, **kwargs):
        app = create_app(httpx.MockTransport(handler))
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://portal") as client:
            return await client.request(method, path, **kwargs)

    async def test_health_checks_both_engines(self):
        seen = []

        def downstream(request):
            seen.append(str(request.url))
            return httpx.Response(200, json={"status": "ok"})

        with patch.dict(os.environ, {"DBMOSAIC_URL": "http://extract-test:5100/"}):
            response = await self.request(downstream, "GET", "/api/health")
        self.assertEqual(response.json(), {"status": "ok", "docpilot": True, "datamosaic": True})
        self.assertEqual(len(seen), 2)
        self.assertTrue(all(url.endswith("/api/health") for url in seen))
        self.assertIn("http://extract-test:5100/api/health", seen)

    async def test_analyze_waits_for_ready_then_streams_answer_without_key(self):
        calls = []

        def downstream(request):
            calls.append(request)
            if request.url.path == "/api/files" and request.method == "POST":
                filename = request.content.split(b'filename="')[1].split(b'"')[0].decode()
                self.assertTrue(filename.endswith(".pdf"))
                self.assertNotEqual(filename, "input.pdf")
                self.filename = filename
                return httpx.Response(200, json={"uploaded": [filename]})
            if request.url.path == "/api/files":
                return httpx.Response(200, json={"files": [{"name": self.filename, "processing_status": "ready"}]})
            if request.url.path == "/api/chat/stream":
                body = json.loads(request.content)
                self.assertEqual(body["selected_files"], [self.filename])
                self.assertEqual(body["agent"], "default")
                self.assertEqual(body["config"]["api_key"], "private-test-key")
                self.assertEqual(body["config"]["temperature"], 0)
                return httpx.Response(200, text='{"type":"step","action":{"action_type":"navigate"},"observation":{"payload":{"phase":"action"}}}\n{"type":"delta","content":"Page 5 says 5%.","state":{"secret":"internal"}}\n{"type":"done"}\n')
            return httpx.Response(404)

        with patch.dict(os.environ, {"DOCPILOT_MODEL": "test-model", "DOCPILOT_API_KEY": "private-test-key"}):
            response = await self.request(downstream, "POST", "/api/analyze",
                                          files={"file": ("input.pdf", PDF, "application/pdf")},
                                          data={"question": "What percentage?"})
        self.assertEqual(response.status_code, 200)
        events = [json.loads(line) for line in response.text.splitlines()]
        self.assertEqual(events[-1], {"type": "done"})
        self.assertIn({"type": "delta", "content": "Page 5 says 5%."}, events)
        self.assertNotIn("private-test-key", response.text)
        self.assertNotIn("internal", response.text)
        self.assertEqual([call.url.path for call in calls], ["/api/files", "/api/files", "/api/chat/stream"])

    async def test_extract_starts_and_proxies_status_and_result(self):
        def downstream(request):
            if request.url.path == "/api/upload":
                return httpx.Response(200, json={"filepath": "/app/backend/uploads/new.pdf"})
            if request.url.path == "/api/doc2db/process":
                body = json.loads(request.content)
                self.assertEqual(body["files"], ["/app/backend/uploads/new.pdf"])
                self.assertEqual(body["nl_prompt"], "Extract names")
                self.assertEqual(body["input_mode"], "instruction")
                self.assertEqual(body["model"], "renamed-model")
                return httpx.Response(200, json={"task_id": "task-1"})
            if request.url.path == "/api/doc2db/status/task-1":
                return httpx.Response(200, json={"status": "completed", "current_step": "done", "documents": ["/secret/path"]})
            if request.url.path == "/api/doc2db/result/task-1":
                return httpx.Response(200, json={"rows": [{"name": "Alice"}]})
            return httpx.Response(404)

        with patch.dict(os.environ, {"DBMOSAIC_MODEL": "renamed-model"}):
            started = await self.request(downstream, "POST", "/api/extract",
                                         files={"file": ("input.pdf", PDF, "application/pdf")},
                                         data={"instruction": "Extract names"})
        self.assertEqual(started.json(), {"task_id": "task-1", "status": "started"})
        status = await self.request(downstream, "GET", "/api/extract/task-1")
        self.assertEqual(status.json()["status"], "completed")
        self.assertNotIn("/secret/path", status.text)
        result = await self.request(downstream, "GET", "/api/extract/task-1/result")
        self.assertEqual(result.json(), {"rows": [{"name": "Alice"}]})

    async def test_rejects_invalid_pdf(self):
        def downstream(request):
            self.fail("Invalid upload must not contact engines")

        response = await self.request(downstream, "POST", "/api/extract",
                                      files={"file": ("fake.pdf", b"not a PDF", "application/pdf")},
                                      data={"instruction": "Extract names"})
        self.assertEqual(response.status_code, 400)


if __name__ == "__main__":
    unittest.main()
