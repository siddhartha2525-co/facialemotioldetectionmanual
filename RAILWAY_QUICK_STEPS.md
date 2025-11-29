# 🚂 Railway Quick Steps - Deploy 3 Services

## ⚡ Fast Guide (5 minutes per service)

### Service 1: Backend

1. Railway Dashboard → **"New"** → **"GitHub Repo"**
2. Select: `facialemotioldetectionmanual`
3. **Settings** → Find **"Root Directory"** → Enter: `backend`
4. **Variables** → Add:
   - `PORT=5001`
   - `PY_API=http://emotion-ai:8000/analyze`
   - `MONGO_URI=mongodb+srv://adeshsiddhartha2005_db:Adesh141@cluster0.ap8scd3.mongodb.net/emotiondb?retryWrites=true&w=majority`
   - `NODE_ENV=production`

### Service 2: Python AI

1. Same project → **"New"** → **"GitHub Repo"**
2. Select: `facialemotioldetectionmanual`
3. **Settings** → **"Root Directory"** → Enter: `python-ai`
4. **Variables** → Add: `PORT=8000`

### Service 3: Frontend

1. Same project → **"New"** → **"GitHub Repo"**
2. Select: `facialemotioldetectionmanual`
3. **Settings** → **"Root Directory"** → Enter: `frontend`
4. **Settings** → **Generate Domain** → Copy URL ✅

---

## 🎯 Where to Find "Root Directory"

**In Railway Dashboard:**
- Service → **Settings** → **General** tab
- Or: Service → **Configure** → **Build** section
- Or: During service creation

**Look for:**
- "Root Directory"
- "Working Directory"  
- "Source Directory"

---

## ✅ Done!

Your frontend URL is your public URL:
**`https://emotion-frontend.railway.app`**

Accessible from anywhere! 🌍

