# python-ai/api_server_hybrid.py
# Hybrid AI server: Optimized for speed and accuracy

from flask import Flask, request, jsonify
from flask_cors import CORS
from deepface import DeepFace
import numpy as np
import cv2, base64, time, traceback
from collections import deque

app = Flask(__name__)
CORS(app)

# smoothing buffer (last N emotions) - reduced for faster adaptation
BUFF_SIZE = 3
emotion_buffer = {}  # studentId -> deque(maxlen=BUFF_SIZE)

# thresholds (optimized for speed and accuracy)
FAST_CONFIDENCE_THRESHOLD = 0.45   # Lower threshold for faster acceptance
FALLBACK_CONFIDENCE_THRESHOLD = 0.25  # Lower minimum for better detection

def decode_image(b64):
    try:
        if "," in b64:
            b64 = b64.split(',', 1)[1]
        im_bytes = base64.b64decode(b64)
        arr = np.frombuffer(im_bytes, np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        
        # Optimize image size for better detection accuracy (max 640x480 for optimal face detection)
        # Larger images provide better face detail for emotion detection
        if img is not None:
            height, width = img.shape[:2]
            max_dim = 640  # Increased from 480 for better accuracy
            if width > max_dim or height > max_dim:
                scale = max_dim / max(width, height)
                new_width = int(width * scale)
                new_height = int(height * scale)
                # Use INTER_AREA for downscaling (better quality)
                img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_AREA)
        
        return img
    except Exception as e:
        return None

def push_buffer(studentId, emotion):
    if studentId not in emotion_buffer:
        emotion_buffer[studentId] = deque(maxlen=BUFF_SIZE)
    emotion_buffer[studentId].append(emotion)
    counts = {}
    for e in emotion_buffer[studentId]:
        counts[e] = counts.get(e, 0) + 1
    return max(counts, key=counts.get)

def low_light(img):
    # More lenient lighting check
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return np.mean(gray) < 30  # Only reject very dark images

