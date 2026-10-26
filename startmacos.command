#!/bin/zsh
set -u

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

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found. Please install Docker Desktop for Mac and try again."
  exit 1
fi

MODE="$(choose_mode)"

if [[ "$MODE" == "Developer Mode" ]]; then
  echo "Starting Site in Developer Mode..."
  echo "(c) Samir Miles Cibis, Aleksander Kartuzov, Daniel Helmrosin 2026, All Rights Reserved."
  sleep 3

  docker compose up -d

  launch_terminal "cd backend && ALLOW_EDITING=true npm run dev"
  launch_terminal "cd frontend && npm run dev"

  sleep 12
  echo "Developer Mode: http://localhost:5173/"
  echo "API: http://localhost:3000"
  exit 0
fi

echo "Starting Site in Build Mode..."
echo "(c) Samir Miles Cibis, Aleksander Kartuzov, Daniel Helmrosin 2026, All Rights Reserved."
sleep 3

docker compose up -d

launch_terminal "cd backend && npm run build && NODE_ENV=production npm start"
launch_terminal "cd frontend && npm run build && npm run preview"

sleep 12
echo "Main page: http://localhost:4173/"
echo "API: http://localhost:3000"
