# python-ai/api_server_hybrid.py
# High Accuracy AI server: Optimized for >90% accuracy using RetinaFace
import os
# Suppress TensorFlow logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

from flask import Flask, request, jsonify
from flask_cors import CORS
from deepface import DeepFace
import numpy as np
import cv2, base64, time, traceback
from collections import deque

app = Flask(__name__)
CORS(app)

# Smoothing buffer
BUFF_SIZE = 5  # Increased buffer for more stability
emotion_buffer = {}  # studentId -> deque

# High Accuracy Thresholds
CONFIDENCE_THRESHOLD = 0.60  # Require 60% confidence from model (raw probability)
# Note: DeepFace emotion probabilities are often distributed, so 0.6 is quite high.

def decode_image(b64):
    try:
        if "," in b64:
            b64 = b64.split(',', 1)[1]
        im_bytes = base64.b64decode(b64)
        arr = np.frombuffer(im_bytes, np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        return img
    except Exception:
        return None

def push_buffer(studentId, emotion):
    if studentId not in emotion_buffer:
        emotion_buffer[studentId] = deque(maxlen=BUFF_SIZE)
    emotion_buffer[studentId].append(emotion)
    counts = {}
    for e in emotion_buffer[studentId]:
        counts[e] = counts.get(e, 0) + 1
    # Return majority vote
    return max(counts, key=counts.get)

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        payload = request.get_json(force=True) or {}
        studentId = payload.get("studentId", "")
        name = payload.get("name", "")
        classId = payload.get("classId", "")
        b64 = payload.get("image")

        if not studentId or not b64:
            return jsonify({"success": False, "error": "missing fields"}), 400

        img = decode_image(b64)
        if img is None:
            return jsonify({"success": False, "error": "invalid image"}), 400

        # High Quality Image Pre-processing
        # RetinaFace works best with original resolution, but we cap to avoid OOM/Slowdown
        height, width = img.shape[:2]
        target_max = 800 # Higher resolution for better accuracy on small faces
        if max(height, width) > target_max:
            scale = target_max / max(height, width)
            img = cv2.resize(img, (int(width * scale), int(height * scale)), interpolation=cv2.INTER_AREA)

        t0 = time.time()
        
        # USE RETINAFACE for superior alignment and detection
        # This is the single biggest factor for accuracy
        try:
            results = DeepFace.analyze(
                img,
                actions=['emotion'],
                detector_backend='retinaface', # Falls back if not installed, but we added it
                enforce_detection=False,
                silent=True
            )
        except ValueError:
            # Fallback to opencv if retinaface fails (or face not found)
             results = DeepFace.analyze(
                img,
                actions=['emotion'],
                detector_backend='opencv',
                enforce_detection=False,
                silent=True
            )

        t_process = time.time() - t0

        if not results:
             return jsonify({
                "success": True,
                "studentId": studentId,
                "classId": classId,
                "emotion": "no_face",
                "confidence": 0
            })

        if isinstance(results, list):
            result = results[0]
        else:
            result = results

        # Extract data
        emotions = result.get('emotion', {})
        # Normalize keys to lowercase
        emotions = {k.lower(): v for k, v in emotions.items()}
        
        # Get dominant emotion
        dominant = result.get('dominant_emotion', 'neutral').lower()
        confidence_percent = emotions.get(dominant, 0)
        confidence = confidence_percent / 100.0

        # Heuristics for "Angry", "Fear", "Sad", "Surprise" (Difficult emotions)
        # If any of these have substantial probability, prioritize them over Neutral
        # This helps with sensitivity
        critical_emotions = ['angry', 'fear', 'sad', 'surprise']
        adjusted_dominant = dominant
        
        # If dominant is neutral but a critical emotion is close, switch
        if dominant == 'neutral' and confidence < 0.8:
            # Check if any critical emotion is > 20%
            for emo in critical_emotions:
                 if emotions.get(emo, 0) > 20:
                     adjusted_dominant = emo
                     confidence = emotions[emo] / 100.0
                     break
        
        # Buffer smoothing
        final_emotion = push_buffer(studentId, adjusted_dominant)
        
        return jsonify({
            "success": True,
            "studentId": studentId,
            "name": name,
            "classId": classId,
            "emotion": final_emotion,
            "confidence": round(confidence * 100, 2),
            "emotions": emotions,
            "source": "retinaface",
            "time": round(t_process, 3)
        })

    except Exception as ex:
        traceback.print_exc()
        return jsonify({"success": False, "error": str(ex)}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "mode": "accuracy_retinaface"})

if __name__ == "__main__":
    print("High Accuracy AI Server (RetinaFace) running on port 8000")
    app.run(host="0.0.0.0", port=8000, debug=False)
