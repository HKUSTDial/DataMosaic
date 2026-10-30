import asyncio
import importlib.util
import json
from pathlib import Path
import sqlite3
import tempfile
import time
import unittest
from unittest.mock import patch

import httpx


@unittest.skipUnless(importlib.util.find_spec("cortex"), "Optional ontology engine is not installed")
class OntologySubmissionTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        from api.portal_ontology import create_app
        self.create_app = create_app
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        database = self.root / "databases/financial/financial.sqlite"
        database.parent.mkdir(parents=True)
        with sqlite3.connect(database) as db:
            db.execute("CREATE TABLE sample (id INTEGER)")

    async def prepare(self, client):
        response = await client.post("/api/training-files?database_id=financial", files={
            "file": ("pairs.jsonl", json.dumps({"question": "q", "sql": "SELECT 1"}))})
        self.assertEqual(response.status_code, 200)
        key = response.json()["id"]
        self.assertEqual((await client.post("/api/imports", json={"file_id": key})).status_code, 200)
        return {"import_id": key, "request_id": "same", "mode": "live"}

    async def test_concurrent_submissions_across_all_prefixes(self):
        def preflight():
            time.sleep(0.05)
            return {}

        for index, prefix in enumerate(("/api", "/ontomosaic-db/api", "/ontology/api", "/ontomosaic-text2sql/api")):
            for second_id in ("same", "different"):
                with self.subTest(prefix=prefix, second_id=second_id):
                    app = self.create_app(database_root=self.root / "databases", storage=self.root / f"runs-{index}-{second_id}")
                    started, finish = [], asyncio.Event()

                    async def train(_runner, run, pairs, database, update):
                        started.append(run["id"])
                        update(status="running", phase="learning")
                        await finish.wait()

                    try:
                        with patch("cortex.web.app.check_training_configuration", preflight), patch("cortex.web.app.CliTrainingRunner.run", train):
                            async with httpx.AsyncClient(transport=httpx.ASGITransport(app), base_url="http://portal") as client:
                                body = await self.prepare(client)
                                first, second = await asyncio.wait_for(asyncio.gather(
                                    client.post(prefix + "/sql-train", json=body),
                                    client.post(prefix + "/sql-train", json={**body, "request_id": second_id}),
                                ), timeout=5)
                                self.assertEqual(first.status_code, 202)
                                self.assertEqual(second.status_code, 202 if second_id == "same" else 409)
                                if second_id == "same":
                                    self.assertEqual(first.json()["id"], second.json()["id"])
                                self.assertEqual(len((await client.get("/api/runs")).json()["runs"]), 1)
                                self.assertEqual(started, [first.json()["id"]])
                    finally:
                        finish.set()
                        await asyncio.sleep(0)

    async def test_configuration_failure_releases_submission_lock(self):
        app = self.create_app(database_root=self.root / "databases", storage=self.root / "failed-config")
        finish = asyncio.Event()

        async def train(_runner, run, pairs, database, update):
            await finish.wait()

        try:
            with patch("cortex.web.app.check_training_configuration", side_effect=[ValueError("Missing configuration"), {}]), patch("cortex.web.app.CliTrainingRunner.run", train):
                async with httpx.AsyncClient(transport=httpx.ASGITransport(app), base_url="http://portal") as client:
                    body = await self.prepare(client)
                    self.assertEqual((await client.post("/api/sql-train", json=body)).status_code, 503)
                    response = await asyncio.wait_for(client.post("/api/sql-train", json=body), timeout=5)
                    self.assertEqual(response.status_code, 202)
        finally:
            finish.set()
            await asyncio.sleep(0)
