#!/bin/bash
set -e

echo "=== Pulling latest changes from GitHub ==="
git pull origin main

echo "=== Updating Virtual Environment Dependencies ==="
if [ -d "venv" ]; then
    ./venv/bin/pip install -r requirements.txt
fi

echo "=== Restarting FastAPI Backend ==="
if [ -f "run_backend.sh" ]; then
    pkill -f "fastapi.sock" 2>/dev/null || true
    rm -f fastapi.sock
    bash run_backend.sh
fi

echo "=== Deployment Completed Successfully! ==="
