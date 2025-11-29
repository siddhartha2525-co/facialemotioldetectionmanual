# 🚂 Railway Simple Fix - Deploy Services Individually

## ❌ The Problem

Railway error: `The executable 'docker-compose' could not be found.`

**Why**: Railway doesn't run `docker-compose` commands. It deploys services individually.

## ✅ The Solution: Deploy 3 Separate Services

### In Railway Dashboard:

1. **Delete** the current failed service (if exists)

2. **Create 3 New Services** (one for each):

---

### Service 1: Backend

1. Click **"New"** → **"GitHub Repo"**
2. Select: `siddhartha2525-co/facialemotioldetectionmanual`
3. **Configure**:
   - **Service Name**: `emotion-backend`
   - **Root Directory**: `backend` ⚠️ **IMPORTANT**
   - **Build Command**: (leave empty)
   - **Start Command**: (leave empty)
4. **Variables** tab → Add:
   ```
   PORT=5001
   PY_API=http://emotion-ai:8000/analyze
   MONGO_URI=mongodb+srv://adeshsiddhartha2005_db:Adesh141@cluster0.ap8scd3.mongodb.net/emotiondb?retryWrites=true&w=majority
   NODE_ENV=production
   ```
5. **Settings** → Generate Domain → `emotion-backend.railway.app`

---

### Service 2: Python AI

1. In **same project**, click **"New"** → **"GitHub Repo"**
2. Select: `siddhartha2525-co/facialemotioldetectionmanual`
3. **Configure**:
   - **Service Name**: `emotion-ai`
   - **Root Directory**: `python-ai` ⚠️ **IMPORTANT**
   - **Build Command**: (leave empty)
   - **Start Command**: (leave empty)
4. **Variables** tab → Add:
   ```
   PORT=8000
   ```
5. **Settings** → Generate Domain → `emotion-ai.railway.app`

---

### Service 3: Frontend

1. In **same project**, click **"New"** → **"GitHub Repo"**
2. Select: `siddhartha2525-co/facialemotioldetectionmanual`
3. **Configure**:
   - **Service Name**: `emotion-frontend`
   - **Root Directory**: `frontend` ⚠️ **IMPORTANT**
   - **Build Command**: (leave empty)
   - **Start Command**: (leave empty)
4. **Settings** → Generate Domain → `emotion-frontend.railway.app`

**This is your public URL!** 🎉

---

## 🔧 Service Discovery

Railway services in the **same project** can find each other using service names:

- Backend can reach Python AI: `http://emotion-ai:8000`
- Frontend can reach Backend: `http://emotion-backend:5001`

**But**: You need to update frontend code to use the backend's service name.

---

## 📝 Update Frontend Code

Since services are separate, update frontend to use Railway service discovery:

**Option 1**: Use service name (if in same project)
```javascript
const BACKEND_URL = `http://emotion-backend:5001`;
```

**Option 2**: Use Railway URL
```javascript
const BACKEND_URL = `https://emotion-backend.railway.app`;
```

---

## ✅ After Deployment

1. **Frontend URL**: `https://emotion-frontend.railway.app` (Public)
2. **Backend URL**: `https://emotion-backend.railway.app` (Internal)
3. **Python AI URL**: `https://emotion-ai.railway.app` (Internal)

All services running and connected! 🚀

---

## 🆘 Still Having Issues?

If services can't connect:
1. Ensure all 3 services in **same Railway project**
2. Check service names match exactly
3. Verify environment variables are set
4. Check Railway logs for each service

---

**Deploy each service separately - this is how Railway works!** ✅

