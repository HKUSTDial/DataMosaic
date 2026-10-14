"""Same-origin gateway for the independently deployed engines."""

import asyncio
import json
import os
import re
from uuid import uuid4

import httpx
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

MAX_PDF_BYTES = 50 * 1024 * 1024
TASK_ID = re.compile(r"^[a-zA-Z0-9-]{1,100}$")


def create_app(transport=None):
    app = FastAPI(title="DocSensaAI API")
    docpilot = os.getenv("DOCPILOT_URL", "http://docpilot:8008").rstrip("/")
    datamosaic = os.getenv("DATAMOSAIC_URL", "http://datamosaic:5000").rstrip("/")

    def client():
        return httpx.AsyncClient(transport=transport, timeout=60, trust_env=False)

    async def pdf_data(file: UploadFile) -> bytes:
        if not (file.filename or "").lower().endswith(".pdf"):
            raise HTTPException(400, "Choose a PDF file.")
        data = await file.read(MAX_PDF_BYTES + 1)
        if len(data) > MAX_PDF_BYTES:
            raise HTTPException(413, "PDF exceeds 50 MB.")
        if not data.startswith(b"%PDF-"):
            raise HTTPException(400, "Invalid PDF file.")
        return data

    @app.get("/api/health")
    async def health():
        async def check(url):
            try:
                async with client() as upstream:
                    response = await upstream.get(f"{url}/api/health", timeout=5)
                    return response.is_success
            except httpx.HTTPError:
                return False

        pilot_ok, mosaic_ok = await asyncio.gather(check(docpilot), check(datamosaic))
        return {"status": "ok" if pilot_ok and mosaic_ok else "degraded",
                "docpilot": pilot_ok, "datamosaic": mosaic_ok}

    @app.post("/api/analyze")
    async def analyze(file: UploadFile = File(...), question: str = Form(...)):
        question = question.strip()
        if not question:
            raise HTTPException(400, "Enter a question.")
        if not os.getenv("DOCPILOT_MODEL"):
            raise HTTPException(503, "Analyze model is not configured on the server.")
        data = await pdf_data(file)
        run_id = uuid4().hex
        name = f"{run_id}.pdf"
        session_id = f"portal-{run_id}"

        async def events():
            def event(kind, **fields):
                return json.dumps({"type": kind, **fields}, ensure_ascii=False) + "\n"

            try:
                yield event("progress", message="Uploading PDF")
                async with client() as upstream:
                    uploaded = await upstream.post(
                        f"{docpilot}/api/files", params={"session_id": session_id},
                        files={"files": (name, data, "application/pdf")}, timeout=120,
                    )
                    uploaded.raise_for_status()
                    if name not in uploaded.json().get("uploaded", []):
                        raise ValueError("DocPilot did not accept the PDF")

                    yield event("progress", message="Preprocessing PDF with MinerU")
                    for _ in range(900):  # 30 minutes; MinerU can take time on CPU.
                        status_response = await upstream.get(
                            f"{docpilot}/api/files", params={"session_id": session_id}
                        )
                        status_response.raise_for_status()
                        files = status_response.json().get("files", [])
                        record = next((item for item in files if item.get("name") == name), None)
                        status = (record or {}).get("processing_status")
                        if status == "ready":
                            break
                        if status == "failed":
                            raise ValueError("PDF preprocessing failed")
                        await asyncio.sleep(2)
                    else:
                        raise TimeoutError("PDF preprocessing timed out")

                    yield event("progress", message="Analyzing document")
                    config = {
                        "provider": os.getenv("DOCPILOT_PROVIDER", "custom"),
                        "base_url": os.getenv("DOCPILOT_MODEL_BASE_URL", "https://api.openai.com/v1"),
                        "api_key": os.getenv("DOCPILOT_API_KEY", ""),
                        "model": os.environ["DOCPILOT_MODEL"],
                        "reasoning": os.getenv("DOCPILOT_REASONING", "false").lower() == "true",
                        "temperature": 0, "max_tokens": None, "timeout": 180,
                    }
                    payload = {
                        "session_id": session_id, "conversation_id": run_id,
                        "agent": "default", "config": config,
                        "messages": [{"role": "user", "content": question}],
                        "selected_files": [name],
                    }
                    async with upstream.stream(
                        "POST", f"{docpilot}/api/chat/stream", json=payload,
                        timeout=httpx.Timeout(3600, connect=15),
                    ) as response:
                        response.raise_for_status()
                        done = False
                        async for line in response.aiter_lines():
                            if not line:
                                continue
                            message = json.loads(line)
                            kind = message.get("type")
                            if kind == "step":
                                action = message.get("action") or {}
                                if (message.get("observation") or {}).get("payload", {}).get("phase") == "action":
                                    yield event("progress", message=action.get("action_type", "Analyzing").capitalize())
                            elif kind == "delta":
                                yield event("delta", content=message.get("content", ""))
                            elif kind == "done":
                                done = True
                                yield event("done")
                            elif kind == "error":
                                raise ValueError("DocPilot analysis failed")
                        if not done:
                            raise ValueError("DocPilot stream ended unexpectedly")
            except (httpx.HTTPError, ValueError, KeyError, TimeoutError):
                yield event("error", message="Analysis failed. Check the engine logs and model configuration.")

        return StreamingResponse(events(), media_type="application/x-ndjson")

    @app.post("/api/extract")
    async def extract(file: UploadFile = File(...), instruction: str = Form(...)):
        instruction = instruction.strip()
        if not instruction:
            raise HTTPException(400, "Enter an extraction instruction.")
        data = await pdf_data(file)
        name = f"{uuid4().hex}.pdf"
        try:
            async with client() as upstream:
                uploaded = await upstream.post(
                    f"{datamosaic}/api/upload",
                    files={"file": (name, data, "application/pdf")}, timeout=120,
                )
                uploaded.raise_for_status()
                path = uploaded.json()["filepath"]
                started = await upstream.post(
                    f"{datamosaic}/api/doc2db/process",
                    json={"files": [path], "schema": "", "input_mode": "instruction",
                          "nl_prompt": instruction, "table_name": "extracted_data",
                          "model": os.getenv("DATAMOSAIC_MODEL", "gpt-4o")},
                )
                started.raise_for_status()
                return {"task_id": started.json()["task_id"], "status": "started"}
        except (httpx.HTTPError, KeyError, ValueError):
            raise HTTPException(502, "Could not start extraction. Check DataMosaic logs.") from None

    @app.get("/api/extract/{task_id}")
    async def extract_status(task_id: str):
        if not TASK_ID.fullmatch(task_id):
            raise HTTPException(400, "Invalid task ID.")
        try:
            async with client() as upstream:
                response = await upstream.get(f"{datamosaic}/api/doc2db/status/{task_id}")
                if response.status_code == 404:
                    raise HTTPException(404, "Task not found.")
                response.raise_for_status()
                body = response.json()
                return {"task_id": task_id, "status": body.get("status", "unknown"),
                        "step": body.get("current_step", ""),
                        "error": "Extraction failed. Check DataMosaic logs." if body.get("status") == "failed" else None}
        except (httpx.HTTPError, ValueError):
            raise HTTPException(502, "Could not read extraction status.") from None

    @app.get("/api/extract/{task_id}/result")
    async def extract_result(task_id: str):
        if not TASK_ID.fullmatch(task_id):
            raise HTTPException(400, "Invalid task ID.")
        try:
            async with client() as upstream:
                response = await upstream.get(f"{datamosaic}/api/doc2db/result/{task_id}")
                if response.status_code == 404:
                    raise HTTPException(404, "Task not found.")
                if response.status_code == 400:
                    raise HTTPException(409, "Task is not complete.")
                response.raise_for_status()
                return response.json()
        except (httpx.HTTPError, ValueError):
            raise HTTPException(502, "Could not read extraction result.") from None

    return app


app = create_app()
