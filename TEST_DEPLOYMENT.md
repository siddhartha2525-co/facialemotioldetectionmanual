# 🧪 Test Your Railway Deployment

## ✅ Quick Tests

### Test 1: Frontend (Main URL)

**Open in browser**:
```
https://emotion-frontend.railway.app
```

**Expected**: Login page loads ✅

---

### Test 2: Backend Health

**Open in browser**:
```
https://emotion-backend.railway.app/api/health
```

**Expected**: `{"success":true,"ts":...}` ✅

---

### Test 3: Python AI Health

**Open in browser**:
```
https://emotion-ai.railway.app/health
```

**Expected**: `{"status":"ok","mode":"hybrid",...}` ✅

---

### Test 4: Full Application Flow

1. **Open**: `https://emotion-frontend.railway.app`
2. **Login** as student (any email/password)
3. **Enter Class ID**: `CLASS1`
4. **Click**: "Join Class"
5. **Enable camera**: Should work! ✅
6. **Teacher dashboard**: Login as teacher, should see student ✅

---

## 📱 Test from Phone

1. **Open browser** on phone (any network)
2. **Go to**: `https://emotion-frontend.railway.app`
3. **Login** as student
4. **Enable camera**: Should work! (HTTPS enables it) ✅
5. **Join class**: Should work! ✅

---

## 🔍 Check Railway Logs

If something doesn't work:

1. **Railway Dashboard** → Click on service
2. **Deployments** → **View Logs**
3. **Look for errors**
4. **Fix and redeploy**

---

**All tests passing? Your deployment is successful!** 🎉

