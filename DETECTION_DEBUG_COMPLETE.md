# 🔧 Detection Not Working - Complete Debug Guide

## ⚠️ Current Issues

1. **MONGO_URI Warning**: `No MONGO_URI provided — Database disabled`
   - **Status**: ⚠️ Warning (not critical - app works without DB)
   - **Fix**: Optional - add MONGO_URI if you want database features

2. **Detection Not Working**: ❌ Main issue to fix

---

## 🔍 Step-by-Step Debug Process

### Step 1: Verify PY_API is Set Correctly

**Railway Dashboard** → **Backend Service** → **Variables**

**Check**:
- ✅ `PY_API` variable exists
- ✅ Value is: `https://renewed-grace-production.up.railway.app/analyze`
- ✅ Uses `https://` (not `http://`)
- ✅ Includes `/analyze` at the end

**If wrong**: Fix it and redeploy

---

### Step 2: Verify Python AI Service is Running

**Railway Dashboard** → **Python AI Service** (`renewed-grace-production`)

**Check**:
- ✅ Status is "Running"
- ✅ Health endpoint works: `https://renewed-grace-production.up.railway.app/health`

**Test**:
```bash
curl https://renewed-grace-production.up.railway.app/health
```

**Expected**: `{"status":"ok",...}`

---

### Step 3: Check Backend Logs for Errors

**Railway Dashboard** → **Backend Service** → **Deployments** → **View Logs**

**Look for**:

#### ✅ Good Signs:
```
[processSnapshot] Processing snapshot for student...
[processSnapshot] AI server response received
```

#### ❌ Bad Signs:
```
[processSnapshot] AI server error: ECONNREFUSED
[processSnapshot] AI server error: timeout
Error: connect ECONNREFUSED
```

**If you see errors**: Note the exact error message

---

### Step 4: Check Python AI Logs

**Railway Dashboard** → **Python AI Service** → **Deployments** → **View Logs**

**Look for**:
- Analyze requests received
- Emotion detection results
- Any errors

**If no requests**: Backend is not reaching Python AI

---

### Step 5: Verify Detection Flow

#### Teacher Side:
1. **Teacher Dashboard** → Click "Start Detection"
2. **Button changes** to "Stop Detection" ✅
3. **Check console** (F12) → Should see: `Detection started for class: CLASS1`

#### Student Side:
1. **Student Dashboard** → Enable camera
2. **Join class** with Class ID
3. **After teacher starts detection** → Should see: "Detection Active"
4. **Check console** (F12) → Should see: `Sending snapshot` messages

---

### Step 6: Test Python AI Connection from Backend

**Backend should be able to reach Python AI**. If not, check:

1. **PY_API URL is correct**
2. **Python AI service is running**
3. **No network/firewall blocking**

---

## 🔧 Common Fixes

### Fix 1: PY_API Not Set or Wrong

**Problem**: Backend can't reach Python AI

**Solution**:
1. Railway Dashboard → Backend Service → Variables
2. Set `PY_API` = `https://renewed-grace-production.up.railway.app/analyze`
3. Save and redeploy

### Fix 2: Python AI Service Not Running

**Problem**: Python AI is down

**Solution**:
1. Railway Dashboard → Python AI Service
2. Check status - should be "Running"
3. If "Failed", check logs and fix errors
4. Redeploy if needed

### Fix 3: Teacher Didn't Start Detection

**Problem**: Detection not activated

**Solution**:
1. Teacher clicks "Start Detection" button
2. Verify button changes to "Stop Detection"
3. Students should receive `detection_started` event

### Fix 4: Student Camera Not Enabled

**Problem**: No video feed to analyze

**Solution**:
1. Student clicks "Enable Camera"
2. Allow camera permissions
3. Camera should show in video element

### Fix 5: Detection Started Before Student Joined

**Problem**: Student missed the event

**Solution**:
1. Teacher stops detection
2. Teacher starts detection again
3. All students should receive event

### Fix 6: Backend Can't Connect to Python AI

**Problem**: Network/connection issue

**Check**:
- PY_API URL is correct
- Python AI service is accessible
- No CORS or firewall issues

**Solution**:
- Verify PY_API uses `https://` (not `http://`)
- Test Python AI health endpoint
- Check Railway service networking

---

## 📋 Complete Checklist

- [ ] PY_API is set to: `https://renewed-grace-production.up.railway.app/analyze`
- [ ] Python AI service is "Running"
- [ ] Python AI health endpoint works
- [ ] Teacher clicked "Start Detection"
- [ ] Student joined class
- [ ] Student enabled camera
- [ ] Student sees "Detection Active" status
- [ ] Backend logs show snapshot processing
- [ ] Python AI logs show analyze requests
- [ ] No errors in backend logs
- [ ] No errors in Python AI logs

---

## 🧪 Manual Test

### Test 1: Python AI Health
```bash
curl https://renewed-grace-production.up.railway.app/health
```
**Expected**: `{"status":"ok",...}`

### Test 2: Backend Health
```bash
curl https://facialemotioldetectionmanual-production.up.railway.app/api/health
```
**Expected**: `{"success":true}`

### Test 3: Detection Flow
1. Teacher: Start Detection
2. Student: Enable camera, join class
3. Check backend logs for `[processSnapshot]`
4. Check Python AI logs for analyze requests

---

## 🎯 Expected Flow

1. **Teacher**: Clicks "Start Detection"
2. **Backend**: Sets `detectionActive[classId] = true`
3. **Backend**: Emits `detection_started` to all students
4. **Student**: Receives event → Sets `detectionEnabled = true`
5. **Student**: Starts sending snapshots every 1.2 seconds
6. **Backend**: Receives snapshot → Calls Python AI
7. **Python AI**: Analyzes image → Returns emotion
8. **Backend**: Processes result → Emits `emotion_update`
9. **Teacher**: Receives update → Shows emotion

---

## 🚨 Most Likely Issues

1. **PY_API not set correctly** → Check backend variables
2. **Python AI service not running** → Check Python AI status
3. **Teacher didn't start detection** → Click "Start Detection"
4. **Backend can't reach Python AI** → Check PY_API URL format

---

## 📝 About MONGO_URI Warning

**Warning**: `No MONGO_URI provided — Database disabled`

**Status**: ⚠️ **Not Critical**

**Meaning**: App works without database. Emotions are still detected and shown in real-time.

**To Fix** (optional):
1. Railway Dashboard → Backend Service → Variables
2. Add `MONGO_URI` = `your_mongodb_uri`
3. Redeploy

**Note**: Detection works without database. Database is only for storing historical data.

---

## 🔧 Quick Action Plan

**Right Now**:
1. ✅ Verify PY_API is set correctly
2. ✅ Check Python AI service is running
3. ✅ Teacher clicks "Start Detection"
4. ✅ Student enables camera
5. ✅ Check backend logs for errors
6. ✅ Check Python AI logs for requests

---

**Follow this guide to debug and fix detection issues!** 🔧

