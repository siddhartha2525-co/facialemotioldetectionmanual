# 🚀 Organize Your 3 Downloaded Datasets - Quick Guide

## ✅ You Have 3 Datasets - Let's Organize Them!

---

## 📋 Quick Steps

### Step 1: Find Your Datasets

Your datasets are likely in:
- `~/Downloads/` folder
- Or extracted somewhere on your computer

**Check where they are:**
```bash
# List zip files
ls ~/Downloads/*.zip

# List folders
ls ~/Downloads/
```

### Step 2: Organize Each Dataset

Run the organizer script for each dataset:

```bash
cd python-ai
python organize_manual_downloads.py
```

**For each dataset:**
1. **FER2013**: Choose option 1
   - Enter path: `~/Downloads/fer2013` (or wherever it is)

2. **CK+**: Choose option 2
   - Enter path: `~/Downloads/ck+` (or wherever it is)

3. **3rd Dataset**: Choose option 3 (Generic)
   - Enter path to the dataset folder
   - Enter dataset name (e.g., "raf-db" or "affectnet")

### Step 3: Verify Structure

```bash
python download_datasets.py
# Choose option 4: Check dataset structure
```

### Step 4: Start Training!

```bash
python train_emotion_model.py
```

---

## 🎯 All-in-One Command Sequence

```bash
cd python-ai

# Organize dataset 1 (FER2013)
python organize_manual_downloads.py
# Enter: 1
# Enter path: ~/Downloads/fer2013 (or actual path)

# Organize dataset 2 (CK+)
python organize_manual_downloads.py
# Enter: 2
# Enter path: ~/Downloads/ck+ (or actual path)

# Organize dataset 3
python organize_manual_downloads.py
# Enter: 3
# Enter path: ~/Downloads/[your-3rd-dataset]
# Enter name: [dataset-name]

# Verify
python download_datasets.py
# Enter: 4

# Start training!
python train_emotion_model.py
```

---

## 📁 What the Organizer Does

The organizer script will:
1. ✅ Create proper folder structure: `data/[dataset-name]/train/`
2. ✅ Create emotion folders: `happy/`, `sad/`, `angry/`, `fear/`, `surprise/`, `disgust/`, `neutral/`
3. ✅ Copy images to correct folders
4. ✅ Map different label formats automatically
5. ✅ Show progress and count of organized images

---

## 🔍 If You Don't Know the Paths

**Find your datasets:**

```bash
# Search for FER2013
find ~/Downloads -maxdepth 2 -iname "*fer*" -type d

# Search for CK+
find ~/Downloads -maxdepth 2 -iname "*ck*" -type d

# List all folders in Downloads
ls -d ~/Downloads/*/
```

**Then use those paths in the organizer script!**

---

## ✅ Expected Result

After organizing, you should have:

```
python-ai/
  data/
    fer2013/train/happy/, sad/, angry/, ...
    ck+/train/happy/, sad/, ...
    [your-3rd-dataset]/train/happy/, sad/, ...
```

---

## 🚀 Ready to Start?

**Run this now:**

```bash
cd python-ai
python organize_manual_downloads.py
```

**Then follow the prompts!** The script will guide you through organizing each dataset.

---

**After organizing all 3 datasets, you can start training immediately!** 🎯

