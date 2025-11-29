#!/usr/bin/env bash
# run_helpers.sh - helpful commands to start/stop/check servers

echo "=== Facial Emotion Project - Helper Commands ==="
echo ""

# Activate python venv (unix/mac)
echo "To activate python venv:"
echo "  cd python-ai && source venv/bin/activate"
echo ""

echo "To start hybrid AI server:"
echo "  cd python-ai && source venv/bin/activate && python3 api_server_hybrid.py"
echo ""

echo "To start backend:"
echo "  cd backend && npm start"
echo ""

echo "To start frontend:"
echo "  cd frontend && python3 -m http.server 8080"
echo ""

echo "=== Health Checks ==="
echo "Python AI: curl http://127.0.0.1:8000/health"
echo "Backend:   curl http://127.0.0.1:5001/api/health"
echo ""

echo "=== Useful Commands ==="
echo "Stop Python AI: pkill -f api_server_hybrid.py"
echo "Stop Backend:   pkill -f 'node server.js'"
echo ""

