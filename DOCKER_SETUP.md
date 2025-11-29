# Docker Setup Guide - Facial Emotion Detection Project

## Overview
This guide provides complete Docker + Docker Compose setup for running the entire Facial Emotion Detection system in production-ready containers.

## Architecture

```
┌─────────────┐
│  Frontend   │  Port 3000 (Nginx)
│  (Nginx)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Backend    │  Port 5001 (Node.js)
│  (Express)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Python AI  │  Port 8000 (Flask + DeepFace)
│  (Hybrid)   │
└─────────────┘
```

## Prerequisites

1. **Docker** (version 20.10+)
2. **Docker Compose** (version 2.0+)
3. **MongoDB Atlas URI** (or local MongoDB)

## Quick Start

### 1. Configure Environment Variables

Create `backend/.env` file:

```bash
PORT=5001
PY_API=http://python_ai:8000/analyze
MONGO_URI=mongodb+srv://<username>:<password>@cluster0....emotiondb?retryWrites=true&w=majority
```

**Important**: Inside Docker, use `python_ai` (service name) instead of `localhost` for `PY_API`.

### 2. Build and Start All Services

From the project root directory:

```bash
# Build all Docker images
docker compose build

# Start all services
docker compose up

# Or run in detached mode (background)
docker compose up -d
```

### 3. Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Student/Teacher UI |
| **Backend API** | http://localhost:5001 | Node.js server |
| **Python AI** | http://localhost:8000 | Hybrid AI server |

### 4. View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f python_ai
docker compose logs -f frontend
```

### 5. Stop Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
```

## Multi-Device Access

### Same WiFi Network

If all devices are on the same WiFi network:

1. **Find your local IP address:**
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig
   ```

2. **Access from other devices:**
   - Teacher Dashboard: `http://<your-local-ip>:3000/student/teacher/dashboard.html`
   - Student Dashboard: `http://<your-local-ip>:3000/student/dashboard.html`
   - Login: `http://<your-local-ip>:3000/login.html`

### Example
If your local IP is `192.168.1.100`:
- Teacher: `http://192.168.1.100:3000/student/teacher/dashboard.html`
- Student: `http://192.168.1.100:3000/student/dashboard.html`

## Docker Services Details

### 1. Backend Service (`emotion-backend`)

- **Image**: Node.js 18 Alpine
- **Port**: 5001
- **Dependencies**: Python AI service
- **Environment**: Loads from `backend/.env`

**Dockerfile**: `backend/Dockerfile`

### 2. Python AI Service (`emotion-ai`)

- **Image**: Python 3.9 Slim
- **Port**: 8000
- **Dependencies**: DeepFace, OpenCV, TensorFlow
- **Server**: `api_server_hybrid.py` (optimized hybrid model)

**Dockerfile**: `python-ai/Dockerfile`

**Note**: First build may take 10-15 minutes as it downloads DeepFace models.

### 3. Frontend Service (`emotion-frontend`)

- **Image**: Nginx Stable Alpine
- **Port**: 3000 (mapped to container port 80)
- **Content**: Static HTML/CSS/JS files

**Dockerfile**: `frontend/Dockerfile`

## Configuration Files

### docker-compose.yml

Main orchestration file that:
- Builds all three services
- Sets up networking between services
- Configures port mappings
- Sets restart policies

### Environment Variables

#### Backend (.env)
```env
PORT=5001
PY_API=http://python_ai:8000/analyze
MONGO_URI=<your-mongodb-uri>
```

**Key Point**: `PY_API` uses service name `python_ai` (not `localhost`) because services communicate via Docker network.

## Troubleshooting

### 1. Port Already in Use

If ports 3000, 5001, or 8000 are already in use:

```bash
# Option 1: Stop conflicting services
docker compose down

# Option 2: Change ports in docker-compose.yml
ports:
  - "3001:80"  # Change frontend port
  - "5002:5001"  # Change backend port
  - "8001:8000"  # Change AI port
```

### 2. Python AI Build Fails

If DeepFace installation fails:

```bash
# Check Docker build logs
docker compose build python_ai --no-cache

# Verify requirements.txt exists
cat python-ai/requirements.txt
```

### 3. Backend Can't Connect to Python AI

**Error**: `ECONNREFUSED` or `Connection refused`

**Solution**: Ensure `PY_API` in `backend/.env` uses service name:
```env
PY_API=http://python_ai:8000/analyze  # ✅ Correct
PY_API=http://localhost:8000/analyze   # ❌ Wrong in Docker
```

### 4. Frontend Can't Connect to Backend

**Error**: WebSocket connection fails

**Solution**: Update frontend JavaScript to use correct backend URL:
- In `dashboard.js`, ensure `WS_URL` points to `ws://localhost:5001` (or your Docker host IP)

### 5. MongoDB Connection Issues

**Error**: `Mongoose connection failed`

**Solution**: 
1. Verify `MONGO_URI` in `backend/.env` is correct
2. Ensure MongoDB Atlas allows connections from your IP
3. Check network connectivity from Docker container

### 6. Slow First Request

**Expected**: First emotion detection request takes 10-30 seconds as DeepFace downloads models.

**Solution**: This is normal. Subsequent requests will be faster.

## Development vs Production

### Development (Current Setup)
- Uses `docker compose up` (single machine)
- All services on same network
- Accessible via localhost

### Production Deployment
For production, consider:
1. **Reverse Proxy**: Add Nginx/Traefik in front
2. **SSL/TLS**: Add HTTPS certificates
3. **Environment Variables**: Use Docker secrets or external config
4. **Health Checks**: Add health check endpoints
5. **Resource Limits**: Set CPU/memory limits in docker-compose.yml
6. **Logging**: Configure centralized logging (e.g., ELK stack)

## Useful Commands

```bash
# Rebuild specific service
docker compose build backend

# Restart specific service
docker compose restart backend

# View service status
docker compose ps

# Execute command in running container
docker compose exec backend sh
docker compose exec python_ai python --version

# View container resource usage
docker stats

# Clean up (remove containers, networks, volumes)
docker compose down -v

# Remove all images
docker compose down --rmi all
```

## Health Checks

### Backend
```bash
curl http://localhost:5001/api/health
```

### Python AI
```bash
curl http://localhost:8000/health
```

### Frontend
```bash
curl http://localhost:3000/login.html
```

## Network Architecture

All services are on the `emotion-net` bridge network:
- Services can communicate using service names
- No need for `localhost` or IP addresses
- Isolated from host network

## File Structure

```
FacialEmotionProjectManual/
├── docker-compose.yml          # Main orchestration file
├── backend/
│   ├── Dockerfile              # Backend container definition
│   ├── .env                    # Backend environment variables
│   └── server.js               # Backend server code
├── python-ai/
│   ├── Dockerfile              # Python AI container definition
│   ├── requirements.txt        # Python dependencies
│   └── api_server_hybrid.py   # AI server code
└── frontend/
    ├── Dockerfile              # Frontend container definition
    └── [HTML/CSS/JS files]     # Static frontend files
```

## Next Steps

1. **Configure MongoDB**: Update `MONGO_URI` in `backend/.env`
2. **Build Images**: Run `docker compose build`
3. **Start Services**: Run `docker compose up`
4. **Test Access**: Open http://localhost:3000
5. **Multi-Device**: Use your local IP for other devices

## Support

If you encounter issues:
1. Check Docker logs: `docker compose logs`
2. Verify environment variables
3. Ensure all ports are available
4. Check network connectivity between services

---

**Ready to deploy!** 🚀

