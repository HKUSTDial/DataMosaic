#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCPILOT_DIR="$ROOT_DIR/module/DocPilot"
DBMOSAIC_DIR="$ROOT_DIR/module/DBMosaic"
LOG_DIR="$ROOT_DIR/logs/local"
WEB_PORT="${DATAMOSAIC_WEB_PORT:-8080}"
BUILD_DIR=""
PIDS=()

cleanup() {
  trap - EXIT INT TERM
  if ((${#PIDS[@]})); then
    kill "${PIDS[@]}" 2>/dev/null || true
    wait "${PIDS[@]}" 2>/dev/null || true
  fi
  if [[ "$BUILD_DIR" == /tmp/datamosaic-local.* && -d "$BUILD_DIR" ]]; then
    rm -r -- "$BUILD_DIR"
  fi
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

for command in node npm rsync curl; do
  command -v "$command" >/dev/null || { echo "Missing command: $command" >&2; exit 1; }
done
for required in \
  "$DOCPILOT_DIR/.venv/bin/python" \
  "$DBMOSAIC_DIR/.venv/bin/python" \
  "$DOCPILOT_DIR/demo/chat/frontend/node_modules" \
  "$DBMOSAIC_DIR/frontend/node_modules/http-proxy" \
  "$DBMOSAIC_DIR/frontend/node_modules/serve-static" \
  "$ROOT_DIR/web/node_modules" \
  "$DBMOSAIC_DIR/llm/.env"; do
  [[ -e "$required" ]] || { echo "Missing: $required" >&2; exit 1; }
done
[[ "$WEB_PORT" =~ ^[0-9]+$ ]] && ((WEB_PORT >= 1 && WEB_PORT <= 65535)) || {
  echo "Invalid DATAMOSAIC_WEB_PORT: $WEB_PORT" >&2; exit 1;
}
if command -v lsof >/dev/null; then
  for port in 8001 8008 5000 8765 "$WEB_PORT"; do
    if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
      echo "Port $port is already in use; stop the existing service first." >&2
      exit 1
    fi
  done
fi

BUILD_DIR="$(mktemp -d /tmp/datamosaic-local.XXXXXX)"
mkdir -p "$LOG_DIR" "$BUILD_DIR/portal"
rsync -a --exclude=node_modules --exclude=dist --exclude='*.tsbuildinfo' \
  "$DOCPILOT_DIR/demo/chat/frontend/" "$BUILD_DIR/docpilot/"
rsync -a --exclude=node_modules --exclude=build \
  "$DBMOSAIC_DIR/frontend/" "$BUILD_DIR/datamosaic/"
ln -s "$DOCPILOT_DIR/demo/chat/frontend/node_modules" "$BUILD_DIR/docpilot/node_modules"
ln -s "$DBMOSAIC_DIR/frontend/node_modules" "$BUILD_DIR/datamosaic/node_modules"
node "$ROOT_DIR/web/patch-docpilot-api.mjs" "$BUILD_DIR/docpilot/src/api.ts"
unset VITE_API_BASE_URL

echo "Building DataMosaic portal..."
npm --prefix "$ROOT_DIR/web" run build -- --outDir "$BUILD_DIR/portal"
echo "Building DocPilot frontend..."
npm --prefix "$BUILD_DIR/docpilot" run build -- --base=/analyze/
echo "Building DBMosaic frontend..."
PUBLIC_URL=/extract REACT_APP_WEBSOCKET_URL=/extract/ws DISABLE_ESLINT_PLUGIN=true \
  npm --prefix "$BUILD_DIR/datamosaic" run build

wait_healthy() {
  local name="$1" url="$2" pid="$3" log="$4"
  for ((attempt=0; attempt<60; attempt++)); do
    if curl --noproxy '*' -fsS "$url" >/dev/null 2>&1; then
      echo "$name ready"
      return 0
    fi
    if ! kill -0 "$pid" 2>/dev/null; then break; fi
    sleep 1
  done
  echo "$name did not start; last log lines:" >&2
  tail -n 30 "$log" >&2
  return 1
}

(
  cd "$DOCPILOT_DIR"
  export PATH="$DOCPILOT_DIR/.venv/bin:$PATH"
  exec "$DOCPILOT_DIR/.venv/bin/python" -m uvicorn main:app \
    --app-dir demo/chat/backend --host 127.0.0.1 --port 8008
) >"$LOG_DIR/docpilot.log" 2>&1 &
PIDS+=("$!")
wait_healthy DocPilot http://127.0.0.1:8008/api/health "${PIDS[-1]}" "$LOG_DIR/docpilot.log"

(
  cd "$DBMOSAIC_DIR"
  export PATH="$DBMOSAIC_DIR/.venv/bin:$PATH"
  export HOST=127.0.0.1 PORT=5000 WEBSOCKET_HOST=127.0.0.1 WEBSOCKET_PORT=8765
  export FLASK_DEBUG=0 FLASK_AUTO_RELOAD=0
  exec "$DBMOSAIC_DIR/.venv/bin/python" backend/app.py
) >"$LOG_DIR/datamosaic.log" 2>&1 &
PIDS+=("$!")
wait_healthy DBMosaic http://127.0.0.1:5000/api/health "${PIDS[-1]}" "$LOG_DIR/datamosaic.log"

(
  cd "$ROOT_DIR"
  export DOCPILOT_URL=http://127.0.0.1:8008 DBMOSAIC_URL=http://127.0.0.1:5000
  exec "$DOCPILOT_DIR/.venv/bin/python" -m uvicorn api.app:app \
    --host 127.0.0.1 --port 8001
) >"$LOG_DIR/api.log" 2>&1 &
PIDS+=("$!")
wait_healthy 'Platform API' http://127.0.0.1:8001/api/health "${PIDS[-1]}" "$LOG_DIR/api.log"

node "$ROOT_DIR/web/local-server.cjs" "$ROOT_DIR" \
  "$BUILD_DIR/docpilot/dist" "$BUILD_DIR/datamosaic/build" "$BUILD_DIR/portal" \
  >"$LOG_DIR/web.log" 2>&1 &
PIDS+=("$!")
wait_healthy 'Web portal' "http://127.0.0.1:$WEB_PORT/" "${PIDS[-1]}" "$LOG_DIR/web.log"

echo "Open http://127.0.0.1:$WEB_PORT/ (Analyze: /analyze/, Extract: /extract/)"
echo "Logs: $LOG_DIR · Press Ctrl+C to stop all local services."
wait -n "${PIDS[@]}" || true
echo "A service exited; stopping the rest. Check $LOG_DIR for details." >&2
exit 1
