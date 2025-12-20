# Docker Quick Start Guide

## 🚀 Fast Setup (3 Steps)

### Step 1: Configure Backend Environment

Create `backend/.env`:

```env
PORT=5001
PY_API=http://python_ai:8000/analyze
MONGO_URI=mongodb+srv://<username>:<password>@cluster0....emotiondb?retryWrites=true&w=majority
```

### Step 2: Build and Start

```bash
docker compose build
docker compose up
```

### Step 3: Access

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5001
- **Python AI**: http://localhost:8000

## 📱 Multi-Device Access

For devices on the same WiFi:

1. Find your IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`
2. Update frontend files to use your IP instead of `localhost`:

**Files to update:**
- `frontend/student/dashboard.js` (line 1)
- `frontend/student/teacher/dashboard.js` (line 1)

**Change:**
```javascript
const WS_URL = "http://localhost:5001";  // ❌ Only works on same machine
```

**To:**
```javascript
const WS_URL = "http://192.168.1.100:5001";  // ✅ Use your local IP
```

3. Rebuild frontend: `docker compose build frontend`
4. Restart: `docker compose restart frontend`
5. Access from other devices: `http://<your-ip>:3000`

## 🛠️ Common Commands

```bash
# Start services
docker compose up

# Start in background
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild after code changes
docker compose build
docker compose up
```

## ✅ Health Checks

```bash
# Backend
curl http://localhost:5001/api/health

# Python AI
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000/login.html
```

## 📋 Service URLs

| Service | Container Port | Host Port | URL |
|---------|---------------|-----------|-----|
| Frontend | 80 | 3000 | http://localhost:3000 |
| Backend | 5001 | 5001 | http://localhost:5001 |
| Python AI | 8000 | 8000 | http://localhost:8000 |

## 🔧 Troubleshooting

**Port already in use?**
```bash
docker compose down
# Or change ports in docker-compose.yml
```

**Backend can't connect to Python AI?**
- Check `PY_API` in `backend/.env` uses `http://python_ai:8000/analyze` (not localhost)

**First request slow?**
- Normal! DeepFace downloads models on first use (10-30 seconds)

---

For detailed documentation, see `DOCKER_SETUP.md`

