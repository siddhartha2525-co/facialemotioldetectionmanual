# ✅ Railway Backend Verification Guide

## 🔍 Complete Backend Service Check

Follow these steps to verify your backend service is working correctly.

---

## 1️⃣ Check Backend Service Status in Railway

### Steps:

1. **Go to Railway Dashboard**: https://railway.app
2. **Click** on your project
3. **Find** your backend service (e.g., `emotion-backend` or `backend`)
4. **Check Status**:
   - ✅ **"Running"** = Service is active
   - ❌ **"Failed"** = Service has errors (check logs)
   - ⏳ **"Building"** = Service is deploying
   - ⏸️ **"Stopped"** = Service is not running

### If Status is "Failed":

1. **Click** on the service
2. **Go to**: "Deployments" tab
3. **Click**: "View Logs"
4. **Look for** error messages
5. **Fix errors** and redeploy

---

## 2️⃣ Test Backend Health Endpoint

### Method 1: Browser Test

**Open in browser**:
```
https://facialemotioldetectionmanual-production.up.railway.app/api/health
```

**Expected Response**:
```json
{"success":true,"ts":1234567890}
```

**If Error**:
- **404 Not Found**: Backend might not be running or route doesn't exist
- **Connection Refused**: Backend service is down
- **Timeout**: Network or firewall issue
- **502 Bad Gateway**: Backend crashed or not responding

### Method 2: Command Line Test

**Run**:
```bash
curl https://facialemotioldetectionmanual-production.up.railway.app/api/health
```

**Or use the verification script**:
```bash
./verify_backend.sh
```

---

## 3️⃣ Check Backend Logs for Errors

### Steps:

1. **Railway Dashboard** → **Backend Service**
2. **Click**: "Deployments" tab
3. **Click**: "View Logs" (or latest deployment)
4. **Look for**:

### ✅ Good Signs:

```
🚀 Server running on port 5001
✅ MongoDB connected
[socket] connected <socket-id>
```

### ❌ Error Signs:

```
❌ MongoDB connection error: ...
Error: Cannot find module '...'
Port 5001 already in use
ECONNREFUSED
```

### Common Errors:

**MongoDB Connection Failed**:
```
❌ MongoDB connection error: ...
```
**Solution**: Check `MONGO_URI` environment variable

**Module Not Found**:
```
Error: Cannot find module 'express'
```
**Solution**: Dependencies not installed - check `package.json` and rebuild

**Port Already in Use**:
```
Error: Port 5001 already in use
```
**Solution**: Check if another service is using port 5001

**Python AI Connection Failed**:
```
Error: connect ECONNREFUSED
```
**Solution**: Check `PY_API` environment variable

---

## 4️⃣ Verify Environment Variables

### Required Variables:

Go to **Railway Dashboard** → **Backend Service** → **Variables** tab

**Check these 4 variables exist**:

1. **PORT**
   - **Value**: `5001`
   - **Required**: Yes
   - **Purpose**: Server port

2. **PY_API**
   - **Value**: `http://python_ai:8000/analyze` (if services in same project)
   - **Or**: `https://your-python-ai-service.railway.app/analyze` (if separate)
   - **Required**: Yes
   - **Purpose**: Python AI service URL

3. **MONGO_URI**
   - **Value**: `mongodb+srv://username:password@cluster0....emotiondb?retryWrites=true&w=majority`
   - **Required**: Yes (if using database)
   - **Purpose**: MongoDB connection string

4. **NODE_ENV**
   - **Value**: `production`
   - **Required**: Recommended
   - **Purpose**: Environment mode

### How to Set/Update Variables:

1. **Railway Dashboard** → **Backend Service**
2. **Click**: "Variables" tab
3. **Click**: "New Variable" (or edit existing)
4. **Enter**: Key and Value
5. **Save**
6. **Redeploy** service (Railway auto-redeploys on variable change)

---

## 5️⃣ Test WebSocket Connection

### Browser Console Test:

1. **Open** frontend in browser
2. **Open** browser console (F12)
3. **Run**:
   ```javascript
   const socket = io('wss://facialemotioldetectionmanual-production.up.railway.app');
   socket.on('connect', () => console.log('✅ Connected!'));
   socket.on('connect_error', (err) => console.error('❌ Error:', err));
   ```

### Expected:
- `✅ Connected!` in console

### If Error:
- Check error message
- Verify backend URL is correct
- Check Railway logs for WebSocket errors

---

## 6️⃣ Complete Verification Checklist

- [ ] Backend service status is "Running" in Railway
- [ ] Health endpoint returns `{"success":true}`
- [ ] Backend logs show "Server running on port 5001"
- [ ] Backend logs show "MongoDB connected" (if using DB)
- [ ] All 4 environment variables are set correctly
- [ ] WebSocket connection test works
- [ ] No errors in backend logs
- [ ] Frontend can connect to backend

---

## 🐛 Troubleshooting Common Issues

### Issue: Backend Status Shows "Failed"

**Check**:
1. View logs for error messages
2. Verify environment variables are set
3. Check if dependencies are installed
4. Verify MongoDB URI is correct (if using DB)

**Solution**:
- Fix errors in logs
- Update environment variables
- Redeploy service

### Issue: Health Endpoint Returns 404

**Check**:
1. Backend service is running
2. Route `/api/health` exists in `backend/server.js`
3. Backend URL is correct

**Solution**:
- Verify backend is running
- Check server.js for health route
- Test with correct URL

### Issue: Connection Timeout

**Check**:
1. Backend service is running
2. Network connection is active
3. Firewall is not blocking

**Solution**:
- Verify backend status
- Check network connection
- Test from different network

### Issue: MongoDB Connection Failed

**Check**:
1. `MONGO_URI` environment variable is set
2. MongoDB Atlas allows connections from Railway IPs
3. MongoDB URI is correct format

**Solution**:
- Update `MONGO_URI` in Railway
- Check MongoDB Atlas network access (allow 0.0.0.0/0)
- Verify URI format

---

## 📋 Quick Reference

**Backend URL**: `https://facialemotioldetectionmanual-production.up.railway.app`

**Health Endpoint**: `https://facialemotioldetectionmanual-production.up.railway.app/api/health`

**WebSocket URL**: `wss://facialemotioldetectionmanual-production.up.railway.app`

**Required Variables**:
- `PORT=5001`
- `PY_API=http://python_ai:8000/analyze`
- `MONGO_URI=your_mongodb_uri`
- `NODE_ENV=production`

---

## 🚀 After Verification

If all checks pass:

1. ✅ Backend is running correctly
2. ✅ Frontend should be able to connect
3. ✅ Students should be able to join class
4. ✅ Teacher dashboard should work

If any check fails:

1. ❌ Fix the issue
2. ❌ Redeploy backend service
3. ❌ Test again
4. ❌ Check logs for errors

---

**Follow this guide to verify your backend service is working correctly!** ✅