def small_face(region):
    # More lenient - accept smaller faces for better detection
    return region.get("w", 0) < 50 or region.get("h", 0) < 50

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

        # Skip low light check for speed - let models handle it
        
        # Optimize image for better detection accuracy
        # Use larger size (480px) for better face detail while maintaining speed
        height, width = img.shape[:2]
        target_size = 480  # Increased from 300 for better accuracy
        if max(width, height) > target_size:
            scale = target_size / max(width, height)
            new_width = int(width * scale)
            new_height = int(height * scale)
            # Use INTER_AREA for downscaling (better quality than INTER_LINEAR)
            img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_AREA)

        # 1) Fast-pass: Use fastest backend and model
        res_fast = None
        t_fast = None
        try:
            t0 = time.time()
            # Use 'opencv' backend (fastest) with 'OpenFace' (fastest emotion model)
            res_fast = DeepFace.analyze(
                img,
                actions=['emotion'],
                detector_backend='opencv',  # Fastest backend
                model_name='OpenFace',  # Fastest model
                enforce_detection=False,
                silent=True
            )
            t_fast = time.time() - t0
        except Exception as e:
            print(f"OpenFace error: {e}")
            res_fast = None

        if res_fast:
            # Handle both dict and list responses
            if isinstance(res_fast, list):
                res_fast = res_fast[0]
            
            if "dominant_emotion" in res_fast:
                raw_fast = res_fast["dominant_emotion"].lower()
                emotions_dict = res_fast.get("emotion", {})
                # DeepFace returns emotions as percentages (0-100), convert to decimal
                conf_raw = float(emotions_dict.get(raw_fast, 0))
                conf_fast = conf_raw / 100.0 if conf_raw > 1.0 else conf_raw
                region = res_fast.get("region", {})
                
                if small_face(region):
                    return jsonify({
                        "success": True,
                        "studentId": studentId,
                        "name": name,
                        "classId": classId,
                        "emotion": "no_face",
                        "confidence": 0,
                        "warning": "small_face"
                    })
                
                # Accept OpenFace result if confidence meets threshold (lowered for speed)
                if conf_fast >= FAST_CONFIDENCE_THRESHOLD:
                    final = push_buffer(studentId, raw_fast)
                    return jsonify({
                        "success": True,
                        "studentId": studentId,
                        "name": name,
                        "classId": classId,
                        "emotion": final,
                        "confidence": conf_fast * 100,  # Return as percentage
                        "source": "openface",
                        "fast_time": round(t_fast, 3)
                    })
                # Accept even lower confidence for speed (better than waiting for fallback)
                elif conf_fast >= 0.25:
                    final = push_buffer(studentId, raw_fast)
                    return jsonify({
                        "success": True,
                        "studentId": studentId,
                        "name": name,
                        "classId": classId,
                        "emotion": final,
                        "confidence": conf_fast * 100,
                        "source": "openface",
                        "fast_time": round(t_fast, 3)
                    })

        # 2) Fallback: Try FER2013 (fastest emotion model), then VGG-Face, then default
        res_slow = None
        t_slow = None
        models_to_try = ['FER2013', 'VGG-Face']  # Try FER2013 first, then VGG-Face
        
        for model_name in models_to_try:
            try:
                t0 = time.time()
                res_slow = DeepFace.analyze(
                    img,
                    actions=['emotion'],
                    detector_backend='opencv',  # Fastest backend
                    model_name=model_name,
                    enforce_detection=False,
                    silent=True
                )
                t_slow = time.time() - t0
                break  # Success, exit loop
            except Exception as e:
                print(f"{model_name} error: {e}")
                res_slow = None
                continue
        
        # Last resort: default model if both failed
        if res_slow is None:
            try:
                t0 = time.time()
                res_slow = DeepFace.analyze(
                    img,
                    actions=['emotion'],
                    detector_backend='opencv',
                    enforce_detection=False,
                    silent=True
                )
                t_slow = time.time() - t0
            except Exception as e2:
                print(f"Default model error: {e2}")
                res_slow = None

        if res_slow:
            # Handle both dict and list responses
            if isinstance(res_slow, list):
                res_slow = res_slow[0]
            
            if "dominant_emotion" in res_slow:
                raw_slow = res_slow["dominant_emotion"].lower()
                emotions_dict = res_slow.get("emotion", {})
                # DeepFace returns emotions as percentages (0-100), convert to decimal
                if raw_slow in emotions_dict:
                    conf_slow = float(emotions_dict[raw_slow]) / 100.0
                else:
                    # If dominant emotion not in dict, use max confidence
                    max_conf = float(max(emotions_dict.values()) if emotions_dict else 0)
                    conf_slow = max_conf / 100.0 if max_conf > 1.0 else max_conf
                region = res_slow.get("region", {})
                
                if small_face(region):
                    return jsonify({
                        "success": True,
                        "studentId": studentId,
                        "name": name,
                        "classId": classId,
                        "emotion": "no_face",
                        "confidence": 0,
                        "warning": "small_face"
                    })
                
                # Accept VGG-Face result if confidence is reasonable
                if conf_slow >= FALLBACK_CONFIDENCE_THRESHOLD:
                    final = push_buffer(studentId, raw_slow)
                    return jsonify({
                        "success": True,
                        "studentId": studentId,
                        "name": name,
                        "classId": classId,
                        "emotion": final,
                        "confidence": conf_slow * 100,  # Return as percentage
                        "source": "fallback",
                        "fast_time": round(t_fast, 3) if t_fast else None,
                        "slow_time": round(t_slow, 3)
                    })
                # Accept even lower confidence for speed
                elif conf_slow > 0.15:
                    final = push_buffer(studentId, raw_slow)
                    return jsonify({
                        "success": True,
                        "studentId": studentId,
                        "name": name,
                        "classId": classId,
                        "emotion": final,
                        "confidence": conf_slow * 100,
                        "source": "fallback",
                        "fast_time": round(t_fast, 3) if t_fast else None,
                        "slow_time": round(t_slow, 3)
                    })

        return jsonify({
            "success": True,
            "studentId": studentId,
            "name": name,
            "classId": classId,
            "emotion": "neutral",  # Default to neutral instead of no_face
            "confidence": 30,  # Low confidence but not zero
            "warning": "no_detection"
        })
    except Exception as ex:
        traceback.print_exc()
        return jsonify({"success": False, "error": str(ex)}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "mode": "hybrid",
        "openface_threshold": FAST_CONFIDENCE_THRESHOLD,
        "fallback_threshold": FALLBACK_CONFIDENCE_THRESHOLD
    })

if __name__ == "__main__":
    print("Hybrid AI server (OpenFace -> Facenet512) running on http://0.0.0.0:8000")
    app.run(host="0.0.0.0", port=8000, debug=False)

