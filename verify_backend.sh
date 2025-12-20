#!/bin/bash

# Backend Verification Script
# This script helps verify your backend service is working correctly

echo "🔍 Backend Service Verification"
echo "================================"
echo ""

BACKEND_URL="https://facialemotioldetectionmanual-production.up.railway.app"

echo "1️⃣ Testing Backend Health Endpoint..."
echo "   URL: ${BACKEND_URL}/api/health"
echo ""

# Test health endpoint
HEALTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "${BACKEND_URL}/api/health" 2>&1)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Backend is responding!"
    echo "   Response: $RESPONSE_BODY"
else
    echo "   ❌ Backend health check failed!"
    echo "   HTTP Code: $HTTP_CODE"
    echo "   Response: $RESPONSE_BODY"
    echo ""
    echo "   Possible issues:"
    echo "   - Backend service is not running"
    echo "   - Backend URL is incorrect"
    echo "   - Network/firewall blocking connection"
fi

echo ""
echo "2️⃣ Testing WebSocket Connection..."
echo "   This requires Node.js to test properly"
echo "   You can test manually in browser console:"
echo ""
echo "   const socket = io('wss://${BACKEND_URL}');"
echo "   socket.on('connect', () => console.log('✅ Connected!'));"
echo "   socket.on('connect_error', (err) => console.error('❌ Error:', err));"
echo ""

echo "3️⃣ Required Environment Variables:"
echo "   Check these in Railway Dashboard → Backend Service → Variables:"
echo ""
echo "   ✅ PORT=5001"
echo "   ✅ PY_API=http://python_ai:8000/analyze (or your Python AI URL)"
echo "   ✅ MONGO_URI=your_mongodb_uri"
echo "   ✅ NODE_ENV=production"
echo ""

echo "4️⃣ Next Steps:"
echo "   1. Go to Railway Dashboard"
echo "   2. Click on your backend service"
echo "   3. Check 'Status' - should be 'Running'"
echo "   4. Click 'Deployments' → 'View Logs'"
echo "   5. Look for:"
echo "      - '🚀 Server running on port 5001'"
echo "      - '✅ MongoDB connected'"
echo "      - Any error messages"
echo ""

echo "📋 Manual Verification Steps:"
echo "   1. Railway Dashboard → Backend Service → Status = 'Running' ✅"
echo "   2. Test health endpoint (above) ✅"
echo "   3. Check logs for errors"
echo "   4. Verify environment variables"
echo ""

