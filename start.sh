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
    gnome-terminal --title="$title" -- bash -c "$terminal_command" launcher "$directory" "$@"
  elif command -v konsole >/dev/null 2>&1; then
    konsole --new-window -p "tabtitle=$title" -e bash -c "$terminal_command" launcher "$directory" "$@"
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

if ! command -v docker >/dev/null 2>&1; then
  printf '%s\n' "Docker not found. Please install Docker and try again." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  printf '%s\n' "Docker Compose is unavailable. Please install the Docker Compose plugin and try again." >&2
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
    launch_terminal "Backend - Development" "$SCRIPT_DIR/backend" sh -c 'if [ ! -d node_modules ]; then npm ci || exit 1; fi; ALLOW_EDITING=true npm run dev'
    launch_terminal "Frontend - Development" "$SCRIPT_DIR/frontend" sh -c 'if [ ! -d node_modules ]; then npm ci || exit 1; fi; npm run dev'
    sleep 12
    printf '%s\n' "Developer Mode: http://localhost:5173/" "API: http://localhost:3000"
    ;;
  "Build Mode")
    printf '%s\n' "Starting Site in Build Mode..." \
      "(c) Samir Miles Cibis, Aleksander Kartuzov, Daniel Helmrosin 2026, All Rights Reserved."
    sleep 3
    docker compose up -d --wait --wait-timeout 120
    launch_terminal "Backend - Production" "$SCRIPT_DIR/backend" sh -c 'if [ ! -d node_modules ]; then npm ci || exit 1; fi; npm run build && NODE_ENV=production npm start'
    launch_terminal "Frontend - Preview" "$SCRIPT_DIR/frontend" sh -c 'if [ ! -d node_modules ]; then npm ci || exit 1; fi; npm run build && npm run preview'
    sleep 12
    printf '%s\n' "Main page: http://localhost:4173/" "API: http://localhost:3000"
    ;;
  *)
    printf 'Unexpected launcher mode: %s\n' "$MODE" >&2
    exit 1
    ;;
esac
