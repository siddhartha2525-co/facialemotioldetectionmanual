# 🌐 Frontend Port Configuration

## 📋 Port Details

### Docker Configuration:

- **Container Internal Port**: `80` (Nginx default)
- **Local Docker Port**: `3000` (when running with docker-compose)
- **Mapping**: `3000:80` (host:container)

### Files:

**`frontend/Dockerfile`**:
```dockerfile
EXPOSE 80
```

**`docker-compose.yml`**:
```yaml
frontend:
  ports:
    - "3000:80"  # Host port 3000 → Container port 80
```

---

## 🚂 Railway Deployment

### For Railway:

**No PORT environment variable needed!**

Railway automatically:
- Exposes port 80 from the container
- Provides HTTPS on port 443
- Gives you a public URL (no port number)

### If Railway Requires PORT Variable:

If Railway asks for a PORT environment variable, set:
```
PORT=80
```

But this is usually **not required** because:
- Nginx runs on port 80 by default
- Railway auto-detects exposed ports
- Railway provides HTTPS automatically

---

## 🔧 Port Summary

| Environment | Port | Notes |
|------------|------|-------|
| **Local Docker** | `3000` | Access: `http://localhost:3000` |
| **Container Internal** | `80` | Nginx listens here |
| **Railway** | `80` (internal) | Public URL: `https://emotion-frontend.railway.app` (no port) |

---

## ✅ Railway Configuration

### Frontend Service Settings:

1. **Root Directory**: `frontend` ✅
2. **Port**: Auto-detected (80) ✅
3. **Environment Variables**: 
   - Usually **none needed**
   - If required: `PORT=80` (optional)

### Railway Public URL:

- **Format**: `https://emotion-frontend.railway.app`
- **No port number** in URL (HTTPS uses port 443 automatically)
- **Accessible from anywhere** 🌍

---

## 🎯 Quick Answer

**Frontend Port:**
- **Container**: `80`
- **Local Docker**: `3000`
- **Railway**: `80` (internal), public URL has no port

**Railway**: No PORT variable needed (auto-detected) ✅

