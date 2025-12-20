# Hybrid AI Server Setup Guide

This project now uses a hybrid AI approach: **OpenFace (fast)** → **Facenet512 (fallback)** for optimal performance and accuracy.

## Quick Start

### 1. Python AI Server Setup

```bash
cd python-ai
source venv/bin/activate

# Install required packages (if not already installed)
pip install flask flask-cors deepface opencv-python-headless numpy tensorflow==2.15 tf-keras mtcnn

# Start hybrid AI server
python3 api_server_hybrid.py
```

Expected output: `Hybrid AI server (OpenFace -> Facenet512) running on http://0.0.0.0:8000`

### 2. Backend Setup

```bash
cd backend

# Create .env file (if it doesn't exist)
# Add these variables:
# PORT=5001
# PY_API=http://127.0.0.1:8000/analyze
# MONGO_URI=your_mongodb_connection_string (optional)

npm install
npm start
```

### 3. Frontend

```bash
cd frontend
python3 -m http.server 8080
```

## Verification

### Health Checks

```bash
# Python AI
curl http://127.0.0.1:8000/health
# Expected: {"status":"ok","mode":"hybrid","openface_threshold":0.72}

# Backend
curl http://127.0.0.1:5001/api/health
# Expected: {"success":true,"ts":...}
```

### Test Emotion Detection

1. Open student dashboard: http://localhost:8080/login.html
2. Login as student
3. Enable camera and join class
4. Teacher should see emotion updates with `source` field (openface or facenet512)

## Configuration

### Tuning Parameters (in `api_server_hybrid.py`)

- `FAST_CONFIDENCE_THRESHOLD = 0.72`: OpenFace confidence threshold
  - Higher (0.75-0.78): Fewer fallbacks, faster
  - Lower (0.68-0.72): More Facenet512 calls, more accurate

- `BUFF_SIZE = 5`: Emotion smoothing buffer size
  - Increase to 7 for smoother but slower adaptation

### Engagement Calculation

The backend now uses confidence-weighted engagement:
- Base score: 50
- Confidence factor: 0.7 to 1.2 (based on detection confidence)
- Emotion weights:
  - Happy: +30
  - Surprise: +20
  - Neutral: +10
  - Sad: -20
  - Fear: -25
  - Disgust: -30
  - Angry: -35
  - No Face: -60

## Troubleshooting

### Model Download
First run will download model weights (requires internet). This is normal and only happens once.

### Slow Initial Requests
First request loads models into memory. Consider warming up with a sample image on server start.

### High Memory Usage
- Reduce canvas resolution in student dashboard
- Increase snapshot interval (1.5s instead of 1s)
- Use GPU if available (install tensorflow-gpu)

## Features

✅ **Hybrid Detection**: OpenFace for speed, Facenet512 for accuracy  
✅ **Confidence-Weighted Engagement**: More accurate engagement scores  
✅ **Source Tracking**: Know which model detected each emotion  
✅ **Smoothing**: Reduces flickering with emotion buffer  
✅ **Low Light Detection**: Handles poor lighting conditions  
✅ **Small Face Filtering**: Ignores faces that are too small  

## File Structure

```
python-ai/
  ├── api_server_hybrid.py    # Hybrid AI server (NEW)
  ├── api_server.py            # Original server (backup)
  └── venv/                    # Python virtual environment

backend/
  ├── server.js                # Updated with new engagement calculation
  └── .env                     # Environment variables

run_helpers.sh                 # Helper commands
```

## Migration Notes

- The hybrid server replaces `api_server.py` but keeps the same endpoint: `/analyze`
- Backend automatically uses the hybrid server if running on port 8000
- No frontend changes required
- Emotion updates now include `source` field (openface/facenet512)

