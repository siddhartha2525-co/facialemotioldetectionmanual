# ✅ Set PY_API for Railway - Python AI URL

## 🎯 Your Python AI Service URL

**Python AI URL**: `renewed-grace-production.up.railway.app`

## 🔧 Step-by-Step: Configure Backend PY_API

### Step 1: Go to Railway Dashboard

1. **Open**: https://railway.app
2. **Click** on your project
3. **Find** your **backend service** (`facialemotioldetectionmanual-production`)

### Step 2: Set PY_API Variable

1. **Click** on backend service
2. **Go to**: "Variables" tab
3. **Find** `PY_API` variable:
   - **If it exists**: Click to edit
   - **If it doesn't exist**: Click "New Variable"

### Step 3: Set the Value

**Set PY_API to**:
```
https://renewed-grace-production.up.railway.app/analyze
```

**Important**: 
- Use `https://` (not `http://`)
- Include `/analyze` at the end
- Full URL: `https://renewed-grace-production.up.railway.app/analyze`

### Step 4: Save

1. **Click** "Save" or "Add"
2. **Railway will auto-redeploy** the backend service
3. **Wait** 2-3 minutes for deployment

### Step 5: Verify

1. **Check backend logs** after redeploy
2. **Look for**: No Python AI connection errors
3. **Test detection**: Teacher starts detection → Should work now

---

## 📋 Complete PY_API Configuration

**Variable Name**: `PY_API`  
**Variable Value**: `https://renewed-grace-production.up.railway.app/analyze`

**Location**: Railway Dashboard → Backend Service → Variables

---

## ✅ Expected Result

After setting PY_API:

1. ✅ Backend can connect to Python AI
2. ✅ Detection requests are sent to Python AI
3. ✅ Emotions are detected and returned
4. ✅ Teacher dashboard shows student emotions

---

## 🧪 Test Python AI Service

**Before setting PY_API**, verify Python AI is working:

```bash
curl https://renewed-grace-production.up.railway.app/health
```

**Expected**: `{"status":"ok",...}`

**If error**: Python AI service might not be running - check Railway dashboard

---

## 🔍 Verify After Setting

**Backend Logs** (after redeploy):
- Should NOT show: `ECONNREFUSED` or connection errors
- Should show: Successful snapshot processing

**Python AI Logs**:
- Should show: Analyze requests received
- Should show: Emotion detection results

---

## 📝 Summary

1. **Railway Dashboard** → Backend Service → Variables
2. **Set** `PY_API` = `https://renewed-grace-production.up.railway.app/analyze`
3. **Save** and wait for redeploy
4. **Test detection** - should work now! ✅

---

**Set this variable and detection will work!** 🔧

