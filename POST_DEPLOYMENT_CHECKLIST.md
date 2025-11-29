# ✅ Post-Deployment Checklist - Railway

## 🎉 Deployment Complete!

All 3 services are deployed individually. Now verify and configure them.

---

## 📋 Step 1: Verify All Services Are Running

### In Railway Dashboard:

1. **Check Service Status**:
   - Go to your Railway project
   - You should see 3 services:
     - `emotion-backend` ✅ (should be "Running")
     - `emotion-ai` ✅ (should be "Running")
     - `emotion-frontend` ✅ (should be "Running")

2. **If any service shows "Failed" or "Building"**:
   - Click on the service
   - Check "Deployments" → "View Logs"
   - Look for error messages
   - Fix issues and redeploy

---

## 🔧 Step 2: Verify Environment Variables

### Backend Service (`emotion-backend`):

1. **Click** on `emotion-backend` service
2. **Go to**: "Variables" tab
3. **Verify** these 4 variables exist:
   - ✅ `PORT=5001`
   - ✅ `PY_API=http://emotion-ai:8000/analyze`
   - ✅ `MONGO_URI=mongodb+srv://adeshsiddhartha2005_db:Adesh141@cluster0.ap8scd3.mongodb.net/emotiondb?retryWrites=true&w=majority`
   - ✅ `NODE_ENV=production`

4. **If `PY_API` is wrong**:
   - Update to: `http://emotion-ai:8000/analyze` (if services in same project)
   - Or: `https://emotion-ai.railway.app/analyze` (if using URLs)

### Python AI Service (`emotion-ai`):

1. **Click** on `emotion-ai` service
2. **Go to**: "Variables" tab
3. **Verify**: `PORT=8000` exists

### Frontend Service (`emotion-frontend`):

1. **Click** on `emotion-frontend` service
2. **Variables** (optional): `NODE_ENV=production`

---

## 🌐 Step 3: Get Your Public URLs

### Frontend (Your Main Public URL):

1. **Click** on `emotion-frontend` service
2. **Go to**: "Settings" tab
3. **Scroll** to "Domains" section
4. **Copy** the URL: `https://emotion-frontend.railway.app`
   - 🎉 **This is your public URL!**

### Backend URL (Optional - for testing):

1. **Click** on `emotion-backend` service
2. **Settings** → "Domains" → Generate Domain
3. **Copy** URL: `https://emotion-backend.railway.app`

### Python AI URL (Optional - for testing):

1. **Click** on `emotion-ai` service
2. **Settings** → "Domains" → Generate Domain
3. **Copy** URL: `https://emotion-ai.railway.app`

---

## 🧪 Step 4: Test Your Deployment

### Test 1: Frontend Access

1. **Open browser**: `https://emotion-frontend.railway.app`
2. **Expected**: Login page should load ✅
3. **If error**: Check Railway logs for frontend service

### Test 2: Backend Health Check

```bash
curl https://emotion-backend.railway.app/api/health
```

**Expected response**:
```json
{"success":true,"ts":...}
```

**Or test in browser**: `https://emotion-backend.railway.app/api/health`

### Test 3: Python AI Health Check

```bash
curl https://emotion-ai.railway.app/health
```

**Expected response**:
```json
{"status":"ok","mode":"hybrid",...}
```

**Or test in browser**: `https://emotion-ai.railway.app/health`

### Test 4: Full Application Test

1. **Open**: `https://emotion-frontend.railway.app`
2. **Login** as student (any email/password for demo)
3. **Enter Class ID**: `CLASS1` (or any ID)
4. **Join class**: Should connect ✅
5. **Enable camera**: Should work (HTTPS enables it!) ✅

---

## 🔗 Step 5: Verify Service Connections

### Check Backend → Python AI Connection:

1. **Check Railway logs** for `emotion-backend` service
2. **Look for**: Connection to Python AI
3. **If errors**: Verify `PY_API` environment variable

### Check Frontend → Backend Connection:

1. **Open browser console** (F12) on frontend
2. **Check for**: WebSocket connection errors
3. **Expected**: Connection to backend should succeed

---

## 📱 Step 6: Test from Multiple Devices

### From Your Phone:

1. **Open browser** on phone (any network)
2. **Go to**: `https://emotion-frontend.railway.app`
3. **Login** as student
4. **Enable camera**: Should work! (HTTPS enables it) ✅
5. **Join class**: Should work! ✅

### From Another Laptop:

1. **Open browser** on different laptop (any network)
2. **Go to**: `https://emotion-frontend.railway.app`
3. **Test**: Login, join class, camera access

---

## 🔒 Step 7: MongoDB Atlas Configuration

### Ensure MongoDB Allows Railway:

1. **Go to**: https://www.mongodb.com/cloud/atlas
2. **Network Access** → Check if `0.0.0.0/0` is allowed
3. **If not**: Add IP Address → "Allow Access from Anywhere"
4. **This allows** Railway servers to connect

---

## 🐛 Step 8: Troubleshooting

### Issue: Frontend can't connect to backend

**Check**:
1. Backend service is running
2. Backend URL is correct
3. Frontend code uses correct backend URL
4. Check browser console for errors

**Solution**: 
- Update frontend to use backend's Railway URL
- Or use service name if in same project

### Issue: Backend can't connect to Python AI

**Check**:
1. Python AI service is running
2. `PY_API` environment variable is correct
3. Service names match: `emotion-ai`

**Solution**:
- Update `PY_API` to: `http://emotion-ai:8000/analyze`
- Or use full URL: `https://emotion-ai.railway.app/analyze`

### Issue: Services show "Failed"

**Check**:
1. Railway logs for each service
2. Root Directory is set correctly
3. Dockerfile exists in each directory
4. Environment variables are set

**Solution**:
- Fix errors in logs
- Verify Root Directory
- Rebuild service

---

## ✅ Success Checklist

After completing all steps:

- [ ] All 3 services running in Railway
- [ ] Environment variables set correctly
- [ ] Frontend accessible: `https://emotion-frontend.railway.app`
- [ ] Backend health check works
- [ ] Python AI health check works
- [ ] Can login from frontend
- [ ] Can join class
- [ ] Camera works on mobile (HTTPS!)
- [ ] Tested from phone (different network)
- [ ] MongoDB Atlas allows all IPs

---

## 🎉 You're Live!

Your app is now accessible from:
- ✅ **Any device** (phone, laptop, tablet)
- ✅ **Any network** (WiFi, mobile data)
- ✅ **Anywhere in the world**
- ✅ **HTTPS included** (camera works!)

**Public URL**: `https://emotion-frontend.railway.app`

**Share this URL** with students and teachers! 🌍

---

## 📊 Monitoring

### Check Service Health:

- **Railway Dashboard**: View service status
- **Logs**: Check for errors
- **Metrics**: Monitor resource usage

### Update Services:

- **Code changes**: Push to GitHub → Railway auto-deploys
- **Environment variables**: Update in Railway dashboard
- **Redeploy**: Click "Redeploy" in Railway

---

**Follow this checklist to verify your deployment is working correctly!** ✅

