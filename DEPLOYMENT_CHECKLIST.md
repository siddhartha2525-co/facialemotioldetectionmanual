# ✅ Cloud Deployment Checklist

## Pre-Deployment

- [ ] Code is ready and tested locally
- [ ] All environment variables documented
- [ ] MongoDB Atlas account created
- [ ] MongoDB Atlas allows all IPs (0.0.0.0/0)
- [ ] GitHub repository created
- [ ] Code pushed to GitHub

## Deployment Steps

### Railway (Recommended)

- [ ] Create Railway account (https://railway.app)
- [ ] Connect GitHub account
- [ ] Create new project
- [ ] Deploy from GitHub repository
- [ ] Set environment variables:
  - [ ] `PORT=5001`
  - [ ] `PY_API=http://emotion-ai:8000/analyze`
  - [ ] `MONGO_URI=your_mongodb_uri`
  - [ ] `NODE_ENV=production`
- [ ] Generate public domain
- [ ] Test deployment

### Render (Alternative)

- [ ] Create Render account (https://render.com)
- [ ] Connect GitHub account
- [ ] Create web service
- [ ] Connect repository
- [ ] Set environment variables
- [ ] Deploy
- [ ] Test deployment

## Post-Deployment

- [ ] Test frontend: `https://your-app.railway.app`
- [ ] Test backend health: `https://your-app.railway.app/api/health`
- [ ] Test login from phone (different network)
- [ ] Test camera access (HTTPS enables it!)
- [ ] Test class joining
- [ ] Test emotion detection
- [ ] Verify teacher dashboard works

## Environment Variables Checklist

**Backend Service:**
```
PORT=5001
PY_API=http://emotion-ai:8000/analyze
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/emotiondb?retryWrites=true&w=majority
NODE_ENV=production
```

**Python AI Service:**
```
PORT=8000
```

**Frontend Service:**
```
NODE_ENV=production
```

## MongoDB Atlas Checklist

- [ ] Database cluster created
- [ ] Database user created
- [ ] Network Access: Allow 0.0.0.0/0 (all IPs)
- [ ] Connection string copied
- [ ] Password replaced in connection string

## Testing Checklist

- [ ] Access from laptop (same network): ✅
- [ ] Access from phone (different network): ✅
- [ ] Login works: ✅
- [ ] Camera access works (HTTPS): ✅
- [ ] Class joining works: ✅
- [ ] Emotion detection works: ✅
- [ ] Teacher dashboard works: ✅
- [ ] Multiple students can join: ✅

---

**Once all checked, your app is live and accessible from anywhere!** 🌍

