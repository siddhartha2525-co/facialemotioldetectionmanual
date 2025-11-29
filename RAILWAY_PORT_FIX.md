# 🔧 Railway Port Configuration Fix

## ❌ Problem Identified

From your Railway logs:
- **Server running on port 808** (likely 8080)
- **Railway expects port 5001**
- **Result**: 502 Bad Gateway error

## 🔍 Root Cause

Railway automatically assigns a port via the `PORT` environment variable. If your code doesn't use this variable, it will use a default port (like 8080), which doesn't match what Railway expects.

## ✅ Solution

### Option 1: Use Railway's PORT Variable (Recommended)

Railway automatically sets the `PORT` environment variable. Your backend should use it:

**Backend Code** (`backend/server.js`):
```javascript
const PORT = process.env.PORT || 5001;
```

This is already correct! ✅

**But**: Make sure Railway's `PORT` variable is set correctly.

### Option 2: Set PORT Environment Variable in Railway

1. **Railway Dashboard** → **Backend Service**
2. **Variables** tab
3. **Check** if `PORT` variable exists:
   - If **NOT set**: Add `PORT=5001`
   - If **set to different value**: Change to `5001`
4. **Save** and **redeploy**

### Option 3: Railway Auto-Detection

Railway should auto-detect the port from:
- `EXPOSE 5001` in Dockerfile ✅ (you have this)
- `PORT` environment variable
- Or use Railway's assigned port

**Important**: Railway may assign a different port. Your code should use `process.env.PORT` which Railway sets automatically.

## 🔧 Fix Steps

### Step 1: Check Current PORT Variable

1. **Railway Dashboard** → **Backend Service** → **Variables**
2. **Look for**: `PORT` variable
3. **Note**: Railway may auto-set this, or you need to set it manually

### Step 2: Update PORT Variable

**If PORT is NOT set**:
- **Add**: `PORT=5001`

**If PORT is set to wrong value**:
- **Change** to: `5001`

**If Railway auto-assigns PORT**:
- **Don't override** - let Railway handle it
- **But**: Make sure your code uses `process.env.PORT` ✅

### Step 3: Verify Code Uses PORT

**Check** `backend/server.js`:
```javascript
const PORT = process.env.PORT || 5001;
```

This should use Railway's PORT if set, or default to 5001.

### Step 4: Redeploy

1. **Save** environment variables
2. **Redeploy** backend service
3. **Check logs** - should show: `🚀 Server running on port 5001`

## 📋 Expected Logs After Fix

```
Starting Container
[dotenv@17.2.3] injecting env...
⚠️ No MONGO_URI provided – Database disabled
🚀 Server running on port 5001  ✅ (Should be 5001, not 808)
```

## 🐛 Common Issues

### Issue: Server Still Running on Wrong Port

**Check**:
1. Environment variable `PORT` is set correctly
2. Code uses `process.env.PORT`
3. No hardcoded port in code

**Solution**:
- Update `PORT` variable in Railway
- Redeploy service

### Issue: Railway Assigns Different Port

**Solution**:
- Railway may assign port dynamically (e.g., 3000, 8080)
- Your code should use `process.env.PORT` (which you already do) ✅
- Railway will route traffic to the correct port automatically

## ✅ Verification

After fixing:

1. **Check logs** - should show port 5001 (or Railway's assigned port)
2. **Test health endpoint**:
   ```bash
   curl https://facialemotioldetectionmanual-production.up.railway.app/api/health
   ```
3. **Should return**: `{"success":true}`

## 📝 Note About MONGO_URI Warning

The warning `⚠️ No MONGO_URI provided – Database disabled` is **not critical** if:
- You're not using the database features
- Or you'll add it later

**To fix** (if needed):
1. **Railway Dashboard** → **Backend Service** → **Variables**
2. **Add**: `MONGO_URI=your_mongodb_uri`
3. **Redeploy**

---

**The main issue is the port mismatch. Fix the PORT variable and redeploy!** 🔧

