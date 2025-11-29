# 🚂 Railway: Deploy Services Individually - Step by Step

## 📋 Overview

Deploy each service (backend, python-ai, frontend) as **separate services** in Railway, each with its own root directory.

---

## 🎯 Step-by-Step Instructions

### Prerequisites

1. **GitHub Repository**: Your code is at `https://github.com/siddhartha2525-co/facialemotioldetectionmanual`
2. **Railway Account**: Sign up at https://railway.app
3. **MongoDB Atlas**: Ensure network access allows 0.0.0.0/0

---

## 🚀 Service 1: Backend

### Step 1.1: Create Backend Service

1. **Go to Railway Dashboard**: https://railway.app
2. **Click**: "New Project" (or "New" if you have a project)
3. **Select**: "GitHub Repo"
4. **Search/Select**: `facialemotioldetectionmanual` or `siddhartha2525-co/facialemotioldetectionmanual`
5. **Click**: "Deploy"

### Step 1.2: Configure Backend Service

After Railway starts deploying, you'll see service settings:

1. **Click on the service** (or click "Settings" / "Configure")
2. **Find**: "Root Directory" or "Working Directory" field
3. **Enter**: `backend`
   - ⚠️ **IMPORTANT**: This tells Railway to use the `backend/` folder
4. **Service Name**: `emotion-backend` (or leave default)
5. **Build Command**: Leave **empty** (uses Dockerfile)
6. **Start Command**: Leave **empty** (uses Dockerfile CMD)

### Step 1.3: Set Environment Variables

1. **Click**: "Variables" tab
2. **Click**: "New Variable" (or "+" button)
3. **Add these 4 variables** (one by one):

   **Variable 1:**
   - **Key**: `PORT`
   - **Value**: `5001`
   - Click "Add"

   **Variable 2:**
   - **Key**: `PY_API`
   - **Value**: `http://emotion-ai:8000/analyze`
   - Click "Add"
   - ⚠️ **Note**: Update this after Python AI service is deployed

   **Variable 3:**
   - **Key**: `MONGO_URI`
   - **Value**: `mongodb+srv://adeshsiddhartha2005_db:Adesh141@cluster0.ap8scd3.mongodb.net/emotiondb?retryWrites=true&w=majority`
   - Click "Add"

   **Variable 4:**
   - **Key**: `NODE_ENV`
   - **Value**: `production`
   - Click "Add"

### Step 1.4: Get Backend URL (Optional)

1. **Click**: "Settings" tab
2. **Scroll** to "Domains" section
3. **Click**: "Generate Domain"
4. **Copy** the URL: `https://emotion-backend.railway.app`
5. **Note this URL** (you might need it later)

---

## 🐍 Service 2: Python AI

### Step 2.1: Create Python AI Service

1. **In the SAME Railway project**, click **"New"** (top right, or "+" button)
2. **Select**: "GitHub Repo"
3. **Search/Select**: Same repository: `facialemotioldetectionmanual`
4. **Click**: "Deploy"

### Step 2.2: Configure Python AI Service

1. **Click on the new service**
2. **Find**: "Root Directory" field
3. **Enter**: `python-ai`
   - ⚠️ **IMPORTANT**: This tells Railway to use the `python-ai/` folder
4. **Service Name**: `emotion-ai` (or leave default)
5. **Build Command**: Leave **empty**
6. **Start Command**: Leave **empty**

### Step 2.3: Set Environment Variables

1. **Click**: "Variables" tab
2. **Click**: "New Variable"
3. **Add**:
   - **Key**: `PORT`
   - **Value**: `8000`
   - Click "Add"

### Step 2.4: Get Python AI URL

1. **Click**: "Settings" tab
2. **Scroll** to "Domains" section
3. **Click**: "Generate Domain"
4. **Copy** the URL: `https://emotion-ai.railway.app`
5. **Note this URL**

### Step 2.5: Update Backend's PY_API (Important!)

1. **Go back** to `emotion-backend` service
2. **Click**: "Variables" tab
3. **Find**: `PY_API` variable
4. **Click** to edit
5. **Update value** to: `http://emotion-ai:8000/analyze`
   - ⚠️ **Use service name** `emotion-ai` (not full URL) if services are in same project
   - Or use full URL: `https://emotion-ai.railway.app/analyze`
6. **Save**

---

## 🌐 Service 3: Frontend

### Step 3.1: Create Frontend Service

1. **In the SAME Railway project**, click **"New"**
2. **Select**: "GitHub Repo"
3. **Search/Select**: Same repository: `facialemotioldetectionmanual`
4. **Click**: "Deploy"

### Step 3.2: Configure Frontend Service

1. **Click on the new service**
2. **Find**: "Root Directory" field
3. **Enter**: `frontend`
   - ⚠️ **IMPORTANT**: This tells Railway to use the `frontend/` folder
4. **Service Name**: `emotion-frontend` (or leave default)
5. **Build Command**: Leave **empty**
6. **Start Command**: Leave **empty**

### Step 3.3: Get Frontend URL (Your Public URL!)

1. **Click**: "Settings" tab
2. **Scroll** to "Domains" section
3. **Click**: "Generate Domain"
4. **Copy** the URL: `https://emotion-frontend.railway.app`
5. **🎉 This is your public URL!**

---

## ✅ Verification Checklist

After all 3 services are deployed:

- [ ] **Backend service**: Running, Root Directory = `backend`
- [ ] **Python AI service**: Running, Root Directory = `python-ai`
- [ ] **Frontend service**: Running, Root Directory = `frontend`
- [ ] **Backend variables**: All 4 variables set correctly
- [ ] **Python AI variables**: PORT=8000 set
- [ ] **Frontend URL**: Generated and accessible
- [ ] **All services in same Railway project**

---

## 🔍 How to Find "Root Directory" in Railway

The "Root Directory" field might be in different places:

1. **Service Settings** → **General** tab
2. **Service Settings** → **Build** section
3. **Service Settings** → **Deploy** section
4. **Service Overview** → Click "Configure" or "Settings"

**Look for**:
- "Root Directory"
- "Working Directory"
- "Source Directory"
- "Base Directory"

**If you can't find it**:
- Railway might auto-detect from docker-compose.yml
- Or you might need to set it during initial service creation

---

## 🆘 Troubleshooting

### Can't Find "Root Directory" Field

**Solution**: 
- Railway might auto-detect services from `docker-compose.yml`
- Try creating service without setting root directory
- Railway should detect the Dockerfile in each folder

### Services Can't Connect

**Check**:
1. All services in **same Railway project**
2. Service names match: `emotion-backend`, `emotion-ai`, `emotion-frontend`
3. `PY_API` uses service name: `http://emotion-ai:8000/analyze`
4. Check Railway logs for connection errors

### Build Fails

**Check**:
1. Root Directory is correct
2. Dockerfile exists in that directory
3. Check Railway build logs for errors
4. Verify all files are pushed to GitHub

---

## 📱 After Deployment

Your app will be accessible at:
- **Frontend**: `https://emotion-frontend.railway.app`
- **Backend**: `https://emotion-backend.railway.app` (internal)
- **Python AI**: `https://emotion-ai.railway.app` (internal)

**Test**:
1. Open frontend URL in browser
2. Should see login page ✅
3. Login and test functionality ✅

---

## 🎯 Quick Summary

1. **Create 3 services** in Railway (one for each)
2. **Set Root Directory** for each:
   - Service 1: `backend`
   - Service 2: `python-ai`
   - Service 3: `frontend`
3. **Set environment variables** (especially backend)
4. **Get frontend URL** - that's your public URL!

---

**Follow these steps and your services will deploy successfully!** 🚀

