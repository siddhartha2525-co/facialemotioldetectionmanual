# python-ai/api_server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np, cv2, base64, time, traceback
from deepface import DeepFace
import os

app = Flask(__name__)
CORS(app)

# Use OpenCV Haar cascade for quick face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Configure DeepFace backend and model for better accuracy
# Try to use the most accurate backend available
DEEPFACE_BACKEND = 'opencv'  # or 'ssd', 'dlib', 'mtcnn', 'retinaface'
DEEPFACE_MODEL = 'VGG-Face'  # Emotion model is built-in, this is for face recognition if needed

def decode_b64_image(b64):
    """Decode data URL or raw base64 string into OpenCV BGR image."""
    if not b64:
        return None
    if ',' in b64:
        b64 = b64.split(',', 1)[1]
    try:
        img_bytes = base64.b64decode(b64)
        arr = np.frombuffer(img_bytes, dtype=np.uint8)
        img = cv2.imdecode(arr, flags=cv2.IMREAD_COLOR)
        return img
    except Exception:
        return None

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'ts': time.time()})

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        payload = request.get_json(force=True)
        image_b64 = payload.get('image')
        studentId = payload.get('studentId', '')
        name = payload.get('name', '')
        classId = payload.get('classId', '')

        if not image_b64 or not studentId:
            return jsonify({'error': 'missing image or studentId'}), 400

        img = decode_b64_image(image_b64)
        if img is None:
            return jsonify({'error': 'invalid image'}), 400

        # Improve image quality for better detection
        # Resize if too small (minimum 224x224 for DeepFace)
        height, width = img.shape[:2]
        if height < 224 or width < 224:
            scale = max(224 / height, 224 / width)
            new_width = int(width * scale)
            new_height = int(height * scale)
            img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_LINEAR)
        
        # Enhance image contrast for better face detection
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        l = clahe.apply(l)
        img = cv2.merge([l, a, b])
        img = cv2.cvtColor(img, cv2.COLOR_LAB2BGR)
        
        # convert to grayscale for Haar detection with improved parameters
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # More lenient face detection parameters
        faces = face_cascade.detectMultiScale(
            gray, 
            scaleFactor=1.05,  # Smaller steps for better detection
            minNeighbors=3,   # Lower threshold
            minSize=(50, 50), # Minimum face size
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        
        if len(faces) == 0:
            # Try DeepFace's built-in face detection as fallback
            try:
                analysis = DeepFace.analyze(
                    img, 
                    actions=['emotion'], 
                    enforce_detection=False,
                    silent=True
                )
                # Handle both dict and list responses from DeepFace
                if isinstance(analysis, list):
                    analysis = analysis[0]
                
                dominant = analysis.get('dominant_emotion', 'unknown')
                emotions = analysis.get('emotion', {}) or {}
                emotions = {k: float(v) for k, v in emotions.items()}
                confidence = float(max(emotions.values())) if emotions else 0.0
                
                return jsonify({
                    'studentId': studentId,
                    'name': name,
                    'classId': classId,
                    'emotion': dominant.lower() if dominant else 'unknown',
                    'confidence': confidence,
                    'emotions': emotions,
                    'box': None,
                    'timestamp': float(time.time())
                })
            except Exception as e:
                print(f"DeepFace fallback failed: {e}")
                return jsonify({
                    'studentId': studentId, 'name': name, 'classId': classId,
                    'emotion': 'no_face', 'confidence': 0.0, 'emotions': {}, 'box': None, 'timestamp': float(time.time())
                })

        # choose the biggest face
        faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
        (x, y, w, h) = faces[0]
        
        # Add padding around face for better emotion detection
        padding = 20
        x = max(0, x - padding)
        y = max(0, y - padding)
        w = min(img.shape[1] - x, w + 2 * padding)
        h = min(img.shape[0] - y, h + 2 * padding)
        
        face_img = img[y:y+h, x:x+w]
        
        # Ensure face image is large enough
        if face_img.shape[0] < 48 or face_img.shape[1] < 48:
            face_img = cv2.resize(face_img, (224, 224), interpolation=cv2.INTER_LINEAR)

        # DeepFace analyze - return emotion dict and dominant emotion
        try:
            analysis = DeepFace.analyze(
                face_img, 
                actions=['emotion'], 
                enforce_detection=False,
                silent=True  # Suppress verbose output
            )
            
            # Handle both dict and list responses from DeepFace
            if isinstance(analysis, list):
                analysis = analysis[0]
            
            dominant = analysis.get('dominant_emotion', 'unknown')
            emotions = analysis.get('emotion', {}) or {}
            
            # Normalize emotion names to lowercase
            dominant = dominant.lower() if dominant else 'unknown'
            emotions = {k.lower(): float(v) for k, v in emotions.items()}
            
            # Get confidence from the dominant emotion value
            confidence = float(emotions.get(dominant, 0.0)) if emotions else 0.0
            
            # If confidence is too low, try to get max from all emotions
            if confidence < 0.1 and emotions:
                max_emotion = max(emotions.items(), key=lambda x: x[1])
                dominant = max_emotion[0]
                confidence = float(max_emotion[1])
            
            # Normalize confidence to percentage (DeepFace returns 0-100)
            if confidence > 1.0:
                confidence = confidence / 100.0
            
        except Exception as e:
            print(f"DeepFace analysis error: {e}")
            traceback.print_exc()
            dominant = 'unknown'
            emotions = {}
            confidence = 0.0

        return jsonify({
            'studentId': studentId,
            'name': name,
            'classId': classId,
            'emotion': dominant,
            'confidence': round(confidence * 100, 2),  # Return as percentage
            'emotions': emotions,
            'box': [int(x), int(y), int(w), int(h)],
            'timestamp': float(time.time())
        })
    except Exception as ex:
        traceback.print_exc()
        return jsonify({'error': str(ex)}), 500

if __name__ == '__main__':
    # for local dev, use this; in prod use gunicorn
    app.run(host='0.0.0.0', port=8000, debug=False)