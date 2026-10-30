# OntoMosaic-DB integration

The portal owns the React UI in `web/src/features/ontology/`; the Cortex engine is maintained independently in the `module/Ontology-NL2SQL` Git submodule at https://github.com/HKUSTDial/Ontology-NL2SQL. The first release is a source snapshot of the local `autoonto-nl2sql-release` project. The original checkout and its Git history are unchanged. Runtime workspaces, SQLite databases, credentials and review outputs are excluded from the release.

## Contract and responsibilities

- `/ontomosaic-text2sql` opens the workbench inside the DataMosaic header and theme. `/ontology/` remains a compatible page alias.
- `/ontomosaic-text2sql/api/*` is the public HTTP API. The engine also accepts `/ontology/api/*` and its direct `/api/*` for existing clients. This keeps the DBMosaic `/api/*` namespace independent in the unified gateway.
- The browser imports SQLite databases and question–SQL JSONL, previews schemas/rows, explicitly imports pairs, starts real Cortex training, polls persisted tasks and explores their generated graphs. Build IDs persist in the URL for refresh recovery.
- Each web build currently processes **at most the first two imported examples**. This is shown in the workbench. Direct API clients can set `case_limit` to another positive integer or `null` for all examples.
- The **Ask database** workspace runs an interactive NL2SQL agent against the bound SQLite snapshot. It retrieves ontology context, asks graph-grounded clarification questions, persists answers and resumes the task, then validates and executes a read-only SQL query. Relevant nodes, task guidance and SQL references can be inspected together. Existing CLI retrieval/guidance workflows remain available.
- Training uses a read-only database snapshot and per-run outputs. Existing graphs can be viewed independently; failed training never substitutes an archive as its result.
- Engine configuration and model keys remain server-side. `/health` distinguishes HTTP availability from `training_ready`; viewing a graph or uploading a database does not require model credentials.
- The portal's `api/portal_ontology.py` entrypoint serializes training submissions across all three API prefixes. Repeated request IDs reuse one run; a different request for an active database returns 409. Background training remains asynchronous. This protection requires the documented single API worker.

## Setup

From the portal root:

```bash
git submodule update --init --recursive
python3.11 -m venv module/Ontology-NL2SQL/.venv
module/Ontology-NL2SQL/.venv/bin/python -m pip install -e './module/Ontology-NL2SQL[web]'
cp module/Ontology-NL2SQL/.env.example module/Ontology-NL2SQL/.env
cp .env.example .env
npm --prefix web ci
```

Fill in the engine `.env`: `CORTEX_LLM_MODEL`, `CORTEX_LLM_BASE_URL`, `CORTEX_LLM_API_KEY` and `CORTEX_EMBEDDING_MODEL`. Do not commit `.env`.

Create `module/Ontology-NL2SQL/data/web_databases` even if you plan to upload your own databases. Bundled graph/pairs examples are in source control; the original BIRD database files are not. To enable the two bundled databases, register local copies:

```bash
module/Ontology-NL2SQL/.venv/bin/python module/Ontology-NL2SQL/scripts/prepare_ontology_demo.py \
  --database-root /path/to/bird/dev_databases
```

You can instead upload `.sqlite`, `.sqlite3` or `.db` through the workbench (up to 200 MiB). Uploaded databases, imported pairs, run metadata and checkpoints persist under the engine's `workspace/web/`.

## Run only this module

```bash
./start.sh --ontology-only
```

Open http://127.0.0.1:8080/ontomosaic-text2sql. This command builds the real portal and serves it and the API from the ontology process; the other document engines are not started. `ONTOLOGY_PORT` overrides the port. Existing Analyze/Extract links require the full stack.

For frontend hot reload, run the engine and Vite separately:

```bash
# Terminal 1, portal root
CORTEX_PROJECT_ROOT="$PWD/module/Ontology-NL2SQL" \
PYTHONPATH="$PWD/api:$PWD/module/Ontology-NL2SQL/src" \
module/Ontology-NL2SQL/.venv/bin/python -m uvicorn portal_ontology:app --host 127.0.0.1 --port 8011 --workers 1
# Terminal 2, portal root
npm --prefix web run dev
```

Vite forwards both API prefixes to `ONTOLOGY_URL` (default http://127.0.0.1:8011); visit its printed URL plus `/ontomosaic-text2sql`.

## Run the full stack

Ontology is disabled by default so existing DocPilot and DBMosaic installations continue to start without it. After installing the ontology dependencies, set `ENABLE_ONTOLOGY=1` in the portal `.env`, then run the full stack:

```bash
./start.sh
```

The local gateway and Nginx forward the ontology API to port 8011. `ENABLE_ONTOLOGY=0` skips starting the engine in the local full-stack script. All documented launch modes use the portal submission guard. `ONTOLOGY_SOURCE` can point to another checkout; `ONTOLOGY_PYTHON` selects its interpreter. Local scripts load the portal `.env`. Relative source paths are resolved from the portal root. If overriding source, set database/model paths explicitly as needed.

For Docker, copy and configure both `.env` files, create the database directory, and run:

```bash
mkdir -p module/Ontology-NL2SQL/data/web_databases
docker compose -f docker-compose.yml -f docker-compose.ontology.yml config --quiet
docker compose -f docker-compose.yml -f docker-compose.ontology.yml up --build -d
```

`ONTOLOGY_SOURCE` controls the engine build context, `ONTOLOGY_ENV_FILE` its model configuration, and `ONTOLOGY_DATABASES` the read-only bundled database directory. Relative paths are resolved from the portal root. `ontology_runtime` persists uploaded databases, run metadata, outputs and SQLite checkpoints. Keep a single API worker: task ownership and concurrency are currently process-local. Do not remove the volume to preserve history.

## Verify and update

```bash
npm --prefix web run build
node --test web/tests/ontology-proxy.test.mjs
node --test web/tests/ontology-request-id.test.mjs
module/Ontology-NL2SQL/.venv/bin/python -m unittest discover -s api/tests -v
module/Ontology-NL2SQL/.venv/bin/python -m pytest \
  module/Ontology-NL2SQL/tests/test_web_workbench.py \
  module/Ontology-NL2SQL/tests/test_web_database_upload.py \
  module/Ontology-NL2SQL/tests/test_portal_integration.py -q
bash -n start.sh scripts/start-ontology.sh
```

Commit and push engine changes inside the submodule first. Then commit its new Git reference together with portal UI/config changes in the parent repository. A fresh `--recurse-submodules` clone should reproduce the same source versions. The original local checkout can continue independently; changes there are not automatically synchronized into this snapshot.

## Interactive query workspace

Query sessions use `/ontomosaic-text2sql/api/nl2sql`: ontology sources, session history, task snapshots, clarification answers, retry/cancel, activity and server-sent events. A session fixes its database and ontology snapshots; runtime sessions, answers and databases remain local and are not shipped in Git.

The graph defaults to explicitly relevant nodes and existing edges between them, with full context available for inspection. Guidance presents task-scoped node definitions; unresolved inline variants remain in node details and are not expanded into SQL instructions. Narrow layouts keep session navigation in a collapsible left drawer. Baseline experiment code is unchanged.
