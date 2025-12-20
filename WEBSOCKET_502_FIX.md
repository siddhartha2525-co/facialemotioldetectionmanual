# 🔧 WebSocket 502 Error - Complete Fix Guide

## ❌ Current Error

**Error**: `websocket error`  
**Backend**: `https://facialemotioldetectionmanual-production.up.railway.app`  
**Status**: 502 Bad Gateway

## 🔍 Root Cause

The **502 error** means the backend service is **not responding at all**. This is why WebSocket connections fail - the backend isn't even running or accessible.

## ✅ Complete Fix Process

### Step 1: Verify Backend Service is Running

**Railway Dashboard** → **Backend Service** → **Status**

**Check**:
- ✅ **"Running"** = Service is active
- ❌ **"Failed"** = Service crashed (see Step 2)
- ⏳ **"Building"** = Wait for deployment
- ⏸️ **"Stopped"** = Start the service

### Step 2: Check Backend Logs

**Railway Dashboard** → **Backend Service** → **Deployments** → **View Logs**

**Look for**:
- ✅ `🚀 Server running on port 5001`
- ✅ `📡 Socket.io ready for connections`
- ❌ Any error messages

**Common Errors**:
- `Error: Cannot find module` → Missing dependencies
- `Port already in use` → Port conflict
- `MongoDB connection error` → Database issue

### Step 3: Verify Environment Variables

**Railway Dashboard** → **Backend Service** → **Variables**

**Required**:
- ✅ `PORT=5001` (or Railway's assigned port)
- ✅ `PY_API=http://python_ai:8000/analyze`
- ✅ `MONGO_URI=your_mongodb_uri` (optional but recommended)
- ✅ `NODE_ENV=production`

### Step 4: Test Backend Health

**After backend is running**, test:

```bash
curl https://facialemotioldetectionmanual-production.up.railway.app/api/health
```

**Expected**: `{"success":true}`

**If 502**: Backend still not running - check logs

### Step 5: Test WebSocket Connection

**After backend health works**, test WebSocket:

**Browser Console**:
```javascript
const socket = io('wss://facialemotioldetectionmanual-production.up.railway.app');
socket.on('connect', () => console.log('✅ Connected!'));
socket.on('connect_error', (err) => console.error('❌ Error:', err));
```

**Expected**: `✅ Connected!`

## 🔧 Code Improvements Applied

I've updated the backend code with:

1. **Enhanced CORS configuration**:
   - Allows all origins
   - Supports credentials
   - Multiple HTTP methods

2. **Improved Socket.io configuration**:
   - Multiple transports (websocket, polling)
   - Longer timeouts for mobile
   - Better CORS support

3. **Server binding**:
   - Listens on `0.0.0.0` (all interfaces)
   - Better for Railway deployment

## 📋 Troubleshooting Checklist

- [ ] Backend service status is "Running"
- [ ] Backend logs show "Server running on port..."
- [ ] Health endpoint returns `{"success":true}`
- [ ] Environment variables are set correctly
- [ ] No errors in backend logs
- [ ] WebSocket connection test works

## 🚨 Most Common Issues

### Issue 1: Backend Not Running

**Symptoms**: 502 error, no logs

**Solution**:
1. Check Railway dashboard for service status
2. View logs for startup errors
3. Fix errors and redeploy

### Issue 2: Wrong Port

**Symptoms**: Server running on wrong port

**Solution**:
1. Set `PORT=5001` in Railway variables
2. Or use Railway's auto-assigned PORT
3. Redeploy service

### Issue 3: Missing Dependencies

**Symptoms**: `Error: Cannot find module`

**Solution**:
1. Check `package.json` exists
2. Verify dependencies are listed
3. Rebuild service

### Issue 4: MongoDB Connection Failed

**Symptoms**: `MongoDB connection error`

**Solution**:
1. Check `MONGO_URI` is correct
2. Verify MongoDB Atlas allows connections
3. Test MongoDB URI format

## 🎯 Expected Result

After fixing:

1. ✅ Backend service: **"Running"**
2. ✅ Health endpoint: `{"success":true}`
3. ✅ WebSocket: `✅ Connected!`
4. ✅ Frontend can connect
5. ✅ Students can join class

## 📝 Next Steps

1. **Push updated backend code** to GitHub
2. **Railway will auto-deploy**
3. **Check logs** for "Server running"
4. **Test health endpoint**
5. **Test WebSocket connection**
6. **Verify frontend works**

---

**The 502 error means backend isn't running. Fix that first, then WebSocket will work!** 🔧

