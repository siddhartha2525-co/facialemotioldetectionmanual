# 🚀 Deploy to Railway - Step by Step

## Step 1: Prepare GitHub Repository

### Option A: Create New Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `facial-emotion-project` (or any name you like)
3. Description: "Facial Emotion Detection for EdTech"
4. Choose: **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **"Create repository"**

### Option B: Use Existing Repository

If you already have a GitHub repository, skip to Step 2.

---

## Step 2: Push Code to GitHub

Run these commands in your terminal:

```bash
cd /Users/adeshsiddharth123/Desktop/FacialEmotionProjectManual

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for cloud deployment"

# Add remote (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Replace:**
- `YOUR_USERNAME` with your GitHub username
- `YOUR_REPO_NAME` with your repository name

---

## Step 3: Deploy on Railway

### 3.1 Create Railway Account

1. Go to **https://railway.app**
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (recommended)
4. Authorize Railway to access your GitHub

### 3.2 Deploy Your Project

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: `facial-emotion-project` (or your repo name)
4. Railway will automatically detect `docker-compose.yml` ✅

### 3.3 Configure Services

Railway will create 3 services:
- `emotion-frontend`
- `emotion-backend`
- `emotion-ai`

---

## Step 4: Set Environment Variables

### For Backend Service:

1. Click on **`emotion-backend`** service
2. Go to **Variables** tab
3. Click **"New Variable"**
4. Add these variables one by one:

```
PORT=5001
```

```
PY_API=http://emotion-ai:8000/analyze
```

```
MONGO_URI=mongodb+srv://adeshsiddhartha2005_db:Adesh141@cluster0.ap8scd3.mongodb.net/emotiondb?retryWrites=true&w=majority
```

```
NODE_ENV=production
```

### For Python AI Service:

1. Click on **`emotion-ai`** service
2. Go to **Variables** tab
3. Add (if needed):

```
PORT=8000
```

---

## Step 5: Get Your Public URL

1. Click on **`emotion-frontend`** service
2. Go to **Settings** tab
3. Scroll to **"Domains"** section
4. Click **"Generate Domain"**
5. Railway will create: `https://your-app-name.railway.app`

**Copy this URL!** This is your public URL.

---

## Step 6: Configure MongoDB Atlas

### Allow All IPs:

1. Go to **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
2. Click on your cluster
3. Go to **Network Access**
4. Click **"Add IP Address"**
5. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
6. Click **"Confirm"**

**This allows Railway to connect to your database.**

---

## Step 7: Test Your Deployment

### Test from Browser:

1. Open: `https://your-app-name.railway.app`
2. You should see the login page ✅

### Test from Phone:

1. Open browser on phone (any network)
2. Go to: `https://your-app-name.railway.app`
3. Login as student
4. Camera should work (HTTPS enables it!) ✅

### Test Backend:

```bash
curl https://your-app-name.railway.app/api/health
# Should return: {"success":true,"ts":...}
```

---

## 🎉 Success!

Your app is now live and accessible from:
- ✅ Any phone (any network)
- ✅ Any laptop (any network)
- ✅ Any tablet (any network)
- ✅ Anywhere in the world!

**URL**: `https://your-app-name.railway.app`

---

## 🔧 Troubleshooting

### Issue: Build fails

**Solution:**
- Check Railway logs: Click service → **Deployments** → **View Logs**
- Ensure `docker-compose.yml` is in root directory
- Check environment variables are set correctly

### Issue: Backend can't connect to Python AI

**Solution:**
- Verify `PY_API=http://emotion-ai:8000/analyze` in backend variables
- Check service names match in `docker-compose.yml`

### Issue: MongoDB connection fails

**Solution:**
- Verify MongoDB Atlas allows 0.0.0.0/0
- Check `MONGO_URI` is correct in Railway variables
- Ensure password is URL-encoded if it has special characters

### Issue: Frontend can't connect to backend

**Solution:**
- Frontend auto-detects, but check Railway logs
- Verify backend service is running
- Check CORS settings (should allow all origins)

---

## 📱 Access Your App

Once deployed, share this URL with anyone:

**`https://your-app-name.railway.app`**

They can access from:
- Any device
- Any network
- Anywhere in the world

---

**Ready to deploy?** Follow steps 1-7 above! 🚀

