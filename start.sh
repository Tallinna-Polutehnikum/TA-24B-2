#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$SCRIPT_DIR"

choose_mode() {
  if command -v zenity >/dev/null 2>&1; then
    zenity --list --radiolist \
      --title="Bradar Cinema Software Launcher" \
      --text="Welcome back! How do you want to run the site?" \
      --column="" --column="Mode" \
      TRUE "Build Mode" FALSE "Developer Mode"
  elif command -v kdialog >/dev/null 2>&1; then
    selected=$(kdialog --title "Bradar Cinema Software Launcher" \
      --menu "Welcome back! How do you want to run the site?" \
      build "Build Mode" developer "Developer Mode") || return 1
    case "$selected" in
      build) printf '%s\n' "Build Mode" ;;
      developer) printf '%s\n' "Developer Mode" ;;
      *) return 1 ;;
    esac
  elif [ -t 0 ]; then
    printf '%s\n' "Welcome back! How do you want to run the site?" \
      "1) Build Mode" "2) Developer Mode" >&2
    while :; do
      printf 'Choose [1/2] (default 1): ' >&2
      read -r choice || return 1
      case "$choice" in
        ""|1) printf '%s\n' "Build Mode"; return 0 ;;
        2) printf '%s\n' "Developer Mode"; return 0 ;;
        *) printf '%s\n' "Please enter 1 or 2." >&2 ;;
      esac
    done
  else
    printf '%s\n' "No graphical dialog is available and stdin is not interactive." \
      "Install zenity or kdialog, or run this script from a terminal." >&2
    return 1
  fi
}

launch_terminal() {
  title=$1
  directory=$2
  shift 2

  terminal_command='cd "$1" && shift && "$@"; status=$?; printf "\nProcess exited with status %s.\n" "$status"; exec "${SHELL:-/bin/bash}" -i'

  if command -v gnome-terminal >/dev/null 2>&1; then
    gnome-terminal --window --title="$title" -- bash -c "$terminal_command" launcher "$directory" "$@"
  elif command -v konsole >/dev/null 2>&1; then
    konsole --new-window --caption "$title" -p "tabtitle=$title" -e bash -c "$terminal_command" launcher "$directory" "$@"
  elif command -v xfce4-terminal >/dev/null 2>&1; then
    xfce4-terminal --title="$title" --execute bash -c "$terminal_command" launcher "$directory" "$@"
  elif command -v mate-terminal >/dev/null 2>&1; then
    mate-terminal --title="$title" -- bash -c "$terminal_command" launcher "$directory" "$@"
  elif command -v x-terminal-emulator >/dev/null 2>&1; then
    x-terminal-emulator -T "$title" -e bash -c "$terminal_command" launcher "$directory" "$@"
  elif command -v xterm >/dev/null 2>&1; then
    xterm -T "$title" -e bash -c "$terminal_command" launcher "$directory" "$@"
  else
    printf '%s\n' "No supported terminal emulator found." \
      "Install gnome-terminal, konsole, xfce4-terminal, mate-terminal, x-terminal-emulator, or xterm." >&2
    return 1
  fi
}

wait_for_backend() {
  printf '%s\n' "Waiting for the backend to finish initializing..."
  start_time=$(date +%s)
  while [ "$(( $(date +%s) - start_time ))" -lt 300 ]; do
    if curl --fail --silent --output /dev/null --max-time 2 http://localhost:3000/movies; then
      printf '%s\n' "Backend is ready."
      return 0
    fi
    sleep 2
  done
  printf '%s\n' "Backend did not become ready within 5 minutes. Frontend was not started." >&2
  return 1
}

wait_for_frontend() {
  port=$1
  printf '%s\n' "Waiting for Vite to start..."
  start_time=$(date +%s)
  while [ "$(( $(date +%s) - start_time ))" -lt 300 ]; do
    if curl --fail --silent --output /dev/null --max-time 2 "http://localhost:$port/"; then
      printf '%s\n' "Frontend is ready."
      return 0
    fi
    sleep 1
  done
  printf '%s\n' "Frontend did not become ready within 5 minutes." >&2
  return 1
}

minimize_terminal() {
  title=$1

  if command -v xdotool >/dev/null 2>&1; then
    window_id=$(xdotool search --onlyvisible --name "$title" 2>/dev/null | tail -n 1) || window_id=
    if [ -n "$window_id" ]; then
      if xdotool windowminimize "$window_id"; then
        return 0
      fi
    fi
  fi

  if command -v wmctrl >/dev/null 2>&1 && wmctrl -r "$title" -b add,hidden; then
    return 0
  fi

  printf 'Could not minimize terminal window "%s"; install xdotool or wmctrl to enable minimizing.\n' "$title" >&2
}

open_site() {
  if ! command -v xdg-open >/dev/null 2>&1; then
    printf '%s\n' "xdg-open not found. Open the site manually using the printed URL." >&2
    return 1
  fi
  xdg-open "$1"
}

if ! command -v docker >/dev/null 2>&1; then
  printf '%s\n' "Docker not found. Please install Docker and try again." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  printf '%s\n' "Docker Compose is unavailable. Please install the Docker Compose plugin and try again." >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  printf '%s\n' "curl not found. Please install curl and try again." >&2
  exit 1
fi

if ! MODE=$(choose_mode); then
  printf '%s\n' "Launcher cancelled or could not determine a mode." >&2
  exit 1
fi

case "$MODE" in
  "Developer Mode")
    printf '%s\n' "Starting Site in Developer Mode..." \
      "(c) Samir Miles Cibis, Aleksander Kartuzov, Daniel Helmrosin 2026, All Rights Reserved."
    sleep 3
    docker compose up -d --wait --wait-timeout 120
    launch_terminal "Backend - Development" "$SCRIPT_DIR/backend" sh -c 'if [ ! -d node_modules ]; then npm ci || exit 1; fi; NODE_ENV=development ALLOW_EDITING=true npm run dev'
    wait_for_backend
    minimize_terminal "Backend - Development"
    launch_terminal "Frontend - Development" "$SCRIPT_DIR/frontend" sh -c 'if [ ! -d node_modules ]; then npm ci || exit 1; fi; npm run dev'
    wait_for_frontend 5173
    minimize_terminal "Frontend - Development"
    open_site "http://localhost:5173/"
    printf '%s\n' "Developer Mode: http://localhost:5173/" "API: http://localhost:3000"
    ;;
  "Build Mode")
    printf '%s\n' "Starting Site in Build Mode..." \
      "(c) Samir Miles Cibis, Aleksander Kartuzov, Daniel Helmrosin 2026, All Rights Reserved."
    sleep 3
    docker compose up -d --wait --wait-timeout 120
    launch_terminal "Backend - Production" "$SCRIPT_DIR/backend" sh -c 'if [ ! -d node_modules ]; then npm ci || exit 1; fi; npm run build && NODE_ENV=production ALLOW_EDITING=false npm start'
    wait_for_backend
    minimize_terminal "Backend - Production"
    launch_terminal "Frontend - Preview" "$SCRIPT_DIR/frontend" sh -c 'if [ ! -d node_modules ]; then npm ci || exit 1; fi; npm run build && npm run preview'
    wait_for_frontend 4173
    minimize_terminal "Frontend - Preview"
    open_site "http://localhost:4173/"
    printf '%s\n' "Main page: http://localhost:4173/" "API: http://localhost:3000"
    ;;
  *)
    printf 'Unexpected launcher mode: %s\n' "$MODE" >&2
    exit 1
    ;;
esac
