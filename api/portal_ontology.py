"""Portal entrypoint for the optional, independently maintained ontology engine."""
import asyncio

from cortex.web.app import create_app as create_engine_app


def create_app(**kwargs):
    app = create_engine_app(**kwargs)
    # shortcut: lock is process-local; use database arbitration before enabling multiple workers.
    submission_lock = asyncio.Lock()

    @app.middleware("http")
    async def serialize_training(request, call_next):
        if request.method == "POST" and request.url.path.rstrip("/") in {
            "/api/sql-train", "/ontology/api/sql-train", "/ontomosaic-text2sql/api/sql-train",
        }:
            async with submission_lock:
                return await call_next(request)
        return await call_next(request)

    return app


app = create_app()
