#!/bin/zsh
set -eu

SCRIPT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
cd "$SCRIPT_DIR"

choose_mode() {
  if command -v osascript >/dev/null 2>&1; then
    osascript <<'APPLESCRIPT'
      tell application "System Events"
        activate
      end tell
      set selectedButton to button returned of (display dialog "Welcome back! How do you want to run the site?" with title "Bradar Cinema Software Launcher" buttons {"Build Mode", "Developer Mode"} default button "Build Mode" cancel button "Developer Mode")
      selectedButton
APPLESCRIPT
  else
    echo "1) Build Mode"
    echo "2) Developer Mode"
    read -r choice
    if [[ "$choice" == "2" ]]; then
      echo "Developer Mode"
    else
      echo "Build Mode"
    fi
  fi
}

launch_terminal() {
  local command="$1"
  osascript <<APPLESCRIPT
  tell application "Terminal"
    activate
    do script "cd \"$SCRIPT_DIR\" && $command"
  end tell
APPLESCRIPT
}

wait_for_backend() {
  echo "Waiting for the backend to finish initializing..."
  local start_time
  start_time="$(date +%s)"
  while (( $(date +%s) - start_time < 300 )); do
    if curl --fail --silent --output /dev/null --max-time 2 http://localhost:3000/movies; then
      echo "Backend is ready."
      return 0
    fi
    sleep 2
  done
  echo "Backend did not become ready within 5 minutes. Frontend was not started." >&2
  return 1
}

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found. Please install Docker Desktop for Mac and try again."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose is unavailable. Please install the Docker Compose plugin and try again."
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "curl not found. Please install curl and try again."
  exit 1
fi

MODE="$(choose_mode)"

if [[ "$MODE" == "Developer Mode" ]]; then
  echo "Starting Site in Developer Mode..."
  echo "(c) Samir Miles Cibis, Aleksander Kartuzov, Daniel Helmrosin 2026, All Rights Reserved."
  sleep 3

  docker compose up -d --wait --wait-timeout 120

  launch_terminal "cd backend && if [ ! -d node_modules ]; then npm ci || exit 1; fi && NODE_ENV=development ALLOW_EDITING=true npm run dev"
  wait_for_backend
  launch_terminal "cd frontend && if [ ! -d node_modules ]; then npm ci || exit 1; fi && npm run dev"

  sleep 12
  echo "Developer Mode: http://localhost:5173/"
  echo "API: http://localhost:3000"
  exit 0
fi

echo "Starting Site in Build Mode..."
echo "(c) Samir Miles Cibis, Aleksander Kartuzov, Daniel Helmrosin 2026, All Rights Reserved."
sleep 3

docker compose up -d --wait --wait-timeout 120

launch_terminal "cd backend && if [ ! -d node_modules ]; then npm ci || exit 1; fi && npm run build && NODE_ENV=production ALLOW_EDITING=false npm start"
wait_for_backend
launch_terminal "cd frontend && if [ ! -d node_modules ]; then npm ci || exit 1; fi && npm run build && npm run preview"

sleep 12
echo "Main page: http://localhost:4173/"
echo "API: http://localhost:3000"
