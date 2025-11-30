# 📥 Manual Dataset Download Guide (No API Token Needed)

## Overview

If you can't get the Kaggle API token, you can still download datasets manually! This guide will help you.

---

## 🚀 Quick Steps

### Step 1: Download FER2013

1. **Visit Kaggle**
   - Go to: https://www.kaggle.com/datasets/msambare/fer2013
   - Sign in (create account if needed)

2. **Download Dataset**
   - Click the **"Download"** button (top right)
   - Wait for download to complete
   - File will be in your Downloads folder

3. **Extract**
   - Extract the zip file
   - You should see folders like: `train/Angry/`, `train/Happy/`, etc.

### Step 2: Download CK+

1. **Visit Kaggle**
   - Go to: https://www.kaggle.com/datasets/shawon10/ckplus
   - Sign in

2. **Download Dataset**
   - Click **"Download"** button
   - Extract the zip file

### Step 3: Organize Datasets

Use the helper script:

```bash
cd python-ai
python organize_manual_downloads.py
```

Or organize manually:

```
python-ai/
  data/
    fer2013/
      train/
        happy/ (copy images here)
        sad/
        angry/
        fear/
        surprise/
        disgust/
        neutral/
    ck+/
      train/
        happy/
        sad/
        ...
```

---

## 📋 Detailed Instructions

### FER2013 Manual Download

1. **Go to Dataset Page**
   - URL: https://www.kaggle.com/datasets/msambare/fer2013
   - Sign in to Kaggle

2. **Download**
   - Click "Download" button (top right, next to "New Notebook")
   - File size: ~200MB
   - Download will start automatically

3. **Extract**
   ```bash
   cd ~/Downloads
   unzip fer2013.zip
   ```

4. **Organize**
   ```bash
   cd python-ai
   python organize_manual_downloads.py
   # Choose option 1: Organize FER2013
   # Enter path: ~/Downloads/fer2013 (or wherever you extracted)
   ```

### CK+ Manual Download

1. **Go to Dataset Page**
   - URL: https://www.kaggle.com/datasets/shawon10/ckplus
   - Sign in to Kaggle

2. **Download**
   - Click "Download" button
   - File size: ~50MB

3. **Extract and Organize**
   ```bash
   cd python-ai
   python organize_manual_downloads.py
   # Choose option 2: Organize CK+
   ```

---

## 🛠️ Using the Organizer Script

The `organize_manual_downloads.py` script will:

1. **Ask for dataset type**
   - FER2013 (knows the structure)
   - CK+ (knows the structure)
   - Generic (for any dataset)

2. **Ask for source path**
   - Path to your extracted dataset folder

3. **Organize automatically**
   - Creates proper folder structure
   - Copies images to correct emotion folders
   - Maps different label formats

4. **Verify**
   - Shows how many images were organized
   - Confirms structure is correct

---

## 📁 Expected Structure After Organization

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
```

---

## ✅ Verification

After organizing, verify the structure:

```bash
cd python-ai
python download_datasets.py
# Choose option 4: Check dataset structure
```

Or manually check:

```bash
ls data/fer2013/train/
ls data/ck+/train/
```

Each folder should contain image files (.jpg or .png).

---

## 🎯 Alternative: Start Training with Available Datasets

You don't need all datasets to start training! You can:

1. **Use what you have**
   - Download RAF-DB manually (registration required)
   - Download AffectNet from GitHub
   - Use any emotion datasets you have

2. **Start training**
   ```bash
   python train_emotion_model.py
   ```
   - Script will use whatever datasets are available
   - You can add more datasets later

3. **Add datasets incrementally**
   - Train with available datasets first
   - Add FER2013 and CK+ later when accessible
   - Model will improve with more data

---

## 💡 Tips

### If Download Button Doesn't Work:

1. **Try different browser**
   - Chrome, Firefox, Safari
   - Disable extensions

2. **Check account status**
   - Make sure you're signed in
   - Verify email if needed

3. **Try direct download link**
   - Sometimes direct links work better
   - Check dataset page for alternative links

### If Organization Fails:

1. **Check folder structure**
   - Make sure images are in subfolders
   - Check folder names match emotions

2. **Use generic organizer**
   - Option 3 in the script
   - Works with any structure

3. **Organize manually**
   - Create emotion folders
   - Copy images manually
   - Use emotion mapping if needed

---

## 📊 Dataset Sizes

- **FER2013**: ~200MB (28,000 images)
- **CK+**: ~50MB (1,000+ images)
- **RAF-DB**: ~1.5GB (12,000 images)
- **AffectNet**: ~2GB (280,000 images)

**Note**: You can train with just one or two datasets and still get good results!

---

## ✅ Checklist

- [ ] Signed in to Kaggle
- [ ] Downloaded FER2013 manually
- [ ] Downloaded CK+ manually
- [ ] Extracted zip files
- [ ] Ran organizer script
- [ ] Verified dataset structure
- [ ] Ready to train!

---

## 🚀 Next Steps

After organizing datasets:

1. **Verify structure**
   ```bash
   python download_datasets.py
   # Option 4: Check dataset structure
   ```

2. **Start training**
   ```bash
   python train_emotion_model.py
   ```

3. **Monitor progress**
   - Check training logs
   - Wait for completion (~4-6 hours on GPU)

---

**You can download and organize datasets manually - no API token needed!** 🎯

