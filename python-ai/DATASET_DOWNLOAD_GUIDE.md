# 📥 Dataset Download Guide

## Overview

This guide will help you download and organize the datasets needed for training your 90%+ accurate emotion detection model.

---

## 📊 Required Datasets

1. **FER2013** - Facial Expression Recognition 2013 (~200MB)
2. **CK+** - Extended Cohn-Kanade Dataset (~50MB)
3. **RAF-DB** - Real-world Affective Faces Database (~1.5GB)
4. **AffectNet** - AffectNet 7-class emotion dataset (~2GB)

**Total size**: ~3.7GB

---

## 🚀 Quick Start

### Option 1: Automated Download (Recommended)

```bash
cd python-ai
python download_datasets.py
```

This will:
- Download FER2013 and CK+ from Kaggle (if credentials set up)
- Show instructions for RAF-DB and AffectNet
- Organize datasets automatically

### Option 2: Manual Download

Follow the instructions below for each dataset.

---

## 📋 Dataset Download Instructions

### 1. FER2013 (Kaggle)

**Size**: ~200MB  
**Source**: Kaggle

#### Method 1: Kaggle API (Recommended)

```bash
# Install Kaggle API
pip install kaggle

# Set up credentials (see below)
# Download dataset
kaggle datasets download -d msambare/fer2013 -p data/fer2013
cd data/fer2013
unzip fer2013.zip
```

#### Method 2: Manual Download

1. Visit: https://www.kaggle.com/datasets/msambare/fer2013
2. Click "Download" button
3. Extract to: `python-ai/data/fer2013/`
4. Organize into folders:
   ```
   data/fer2013/train/happy/
   data/fer2013/train/sad/
   data/fer2013/train/angry/
   data/fer2013/train/fear/
   data/fer2013/train/surprise/
   data/fer2013/train/disgust/
   data/fer2013/train/neutral/
   ```

#### Kaggle API Setup

1. Go to https://www.kaggle.com/account
2. Click "Create New API Token"
3. Download `kaggle.json`
4. Place it in `~/.kaggle/kaggle.json`
5. Run: `chmod 600 ~/.kaggle/kaggle.json`

---

### 2. CK+ (Kaggle)

**Size**: ~50MB  
**Source**: Kaggle

#### Method 1: Kaggle API

```bash
kaggle datasets download -d shawon10/ckplus -p data/ck+
cd data/ck+
unzip ckplus.zip
```

#### Method 2: Manual Download

1. Visit: https://www.kaggle.com/datasets/shawon10/ckplus
2. Click "Download" button
3. Extract to: `python-ai/data/ck+/`
4. Organize into emotion folders

---

### 3. RAF-DB (Manual Download)

**Size**: ~1.5GB  
**Source**: Official website (requires registration)

#### Download Steps

1. Visit: http://www.whdeng.cn/raf/model1.html
2. Register for an account
3. Request access to RAF-DB dataset
4. Download the dataset
5. Extract to: `python-ai/data/raf-db/`
6. Organize into emotion folders:
   ```
   data/raf-db/train/happy/
   data/raf-db/train/sad/
   data/raf-db/train/angry/
   data/raf-db/train/fear/
   data/raf-db/train/surprise/
   data/raf-db/train/disgust/
   data/raf-db/train/neutral/
   ```

**Note**: Registration may take 1-2 days for approval.

---

### 4. AffectNet (Manual Download)

**Size**: ~2GB  
**Source**: GitHub repository

#### Download Steps

1. Visit: https://github.com/affectnet/emotionnet
2. Follow the download instructions
3. Download the 7-class emotion subset
4. Extract to: `python-ai/data/affectnet/`
5. Organize into emotion folders:
   ```
   data/affectnet/train/happy/
   data/affectnet/train/sad/
   data/affectnet/train/angry/
   data/affectnet/train/fear/
   data/affectnet/train/surprise/
   data/affectnet/train/disgust/
   data/affectnet/train/neutral/
   ```

**Note**: AffectNet requires following their specific download procedure.

---

## 📁 Expected Directory Structure

After downloading and organizing, your structure should look like:

