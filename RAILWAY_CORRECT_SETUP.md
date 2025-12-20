# 🚂 Railway Correct Setup - Deploy Services Separately

## ✅ The Right Way to Deploy on Railway

Railway doesn't run `docker-compose` commands. Instead, deploy each service **separately** as individual services.

---

## 📋 Step-by-Step: Deploy 3 Services

### Service 1: Backend

1. **In Railway Dashboard**:
   - Click **"New"** → **"GitHub Repo"**
   - Select: `siddhartha2525-co/facialemotioldetectionmanual`
   - Click **"Deploy"**

2. **Configure Service**:
   - **Name**: `emotion-backend`
   - **Root Directory**: `backend`
   - **Build Command**: (leave empty - uses Dockerfile)
   - **Start Command**: (leave empty - uses Dockerfile CMD)

3. **Set Environment Variables**:
   - Go to **Variables** tab
   - Add:
     ```
     PORT=5001
     PY_API=https://emotion-ai.railway.app/analyze
     MONGO_URI=mongodb+srv://adeshsiddhartha2005_db:Adesh141@cluster0.ap8scd3.mongodb.net/emotiondb?retryWrites=true&w=majority
     NODE_ENV=production
     ```
   - **Note**: You'll update `PY_API` after Python AI service is deployed

4. **Get Backend URL**:
   - Settings → Generate Domain
   - Copy URL: `https://emotion-backend.railway.app`

---

### Service 2: Python AI

1. **In Same Railway Project**:
   - Click **"New"** → **"GitHub Repo"**
   - Select: `siddhartha2525-co/facialemotioldetectionmanual`
   - Click **"Deploy"**

2. **Configure Service**:
   - **Name**: `emotion-ai`
   - **Root Directory**: `python-ai`
   - **Build Command**: (leave empty)
   - **Start Command**: (leave empty)

3. **Set Environment Variables** (if needed):
   ```
   PORT=8000
   ```

4. **Get Python AI URL**:
   - Settings → Generate Domain
   - Copy URL: `https://emotion-ai.railway.app`

5. **Update Backend's PY_API**:
   - Go back to `emotion-backend` service
   - Variables → Update `PY_API` to: `https://emotion-ai.railway.app/analyze`

---

### Service 3: Frontend

1. **In Same Railway Project**:
   - Click **"New"** → **"GitHub Repo"**
   - Select: `siddhartha2525-co/facialemotioldetectionmanual`
   - Click **"Deploy"**

2. **Configure Service**:
   - **Name**: `emotion-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: (leave empty)
   - **Start Command**: (leave empty)

3. **Get Frontend URL** (Your Public URL):
   - Settings → Generate Domain
   - Copy URL: `https://emotion-frontend.railway.app`
   - **This is your main public URL!**

4. **Update Frontend Code** (if needed):
   - Frontend auto-detects, but you may need to update backend URL
   - Or use environment variable

---

## 🔧 Alternative: Use Railway's Service Discovery

Railway services in the same project can discover each other using service names.

### Update Backend Environment:

Instead of full URL, you can use Railway's internal service discovery:

```
PY_API=http://emotion-ai:8000/analyze
```

But this only works if services are in the **same Railway project**.

---

## 📱 Final Configuration

### Your Service URLs:

- **Frontend**: `https://emotion-frontend.railway.app` (Public URL)
- **Backend**: `https://emotion-backend.railway.app` (Internal)
- **Python AI**: `https://emotion-ai.railway.app` (Internal)

### Environment Variables Summary:

**Backend (`emotion-backend`):**
```
PORT=5001
PY_API=http://emotion-ai:8000/analyze
MONGO_URI=mongodb+srv://adeshsiddhartha2005_db:Adesh141@cluster0.ap8scd3.mongodb.net/emotiondb?retryWrites=true&w=majority
NODE_ENV=production
```

**Python AI (`emotion-ai`):**
```
PORT=8000
```

**Frontend (`emotion-frontend`):**
```
NODE_ENV=production
```

---

## ✅ Expected Result

After deploying all 3 services:

1. **Frontend accessible**: `https://emotion-frontend.railway.app`
2. **Backend connects to Python AI**: Using service name or URL
3. **All services running**: Check Railway dashboard
4. **Accessible from anywhere**: Share frontend URL

---

## 🆘 Troubleshooting

### Services Can't Connect

**If using service names** (`http://emotion-ai:8000`):
- Ensure all services in **same Railway project**
- Check service names match exactly

**If using URLs** (`https://emotion-ai.railway.app`):
- Ensure URLs are correct
- Check CORS settings
- Verify services are running

### Frontend Can't Connect to Backend

**Update frontend code** to use backend's Railway URL, or:
- Use Railway's service discovery
- Set environment variable for backend URL

---

**Deploy each service separately - this is the Railway way!** 🚀

