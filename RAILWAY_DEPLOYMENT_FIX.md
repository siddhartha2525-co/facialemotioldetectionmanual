# 🔧 Railway Deployment Fix - docker-compose Error

## ❌ Problem

Railway error: `The executable 'docker-compose' could not be found.`

**Root Cause**: Railway doesn't run `docker-compose` commands. It needs services deployed individually.

## ✅ Solution: Deploy Services Separately

Railway works best when you deploy each service as a **separate service**, not using docker-compose.

### Option 1: Deploy Services Individually (Recommended)

Instead of deploying docker-compose.yml, deploy each service separately:

#### Step 1: Deploy Backend Service

1. In Railway dashboard, click **"New"** → **"GitHub Repo"**
2. Select your repository: `facialemotioldetectionmanual`
3. Railway will ask: **"Configure Service"**
4. **Root Directory**: Set to `backend`
5. **Build Command**: Leave empty (uses Dockerfile)
6. **Start Command**: Leave empty (uses Dockerfile CMD)
7. **Name**: `emotion-backend`

#### Step 2: Deploy Python AI Service

1. Click **"New"** → **"GitHub Repo"** (in same project)
2. Select same repository: `facialemotioldetectionmanual`
3. **Root Directory**: Set to `python-ai`
4. **Name**: `emotion-ai`

#### Step 3: Deploy Frontend Service

1. Click **"New"** → **"GitHub Repo"** (in same project)
2. Select same repository: `facialemotioldetectionmanual`
3. **Root Directory**: Set to `frontend`
4. **Name**: `emotion-frontend`

#### Step 4: Configure Service URLs

Railway will give each service its own URL. You need to:

1. **Backend Service**:
   - Get its URL: `https://emotion-backend.railway.app`
   - Note this URL

2. **Python AI Service**:
   - Get its URL: `https://emotion-ai.railway.app`
   - Note this URL

3. **Frontend Service**:
   - Get its URL: `https://emotion-frontend.railway.app`
   - This will be your main public URL

#### Step 5: Update Environment Variables

**Backend Service Variables:**
```
PORT=5001
PY_API=https://emotion-ai.railway.app/analyze
MONGO_URI=mongodb+srv://adeshsiddhartha2005_db:Adesh141@cluster0.ap8scd3.mongodb.net/emotiondb?retryWrites=true&w=majority
NODE_ENV=production
```

**Important**: Use the actual Railway URL for `PY_API`, not `http://python_ai:8000/analyze`

**Python AI Service Variables:**
```
PORT=8000
```

**Frontend Service Variables:**
```
NODE_ENV=production
```

#### Step 6: Update Frontend to Use Backend URL

Since services are separate, update frontend to use the backend's Railway URL.

---

### Option 2: Use Railway's Docker Compose (Alternative)

Railway does support docker-compose.yml, but you need to:

1. **Remove** any `railway.json` or `railway.toml` files
2. Railway will **auto-detect** `docker-compose.yml`
3. It will create services automatically

**However**, Railway's docker-compose support has limitations. Option 1 is more reliable.

---

## 🚀 Recommended: Deploy Services Separately

### Why This Works Better:

- ✅ Each service gets its own URL
- ✅ Better isolation
- ✅ Easier to scale
- ✅ No docker-compose dependency
- ✅ More reliable on Railway

### Steps:

1. **Delete** the current Railway project (or services)
2. **Create 3 separate services** (one for each: backend, python-ai, frontend)
3. **Set root directory** for each service
4. **Configure environment variables**
5. **Get public URLs**

---

## 📋 Quick Fix Commands

```bash
cd /Users/adeshsiddharth123/Desktop/FacialEmotionProjectManual

# Remove Railway config files that might cause issues
git rm railway.json railway.toml Procfile 2>/dev/null || true

# Commit and push
git add .
git commit -m "Remove Railway config files - deploy services separately"
git push origin main
```

---

## 🎯 Next Steps

1. **In Railway Dashboard**:
   - Delete current services (if any)
   - Create 3 new services (one for each directory)
   - Set root directory for each
   - Configure environment variables

2. **Get Service URLs**:
   - Backend URL: `https://emotion-backend.railway.app`
   - Python AI URL: `https://emotion-ai.railway.app`
   - Frontend URL: `https://emotion-frontend.railway.app`

3. **Update Backend Environment**:
   - Use Python AI's Railway URL in `PY_API`

4. **Update Frontend** (if needed):
   - Use Backend's Railway URL

---

**This approach will work!** Railway prefers individual service deployments. 🚀

