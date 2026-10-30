#!/usr/bin/env bash
# Run the integrated portal and ontology engine without the document engines.
set -Eeuo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a
  source "$ROOT_DIR/.env"
  set +a
fi
ONTOLOGY_SOURCE="${ONTOLOGY_SOURCE:-$ROOT_DIR/module/Ontology-NL2SQL}"
[[ "$ONTOLOGY_SOURCE" = /* ]] || ONTOLOGY_SOURCE="$ROOT_DIR/$ONTOLOGY_SOURCE"
ONTOLOGY_PYTHON="${ONTOLOGY_PYTHON:-$ONTOLOGY_SOURCE/.venv/bin/python}"
ONTOLOGY_PORT="${ONTOLOGY_PORT:-${DATAMOSAIC_WEB_PORT:-8080}}"
if [[ ! -f "$ONTOLOGY_SOURCE/src/cortex/web/app.py" || ! -x "$ONTOLOGY_PYTHON" ]]; then
  echo "Ontology engine or Python environment missing. Initialize module/Ontology-NL2SQL and install .[web]; see docs/ontomosaic-text2sql.md." >&2
  exit 1
fi
if [[ ! "$ONTOLOGY_PORT" =~ ^[0-9]+$ ]] || ((ONTOLOGY_PORT < 1 || ONTOLOGY_PORT > 65535)); then
  echo "Invalid ONTOLOGY_PORT: $ONTOLOGY_PORT" >&2
  exit 1
fi
if command -v lsof >/dev/null && lsof -nP -iTCP:"$ONTOLOGY_PORT" -sTCP:LISTEN >/dev/null; then
  echo "Port $ONTOLOGY_PORT is in use. Set ONTOLOGY_PORT to an available port." >&2
  exit 1
fi
if [[ "$(uname -m)" == "arm64" && -x /opt/homebrew/bin/node ]]; then
  export PATH="/opt/homebrew/bin:$PATH"
fi
[[ -d "$ROOT_DIR/web/node_modules" ]] || npm --prefix "$ROOT_DIR/web" ci
npm --prefix "$ROOT_DIR/web" run build
export CORTEX_PROJECT_ROOT="$ONTOLOGY_SOURCE"
export CORTEX_WEB_FRONTEND_DIST="$ROOT_DIR/web/dist"
export PYTHONPATH="$ROOT_DIR/api:$ONTOLOGY_SOURCE/src${PYTHONPATH:+:$PYTHONPATH}"
echo "Open http://127.0.0.1:$ONTOLOGY_PORT/ontomosaic-db"
cd "$ONTOLOGY_SOURCE"
exec "$ONTOLOGY_PYTHON" -m uvicorn portal_ontology:app \
  --host "${DATAMOSAIC_WEB_BIND:-127.0.0.1}" --port "$ONTOLOGY_PORT" --workers 1
