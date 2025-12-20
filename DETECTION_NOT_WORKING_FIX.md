# 🔧 Detection Not Working - Fix Guide

## ❌ Problem

After joining the class, emotion detection is not working.

## 🔍 Root Causes

### Issue 1: Teacher Didn't Start Detection

**Check**: Did the teacher click "Start Detection" button?

**Solution**: 
- Teacher must click "Start Detection" button in teacher dashboard
- Students will only send snapshots after detection is started

### Issue 2: Python AI Service Not Configured

**Problem**: Backend can't reach Python AI service

**Check**: Railway Dashboard → Backend Service → Variables → `PY_API`

**Current Value**: Should be your Python AI service URL

**For Railway**:
- If Python AI service is in same project: `http://python_ai:8000/analyze` (service name)
- If Python AI service is separate: `https://your-python-ai-service.railway.app/analyze` (full URL)

### Issue 3: Python AI Service Not Running

**Check**: Railway Dashboard → Python AI Service → Status

**Should be**: "Running"

**If "Failed"**: Check logs and fix errors

### Issue 4: Student Camera Not Enabled

**Check**: Student must enable camera before detection works

**Solution**: Student clicks "Enable Camera" button

### Issue 5: Detection Not Started by Teacher

**Check**: Teacher dashboard → "Start Detection" button clicked?

**Solution**: Teacher must click "Start Detection" button

---

## ✅ Step-by-Step Fix

### Step 1: Verify Teacher Started Detection

1. **Teacher Dashboard** → Click "Start Detection" button
2. **Button should change** to "Stop Detection"
3. **Students should see**: "Detection Active" status

### Step 2: Check Python AI Service

1. **Railway Dashboard** → Find Python AI service
2. **Check Status**: Should be "Running"
3. **If "Failed"**: View logs and fix errors
4. **Get Python AI URL**: Settings → Domains → Copy URL

### Step 3: Configure Backend PY_API

1. **Railway Dashboard** → Backend Service → Variables
2. **Find** `PY_API` variable
3. **Set** to your Python AI service URL:
   - **Option A** (same project): `http://python_ai:8000/analyze`
   - **Option B** (separate service): `https://your-python-ai-service.railway.app/analyze`
4. **Save** (Railway auto-redeploys)

### Step 4: Verify Student Camera

1. **Student Dashboard** → Click "Enable Camera"
2. **Camera should show** in video element
3. **Status should show**: "Camera enabled ✓"

### Step 5: Test Detection Flow

1. **Teacher**: Click "Start Detection"
2. **Student**: Should see "Detection Active"
3. **Check backend logs**: Should show snapshot processing
4. **Check Python AI logs**: Should show analyze requests
5. **Teacher dashboard**: Should show student emotions

---

## 🧪 Debug Steps

### Check Backend Logs

**Railway Dashboard** → Backend Service → Logs

**Look for**:
- `[start_detection] Detection started for CLASS1`
- `[processSnapshot]` messages
- `[processSnapshot] AI server error` (if Python AI fails)

### Check Python AI Logs

**Railway Dashboard** → Python AI Service → Logs

**Look for**:
- Analyze requests received
- Emotion detection results
- Any errors

### Check Student Console

**Student Dashboard** → Browser Console (F12)

**Look for**:
- `✅ Detection Active` message
- `Sending snapshot` messages
- Any errors

### Check Teacher Console

**Teacher Dashboard** → Browser Console (F12)

**Look for**:
- `Detection started for class: CLASS1`
- `emotion_update` events received
- Any errors

---

## 🔧 Common Fixes

### Fix 1: PY_API Wrong URL

**Problem**: Backend can't reach Python AI

**Solution**:
1. Get Python AI service URL from Railway
2. Set `PY_API` to full URL: `https://your-python-ai.railway.app/analyze`
3. Redeploy backend

### Fix 2: Python AI Service Not Running

**Problem**: Python AI service crashed

**Solution**:
1. Check Python AI logs for errors
2. Fix errors (missing dependencies, etc.)
3. Redeploy Python AI service

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

**Problem**: Student missed detection_started event

**Solution**:
1. Teacher stops detection
2. Teacher starts detection again
3. All students should receive event

---

## 📋 Complete Checklist

- [ ] Teacher clicked "Start Detection" button
- [ ] Student joined class successfully
- [ ] Student enabled camera
- [ ] Student sees "Detection Active" status
- [ ] Python AI service is running
- [ ] PY_API is set correctly in backend
- [ ] Backend logs show snapshot processing
- [ ] Python AI logs show analyze requests
- [ ] Teacher dashboard shows student emotions

---

## 🎯 Expected Flow

1. **Teacher**: Joins class → Clicks "Start Detection"
2. **Backend**: Emits `detection_started` to all students
3. **Student**: Receives event → Starts sending snapshots
4. **Backend**: Receives snapshots → Calls Python AI
5. **Python AI**: Analyzes image → Returns emotion
6. **Backend**: Processes result → Emits `emotion_update`
7. **Teacher**: Receives update → Shows emotion in dashboard

---

## 🚨 Most Likely Issues

1. **PY_API not set correctly** → Check backend variables
2. **Python AI service not running** → Check Python AI status
3. **Teacher didn't start detection** → Click "Start Detection"
4. **Student camera not enabled** → Enable camera first

---

**Follow these steps to fix detection issues!** 🔧

