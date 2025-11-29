# 🔧 Railway Backend URL Setup - Fix Connection Issues

## ❌ Problem

Your Railway frontend is using a custom domain (e.g., `realtimeemotion.up.railway.app`) that doesn't match the expected pattern, so the backend URL cannot be auto-detected.

**Error**: "Failed to connect to server" with backend URL showing the same as frontend URL.

---

## ✅ Solution: Set Backend URL Manually

You need to tell the frontend where your backend service is located.

### Step 1: Get Your Backend URL

1. **Go to Railway Dashboard**
2. **Click** on your **backend service** (e.g., `emotion-backend`)
3. **Go to**: "Settings" tab
4. **Scroll** to "Domains" section
5. **Copy** the URL: `https://your-backend-service.railway.app`
   - Example: `https://emotion-backend-production.up.railway.app`
   - ⚠️ **Important**: Copy the FULL URL including `https://`

### Step 2: Set Backend URL in Frontend

You have **3 options** to set the backend URL:

---

## 🎯 Option 1: Meta Tag (Recommended)

### Update HTML Files

**File 1**: `frontend/student/dashboard.html`

Find this line (around line 5):
```html
<meta name="backend-url" content="" id="backendUrlMeta">
```

**Change to**:
```html
<meta name="backend-url" content="https://your-backend-service.railway.app" id="backendUrlMeta">
```

**File 2**: `frontend/student/teacher/dashboard.html`

Find the same meta tag and update it:
```html
<meta name="backend-url" content="https://your-backend-service.railway.app" id="backendUrlMeta">
```

**File 3**: `frontend/index.html` (if it has dashboard scripts)

---

## 🎯 Option 2: Railway Environment Variable (Advanced)

1. **Go to Railway Dashboard**
2. **Click** on your **frontend service**
3. **Go to**: "Variables" tab
4. **Click**: "New Variable"
5. **Add**:
   - **Key**: `EMOTION_BACKEND_URL`
   - **Value**: `https://your-backend-service.railway.app`
6. **Save**

Then update your frontend Dockerfile to inject this:

**`frontend/Dockerfile`**:
```dockerfile
FROM nginx:stable-alpine

# Copy files
COPY . /usr/share/nginx/html

# Inject backend URL into HTML files (if env var is set)
RUN if [ -n "$EMOTION_BACKEND_URL" ]; then \
    find /usr/share/nginx/html -name "*.html" -type f -exec sed -i "s|<meta name=\"backend-url\" content=\"\"|<meta name=\"backend-url\" content=\"$EMOTION_BACKEND_URL\"|g" {} \; ; \
    fi

EXPOSE 80
```

**Then in Railway**:
- Frontend service → Variables → Add `EMOTION_BACKEND_URL`
- Redeploy frontend service

---

## 🎯 Option 3: Script Tag (Quick Fix)

Add this to your HTML files **before** the dashboard.js script:

**`frontend/student/dashboard.html`**:
```html
<script>
    window.EMOTION_BACKEND_URL = "https://your-backend-service.railway.app";
</script>
<script src="dashboard.js"></script>
```

**`frontend/student/teacher/dashboard.html`**:
```html
<script>
    window.EMOTION_BACKEND_URL = "https://your-backend-service.railway.app";
</script>
<script src="dashboard.js"></script>
```

---

## 📋 Quick Steps (Recommended: Option 1)

1. **Get backend URL** from Railway dashboard
2. **Update** `frontend/student/dashboard.html` - add backend URL to meta tag
3. **Update** `frontend/student/teacher/dashboard.html` - add backend URL to meta tag
4. **Push to GitHub**: `git add . && git commit -m "Set backend URL" && git push`
5. **Wait** for Railway to auto-deploy (2-3 minutes)
6. **Test** from phone again

---

## ✅ Verification

After setting the backend URL:

1. **Open** frontend on phone: `https://realtimeemotion.up.railway.app`
2. **Open browser console** (if possible)
3. **Look for**: `✅ Using backend URL from meta tag: https://your-backend.railway.app`
4. **Should connect** successfully ✅

---

## 🐛 Troubleshooting

### Still Can't Connect?

**Check 1: Backend URL is Correct**
- Open browser console
- Look for: `🔗 Backend URL: https://...`
- Should be your backend service URL, NOT frontend URL

**Check 2: Backend Service is Running**
- Railway Dashboard → Backend service → Should be "Running"
- Check logs for errors

**Check 3: Backend Health Check**
- Open: `https://your-backend-service.railway.app/api/health`
- Should return: `{"success":true,...}`

**Check 4: CORS Issues**
- Backend must allow requests from frontend domain
- Check backend CORS settings

---

## 📝 Example

**Your Setup**:
- Frontend: `https://realtimeemotion.up.railway.app`
- Backend: `https://emotion-backend-production.up.railway.app`

**Update**:
```html
<meta name="backend-url" content="https://emotion-backend-production.up.railway.app" id="backendUrlMeta">
```

**Result**: Frontend will connect to backend successfully! ✅

---

## 🚀 After Fix

1. **Push changes** to GitHub
2. **Railway auto-deploys** frontend
3. **Test** from phone
4. **Should work** now! ✅

---

**Follow these steps to fix the connection issue!** 🔧

