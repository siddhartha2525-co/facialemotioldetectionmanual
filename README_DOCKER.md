# 🐳 Docker Setup - Complete Guide

## ✅ What's Included

This Docker setup provides a **production-ready** containerized deployment of your Facial Emotion Detection system:

- ✅ **Backend** (Node.js) - Express server with Socket.io
- ✅ **Python AI** (Flask) - Hybrid DeepFace emotion detection
- ✅ **Frontend** (Nginx) - Static HTML/CSS/JS files
- ✅ **Docker Compose** - Orchestrates all services
- ✅ **Multi-device support** - Access from any device on same network

## 📁 Files Created

```
FacialEmotionProjectManual/
├── docker-compose.yml              # Main orchestration
├── backend/
│   ├── Dockerfile                   # Node.js container
│   └── .env.docker                  # Environment template
├── python-ai/
│   ├── Dockerfile                   # Python + DeepFace container
│   └── requirements.txt             # Python dependencies
├── frontend/
│   └── Dockerfile                   # Nginx container
├── DOCKER_SETUP.md                  # Detailed documentation
├── DOCKER_QUICK_START.md            # Quick reference
└── README_DOCKER.md                 # This file
```

## 🚀 Quick Start

### 1. Create Backend Environment File

```bash
cp backend/.env.docker backend/.env
# Edit backend/.env with your MongoDB URI
```

### 2. Build and Run

```bash
docker compose build
docker compose up
```

### 3. Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Python AI**: http://localhost:8000

## 📱 Multi-Device Access

1. Find your local IP address
2. Update frontend JavaScript files to use your IP
3. Rebuild frontend container
4. Access from other devices: `http://<your-ip>:3000`

See `DOCKER_QUICK_START.md` for detailed steps.

## 🔧 Configuration

### Backend Environment (.env)

```env
PORT=5001
PY_API=http://python_ai:8000/analyze
MONGO_URI=<your-mongodb-uri>
```

**Important**: `PY_API` uses service name `python_ai` (not `localhost`) for Docker networking.

### Ports

- Frontend: `3000` → Container `80`
- Backend: `5001` → Container `5001`
- Python AI: `8000` → Container `8000`

## 📚 Documentation

- **DOCKER_SETUP.md** - Complete setup guide with troubleshooting
- **DOCKER_QUICK_START.md** - Quick reference for common tasks
- **README_DOCKER.md** - This overview file

## 🎯 Features

- ✅ Production-ready containers
- ✅ Automatic service orchestration
- ✅ Network isolation
- ✅ Health checks
- ✅ Restart policies
- ✅ Multi-device access support
- ✅ Optimized for speed and accuracy

## 🛠️ Common Commands

```bash
# Start all services
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

## ✅ Next Steps

1. Configure `backend/.env` with your MongoDB URI
2. Run `docker compose build`
3. Run `docker compose up`
4. Access http://localhost:3000
5. For multi-device: Follow `DOCKER_QUICK_START.md`

---

**Ready to deploy!** 🚀

