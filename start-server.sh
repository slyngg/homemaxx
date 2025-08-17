#!/bin/bash

# Start a simple HTTP server in the website directory
cd "$(dirname "$0")/website"

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m http.server 8000
else
    echo "Error: Python is not installed"
    exit 1
fi

echo "Server started at http://localhost:8000"
echo "Press Ctrl+C to stop the server"
