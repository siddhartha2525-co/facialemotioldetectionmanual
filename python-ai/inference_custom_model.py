# inference_custom_model.py
# Inference using trained custom emotion detection model
# Can be integrated with api_server_hybrid.py

import torch
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
import numpy as np
import cv2
from train_emotion_model import EmotionResNet34, CONFIG
from emotion_mapping import EMOTION_CLASSES, INDEX_TO_EMOTION

class CustomEmotionDetector:
    """Custom emotion detector using trained ResNet-34 model"""
    
    def __init__(self, model_path, device='cpu'):
        self.device = device
        self.model = EmotionResNet34(num_classes=7, pretrained=False)
        
        # Load trained weights
        checkpoint = torch.load(model_path, map_location=device)
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model.eval()
        self.model = self.model.to(device)
        
        # Image preprocessing
        self.transform = transforms.Compose([
            transforms.Resize((CONFIG['image_size'], CONFIG['image_size'])),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                              std=[0.229, 0.224, 0.225])
        ])
        
        print(f"✓ Custom emotion model loaded from {model_path}")
        print(f"  Device: {device}")
        print(f"  Image size: {CONFIG['image_size']}x{CONFIG['image_size']}")
    
    def preprocess_image(self, img):
        """
        Preprocess image for inference
        
        Args:
            img: PIL Image or numpy array
        
        Returns:
            Preprocessed tensor
        """
        if isinstance(img, np.ndarray):
            img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Apply transforms
        img_tensor = self.transform(img).unsqueeze(0)
        return img_tensor.to(self.device)
    
    def detect_emotion(self, img):
        """
        Detect emotion in image
        
        Args:
            img: PIL Image or numpy array
        
        Returns:
            dict with emotion, confidence, and probabilities
        """
        # Preprocess
        img_tensor = self.preprocess_image(img)
        
        # Inference
        with torch.no_grad():
            outputs = self.model(img_tensor)
            probabilities = F.softmax(outputs, dim=1)
            confidence, predicted = torch.max(probabilities, 1)
        
        # Get emotion
        emotion_idx = predicted.item()
        emotion = INDEX_TO_EMOTION[emotion_idx]
        confidence_score = confidence.item()
        
        # Get all probabilities
        prob_dict = {}
        for i, prob in enumerate(probabilities[0]):
            prob_dict[INDEX_TO_EMOTION[i]] = prob.item()
        
        return {
            'emotion': emotion,
            'confidence': confidence_score,
            'probabilities': prob_dict,
            'all_emotions': prob_dict
        }
    
    def detect_emotion_from_base64(self, base64_string):
        """
        Detect emotion from base64 encoded image
        
        Args:
            base64_string: Base64 encoded image string
        
        Returns:
            dict with emotion, confidence, and probabilities
        """
        import base64
        from io import BytesIO
        
        # Decode base64
        if ',' in base64_string:
            base64_string = base64_string.split(',', 1)[1]
        
        img_bytes = base64.b64decode(base64_string)
        img = Image.open(BytesIO(img_bytes)).convert('RGB')
        
        return self.detect_emotion(img)
    
    def detect_emotion_from_path(self, image_path):
        """
        Detect emotion from image file path
        
        Args:
            image_path: Path to image file
        
        Returns:
            dict with emotion, confidence, and probabilities
        """
        img = Image.open(image_path).convert('RGB')
        return self.detect_emotion(img)

# Example usage
if __name__ == '__main__':
    # Initialize detector
    model_path = 'models/emotion_resnet34_best.pth'
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    
    detector = CustomEmotionDetector(model_path, device=device)
    
    # Test with image
    # result = detector.detect_emotion_from_path('test_image.jpg')
    # print(f"Emotion: {result['emotion']}")
    # print(f"Confidence: {result['confidence']:.2%}")
    # print(f"Probabilities: {result['probabilities']}")