```
python-ai/
  data/
    fer2013/
      train/
        happy/ (images)
        sad/ (images)
        angry/ (images)
        fear/ (images)
        surprise/ (images)
        disgust/ (images)
        neutral/ (images)
    ck+/
      train/
        happy/ (images)
        sad/ (images)
        ...
    raf-db/
      train/
        happy/ (images)
        sad/ (images)
        ...
    affectnet/
      train/
        happy/ (images)
        sad/ (images)
        ...
```

---

## ✅ Verification

### Check Dataset Structure

```bash
python download_datasets.py
# Choose option 4: Check dataset structure
```

Or manually check:

```bash
# Check if all emotion folders exist
ls data/fer2013/train/
ls data/ck+/train/
ls data/raf-db/train/
ls data/affectnet/train/
```

Each folder should contain:
- `happy/` - Happy emotion images
- `sad/` - Sad emotion images
- `angry/` - Angry emotion images
- `fear/` - Fear emotion images
- `surprise/` - Surprise emotion images
- `disgust/` - Disgust emotion images
- `neutral/` - Neutral emotion images

---

## 🔧 Dataset Organization Script

If your datasets are not in the expected format, you may need to organize them:

```python
# organize_datasets.py (create if needed)
import os
from pathlib import Path
from emotion_mapping import map_dataset_label, EMOTION_CLASSES

def organize_dataset(source_dir, target_dir, dataset_name):
    """
    Organize dataset images into emotion folders
    """
    source = Path(source_dir)
    target = Path(target_dir) / 'train'
    target.mkdir(parents=True, exist_ok=True)
    
    # Create emotion folders
    for emotion in EMOTION_CLASSES:
        (target / emotion).mkdir(exist_ok=True)
    
    # Organize images based on your dataset structure
    # (Implementation depends on dataset format)
    # ...
```

---

## 📊 Dataset Statistics

After downloading, you should have:

- **FER2013**: ~28,000 training images
- **CK+**: ~1,000+ images
- **RAF-DB**: ~12,000 training images
- **AffectNet**: ~280,000 training images (7-class subset)

**Total**: ~320,000+ training images

---

## 🐛 Troubleshooting

### Issue: Kaggle API not working

**Solution**:
1. Check credentials: `cat ~/.kaggle/kaggle.json`
2. Verify permissions: `chmod 600 ~/.kaggle/kaggle.json`
3. Test: `kaggle datasets list`

### Issue: Dataset structure incorrect

**Solution**:
1. Check expected structure above
2. Use organization script
3. Manually organize if needed

### Issue: Missing emotion folders

**Solution**:
1. Create missing folders: `mkdir -p data/fer2013/train/{happy,sad,angry,fear,surprise,disgust,neutral}`
2. Move images to correct folders
3. Verify with check script

### Issue: RAF-DB registration pending

**Solution**:
1. Wait for approval (1-2 days)
2. Check email for approval notification
3. Use other datasets first (FER2013, CK+, AffectNet)

---

## ⚡ Quick Download Commands

### Kaggle Datasets (if API set up)

```bash
# FER2013
kaggle datasets download -d msambare/fer2013 -p data/fer2013
cd data/fer2013 && unzip fer2013.zip && cd ../..

# CK+
kaggle datasets download -d shawon10/ckplus -p data/ck+
cd data/ck+ && unzip ckplus.zip && cd ../..
```

### Manual Downloads

- **RAF-DB**: Visit http://www.whdeng.cn/raf/model1.html
- **AffectNet**: Visit https://github.com/affectnet/emotionnet

---

## ✅ Checklist

- [ ] Install Kaggle API: `pip install kaggle`
- [ ] Set up Kaggle credentials
- [ ] Download FER2013
- [ ] Download CK+
- [ ] Register for RAF-DB
- [ ] Download RAF-DB
- [ ] Download AffectNet
- [ ] Organize all datasets
- [ ] Verify dataset structure
- [ ] Check image counts in each folder

---

## 📝 Next Steps

After downloading all datasets:

1. **Verify structure**: Run `python download_datasets.py` and choose option 4
2. **Start training**: Run `python train_emotion_model.py`
3. **Monitor progress**: Check training logs
4. **Export model**: After training completes

---

**Good luck with downloading! Once all datasets are ready, you can start training your 90%+ accurate model!** 🚀

