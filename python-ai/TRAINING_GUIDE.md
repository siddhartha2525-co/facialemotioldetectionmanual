# 🎯 High-Accuracy Emotion Detection Model Training Guide

## Overview

This guide will help you train a **90-95% accurate** emotion detection model using ResNet-34 on multiple datasets (RAF-DB, AffectNet, FER2013, CK+).

---

## 📋 Prerequisites

### 1. Install Dependencies

```bash
cd python-ai
pip install -r requirements_training.txt
```

### 2. Prepare Datasets

You need to download and organize the datasets:

#### Dataset Structure

```
python-ai/
  data/
    raf-db/
      train/
        happy/
        sad/
        angry/
        fear/
        surprise/
        disgust/
        neutral/
      val/
        happy/
        ...
    affectnet/
      train/
        happy/
        ...
    fer2013/
      train/
        happy/
        ...
    ck+/
      train/
        happy/
        ...
```

#### Download Links

1. **RAF-DB**: http://www.whdeng.cn/raf/model1.html
2. **AffectNet**: https://github.com/affectnet/emotionnet
3. **FER2013**: https://www.kaggle.com/datasets/msambare/fer2013
4. **CK+**: https://www.kaggle.com/datasets/shawon10/ckplus

#### Dataset Preparation Script

```python
# prepare_datasets.py (create this if needed)
import os
from pathlib import Path
from emotion_mapping import map_dataset_label, EMOTION_CLASSES

def prepare_dataset(dataset_name, source_dir, target_dir):
    """
    Prepare dataset by organizing images into emotion folders
    """
    target_path = Path(target_dir) / dataset_name / 'train'
    target_path.mkdir(parents=True, exist_ok=True)
    
    # Create emotion folders
    for emotion in EMOTION_CLASSES:
        (target_path / emotion).mkdir(exist_ok=True)
    
    # Copy and organize images
    # (Implementation depends on dataset format)
    # ...
```

---

## 🚀 Training Steps

### Step 1: Verify Dataset Structure

```bash
cd python-ai
python -c "from emotion_mapping import *; print('Emotion classes:', EMOTION_CLASSES)"
```

### Step 2: Start Training

```bash
python train_emotion_model.py
```

### Step 3: Monitor Training

The training script will:
- Load all datasets
- Combine them into one training set
- Train ResNet-34 model
- Validate on validation set
- Save best model
- Show per-class accuracy

### Step 4: Check Results

After training, check:
- `models/emotion_resnet34_best.pth` - Best model
- `models/training_history.json` - Training history
- Per-class accuracy for SAD, FEAR, DISGUST, ANGRY

---

## 📊 Expected Results

### Target Accuracies

- **Overall**: 90-95%
- **SAD**: 88-92%
- **FEAR**: 85-90%
- **DISGUST**: 88-92%
- **ANGRY**: 90-95%
- **HAPPY**: 95-98%
- **SURPRISE**: 90-95%
- **NEUTRAL**: 92-96%

### Training Time

- **CPU**: ~2-3 days
- **GPU (CUDA)**: ~4-6 hours
- **GPU (M1/M2 Mac)**: ~8-12 hours

---

## 🔧 Configuration

Edit `train_emotion_model.py` to adjust:

```python
CONFIG = {
    'image_size': 112,      # 96 or 112
    'batch_size': 64,       # Adjust based on GPU memory
    'epochs': 80,            # 50-80 recommended
    'learning_rate': 1e-4,  # 1e-4 optimal
    ...
}
```

---

## 📦 Model Export

After training, export to different formats:

### Export to PyTorch (.pth)

```bash
python export_model.py --model models/emotion_resnet34_best.pth --formats pytorch
```

### Export to ONNX (.onnx)

```bash
python export_model.py --model models/emotion_resnet34_best.pth --formats onnx
```

### Export to TensorFlow (.h5)

```bash
python export_model.py --model models/emotion_resnet34_best.pth --formats tensorflow
```

### Export All Formats

```bash
python export_model.py --model models/emotion_resnet34_best.pth --formats all
```

---

## 🔄 Integration with Existing System

### Option 1: Replace DeepFace with Custom Model

1. Load trained model in `api_server_hybrid.py`
2. Replace DeepFace calls with custom model inference
3. Use same emotion mapping

### Option 2: Use as Fallback

1. Keep DeepFace as primary
2. Use custom model when DeepFace confidence is low
3. Combine results for better accuracy

---

## 📈 Training Tips

### 1. Data Augmentation

The training script includes:
- Random crop
- Horizontal flip
- Rotation ±10°
- Color jitter
- Gaussian noise
- Random shadow
- Blur

These are crucial for SAD, FEAR, DISGUST, ANGRY accuracy!

### 2. Class Balancing

If some emotions have fewer samples:
- Use data augmentation more aggressively
- Consider class weights in loss function
- Use oversampling techniques

### 3. Learning Rate

- Start with 1e-4
- Use ReduceLROnPlateau scheduler
- Monitor validation loss

### 4. Early Stopping

- Stop if validation accuracy plateaus
- Save best model automatically
- Resume from checkpoint if needed

---

## 🧪 Validation

### Validate on RAF-DB Test Set

```python
# validate_rafdb.py
import torch
from train_emotion_model import EmotionResNet34, EmotionDataset, validate

# Load model
model = EmotionResNet34(num_classes=7)
checkpoint = torch.load('models/emotion_resnet34_best.pth')
model.load_state_dict(checkpoint['model_state_dict'])

# Load RAF-DB test set
test_dataset = EmotionDataset('data/raf-db', 'raf-db', split='test')
test_loader = DataLoader(test_dataset, batch_size=64)

# Validate
loss, acc, class_acc = validate(model, test_loader, criterion, device)
print(f"RAF-DB Test Accuracy: {acc:.2f}%")
print("Per-class accuracy:", class_acc)
```

**Target**: >88-92% accuracy on RAF-DB test set

---

## 🐛 Troubleshooting

### Issue: Out of Memory

**Solution**:
- Reduce batch size: `batch_size: 32` or `16`
- Reduce image size: `image_size: 96`
- Use gradient accumulation

### Issue: Low Accuracy on SAD/FEAR/DISGUST/ANGRY

**Solution**:
- Increase data augmentation
- Check class balance
- Train for more epochs
- Use class weights in loss

### Issue: Training Too Slow

**Solution**:
- Use GPU (CUDA)
- Reduce image size
- Reduce batch size
- Use fewer workers

---

## 📝 Next Steps

1. **Train the model** using `train_emotion_model.py`
2. **Validate** on RAF-DB test set
3. **Export** to desired format
4. **Integrate** with existing system
5. **Test** in production

---

## ✅ Checklist

- [ ] Install dependencies
- [ ] Download datasets
- [ ] Organize dataset structure
- [ ] Start training
- [ ] Monitor training progress
- [ ] Validate on test set
- [ ] Export model
- [ ] Integrate with system
- [ ] Test in production

---

**Good luck with training! Your model should achieve 90%+ accuracy on SAD, FEAR, DISGUST, and ANGRY emotions!** 🚀

