# 🔧 Backend Connection Troubleshooting Guide

## ❌ Error: "Failed to connect to server"

If you're seeing connection errors in both teacher and student dashboards, follow these steps:

---

## ✅ Step 1: Verify Backend Service is Running

### In Railway Dashboard:

1. **Go to**: Railway Dashboard
2. **Click** on your **backend service** (e.g., `emotion-backend`)
3. **Check Status**: Should show "Running" ✅
4. **If "Failed" or "Building"**:
   - Click "View Logs"
   - Check for errors
   - Fix errors and redeploy

---

## ✅ Step 2: Test Backend Health Endpoint

### Open in Browser:

```
https://facialemotioldetectionmanual-production.up.railway.app/api/health
```

### Expected Response:

```json
{"success":true,"ts":...}
```

### If Error:

- **404 Not Found**: Backend might not be running or URL is wrong
- **Connection Refused**: Backend service is down
- **Timeout**: Network or firewall issue

---

## ✅ Step 3: Check Backend Logs

### In Railway Dashboard:

1. **Backend Service** → **Deployments** → **View Logs**
2. **Look for**:
   - `✅ MongoDB connected`
   - `🚀 Server running on port 5001`
   - `[socket] connected` (when clients connect)
   - Any error messages

### Common Errors:

- **MongoDB connection failed**: Check `MONGO_URI` environment variable
- **Port already in use**: Check if another service is using port 5001
- **Module not found**: Dependencies not installed correctly

---

## ✅ Step 4: Verify Environment Variables

### Backend Service → Variables:

**Required Variables:**
- `PORT=5001` ✅
- `PY_API=http://python_ai:8000/analyze` (or your Python AI URL) ✅
- `MONGO_URI=your_mongodb_uri` ✅
- `NODE_ENV=production` ✅

**Check**:
- All variables are set correctly
- No typos in variable names
- `PY_API` uses correct service name or URL

---

## ✅ Step 5: Test WebSocket Connection

### Using Browser Console:

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
- Check Railway logs

---

## ✅ Step 6: Check CORS Settings

### Backend Server (`backend/server.js`):

Should have:
```javascript
app.use(cors()); // Allows all origins
const io = new Server(server, { cors: { origin: '*' } });
```

**If CORS is blocking**:
- Check backend logs for CORS errors
- Verify CORS middleware is enabled

---

## ✅ Step 7: Verify Network/Firewall

### Check:

1. **Backend service** is accessible from internet
2. **No firewall** blocking port 443 (HTTPS)
3. **Railway** allows external connections
4. **Domain** is correctly configured

---

## 🐛 Common Issues & Solutions

### Issue 1: Backend Service Not Running

**Solution**:
- Railway Dashboard → Backend Service → Redeploy
- Check logs for startup errors
- Verify environment variables

### Issue 2: Wrong Backend URL

**Solution**:
- Get correct URL from Railway Dashboard
- Update meta tag in HTML files:
  ```html
  <meta name="backend-url" content="https://your-backend.railway.app">
  ```

### Issue 3: WebSocket Upgrade Failing

**Solution**:
- Check if Railway supports WebSocket upgrades
- Try using polling transport:
  ```javascript
  transports: ['polling', 'websocket']
  ```

### Issue 4: Timeout Errors

**Solution**:
- Increase timeout in frontend:
  ```javascript
  timeout: 20000 // 20 seconds
  ```
- Check network connection
- Verify backend is responding

### Issue 5: MongoDB Connection Issues

**Solution**:
- Check `MONGO_URI` is correct
- Verify MongoDB Atlas allows connections from Railway IPs
- Check MongoDB network access settings

---

## 📋 Quick Checklist

- [ ] Backend service is "Running" in Railway
- [ ] Backend health endpoint returns success
- [ ] Environment variables are set correctly
- [ ] Backend logs show no errors
- [ ] WebSocket connection test works
- [ ] CORS is enabled in backend
- [ ] Frontend has correct backend URL in meta tag
- [ ] Network connection is active

---

## 🔍 Debug Steps

1. **Check Backend Health**:
   ```bash
   curl https://facialemotioldetectionmanual-production.up.railway.app/api/health
   ```

2. **Check Backend Logs**:
   - Railway Dashboard → Backend → Logs
   - Look for connection attempts
   - Check for errors

3. **Test WebSocket**:
   - Browser console → Test connection
   - Check for specific error messages

4. **Verify URLs**:
   - Frontend URL: `https://realtimeemotion.up.railway.app`
   - Backend URL: `https://facialemotioldetectionmanual-production.up.railway.app`
   - Should match in meta tags

---

## 🚀 After Fixing

1. **Redeploy** backend service (if needed)
2. **Wait** for deployment to complete
3. **Test** connection from frontend
4. **Check** logs for successful connections
5. **Verify** students can join class

---

**Follow these steps to diagnose and fix connection issues!** 🔧

