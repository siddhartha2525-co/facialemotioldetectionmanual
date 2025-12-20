# 🚨 Backend Emergency Fix - Step by Step

## ❌ Current Error

**Error**: `websocket error`  
**Backend URL**: `https://facialemotioldetectionmanual-production.up.railway.app`  
**Status**: 502 Bad Gateway - **Backend is NOT responding**

## 🎯 Root Cause

The backend service is either:
1. **Not deployed** in Railway
2. **Not running** (crashed or stopped)
3. **Running on wrong port**
4. **Has startup errors**

## ✅ Complete Fix Process

### STEP 1: Verify Backend Service Exists

**Go to Railway Dashboard**:
1. https://railway.app
2. **Click** on your project
3. **Look for** a service with URL: `facialemotioldetectionmanual-production.up.railway.app`
4. **Or** look for service named: `backend`, `emotion-backend`, or similar

**If you CAN'T find it**:
- **Backend service doesn't exist** → Go to STEP 5 (Create Backend Service)

**If you FIND it**:
- **Continue to STEP 2**

---

### STEP 2: Check Backend Service Status

**Click on the backend service**:

**Status Options**:
- ✅ **"Running"** → Go to STEP 3 (Check Logs)
- ❌ **"Failed"** → Go to STEP 4 (Fix Errors)
- ⏳ **"Building"** → Wait 2-3 minutes, then check again
- ⏸️ **"Stopped"** → Click "Start" or "Redeploy"

---

### STEP 3: Check Backend Logs (If Status is "Running")

**Railway Dashboard** → **Backend Service** → **Deployments** → **View Logs**

**Look for these messages**:

#### ✅ Good Signs:
```
🚀 Server running on port 5001
📡 Socket.io ready for connections
✅ MongoDB connected (if using DB)
```

#### ❌ Bad Signs:
```
Error: Cannot find module 'express'
Port already in use
ECONNREFUSED
❌ MongoDB connection error
```

**If you see errors** → Go to STEP 4 (Fix Errors)

**If logs look good but still 502** → Go to STEP 6 (Port Configuration)

---

### STEP 4: Fix Errors in Logs

#### Error 1: "Cannot find module"

**Problem**: Dependencies not installed

**Fix**:
1. **Railway Dashboard** → **Backend Service** → **Settings**
2. **Check** "Root Directory" = `backend`
3. **Verify** `package.json` exists in backend folder
4. **Redeploy** service

#### Error 2: "Port already in use"

**Problem**: Port conflict

**Fix**:
1. **Railway Dashboard** → **Backend Service** → **Variables**
2. **Set** `PORT=5001` (or remove PORT variable to use Railway's auto-assigned port)
3. **Redeploy** service

#### Error 3: "MongoDB connection error"

**Problem**: Database connection failed

**Fix**:
1. **Railway Dashboard** → **Backend Service** → **Variables**
2. **Check** `MONGO_URI` is correct
3. **Verify** MongoDB Atlas allows connections (0.0.0.0/0)
4. **Redeploy** service

#### Error 4: Service keeps crashing

**Problem**: Startup error

**Fix**:
1. **Check logs** for specific error
2. **Fix** the error (missing file, wrong config, etc.)
3. **Redeploy** service

---

### STEP 5: Create Backend Service (If It Doesn't Exist)

**If backend service doesn't exist in Railway**:

1. **Railway Dashboard** → **New** → **GitHub Repo**
2. **Select** your repository: `facialemotioldetectionmanual`
3. **After deployment starts**, click on the service
4. **Settings** → **Root Directory** → Set to: `backend`
5. **Variables** → **Add these**:
   - `PORT=5001`
   - `PY_API=http://python_ai:8000/analyze` (or your Python AI URL)
   - `MONGO_URI=your_mongodb_uri` (optional)
   - `NODE_ENV=production`
6. **Save** and **wait for deployment** (2-3 minutes)
7. **Check logs** → Should show: `🚀 Server running on port 5001`

---

### STEP 6: Verify Port Configuration

**Railway Dashboard** → **Backend Service** → **Variables**

**Check**:
- `PORT` variable exists
- Value is `5001` (or Railway's auto-assigned port)

**If PORT is wrong**:
1. **Edit** `PORT` variable
2. **Set** to `5001`
3. **Save** (Railway auto-redeploys)

**If PORT doesn't exist**:
1. **Add** `PORT=5001`
2. **Save** (Railway auto-redeploys)

---

### STEP 7: Test Backend Health

**After fixing**, test:

```bash
curl https://facialemotioldetectionmanual-production.up.railway.app/api/health
```

**Expected**: `{"success":true}`

**If still 502**:
- Backend still not running
- Check logs again
- Verify service status

---

### STEP 8: Verify WebSocket Connection

**After health endpoint works**, test WebSocket:

**Browser Console**:
```javascript
const socket = io('wss://facialemotioldetectionmanual-production.up.railway.app');
socket.on('connect', () => console.log('✅ Connected!'));
socket.on('connect_error', (err) => console.error('❌ Error:', err));
```

**Expected**: `✅ Connected!`

---

## 📋 Complete Checklist

- [ ] Backend service exists in Railway
- [ ] Backend service status is "Running"
- [ ] Backend logs show "Server running on port..."
- [ ] PORT environment variable is set (5001 or Railway's port)
- [ ] PY_API environment variable is set
- [ ] MONGO_URI is set (if using DB)
- [ ] No errors in backend logs
- [ ] Health endpoint returns `{"success":true}`
- [ ] WebSocket connection test works

---

## 🚨 Most Common Issues

### Issue 1: Backend Service Not Deployed

**Solution**: Create backend service (STEP 5)

### Issue 2: Wrong Root Directory

**Solution**: Set Root Directory = `backend` in Railway settings

### Issue 3: Missing Environment Variables

**Solution**: Add all required variables (STEP 6)

### Issue 4: Service Crashed on Startup

**Solution**: Check logs, fix errors, redeploy (STEP 4)

---

## 🎯 Expected Result

After completing all steps:

1. ✅ Backend service: **"Running"**
2. ✅ Health endpoint: `{"success":true}`
3. ✅ WebSocket: `✅ Connected!`
4. ✅ Teacher dashboard: **Connects successfully**
5. ✅ Students: **Can join class**

---

## 📞 Quick Action Plan

**Right Now**:
1. **Go to Railway Dashboard**
2. **Find backend service** (or create it)
3. **Check status** - is it "Running"?
4. **View logs** - any errors?
5. **Fix errors** found in logs
6. **Set PORT=5001** in variables
7. **Redeploy** if needed
8. **Test health endpoint**
9. **Test WebSocket connection**

---

**Follow these steps in order. The backend MUST be running for the app to work!** 🔧

