#!/bin/bash
APP_DIR="/home/u121474497/domains/nexalogictechno.com/app"
SOCK="$APP_DIR/fastapi.sock"
VENV_PYTHON="$APP_DIR/venv/bin/python3"
BOOT_LOG="$APP_DIR/backend.log"

# Check if socket is responding
if [ -S "$SOCK" ]; then
    RESP=$(curl -s -m 2 --unix-socket "$SOCK" http://localhost/api/company-settings 2>/dev/null || true)
    if [ -n "$RESP" ]; then
        exit 0
    fi
    rm -f "$SOCK"
fi

cd "$APP_DIR/backend" || exit 1
export PYTHONPATH="$APP_DIR/backend:$PYTHONPATH"
nohup "$VENV_PYTHON" -m uvicorn main:app --uds "$SOCK" --workers 2 >> "$BOOT_LOG" 2>&1 < /dev/null &
chmod 777 "$SOCK" 2>/dev/null || true
