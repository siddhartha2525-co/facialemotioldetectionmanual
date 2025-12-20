# 🔧 Kaggle API Setup Guide

## Overview

This guide will help you set up the Kaggle API to download FER2013 and CK+ datasets automatically.

---

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

```bash
cd python-ai
python setup_kaggle_api.py
```

This script will:
- Install Kaggle API if needed
- Guide you through credential setup
- Test the connection
- Verify everything works

### Option 2: Manual Setup

Follow the steps below.

---

## 📋 Step-by-Step Setup

### Step 1: Install Kaggle API

```bash
pip install kaggle
```

Or if using the project's virtual environment:

```bash
cd python-ai
source venv/bin/activate  # On Mac/Linux
# OR
venv\Scripts\activate  # On Windows

pip install kaggle
```

---

### Step 2: Get Your Kaggle API Token

1. **Go to Kaggle Account Settings**
   - Visit: https://www.kaggle.com/account
   - Sign in to your Kaggle account (create one if needed)

2. **Create API Token**
   - Scroll down to the **"API"** section
   - Click **"Create New API Token"**
   - This will download a file named `kaggle.json`

3. **Save the File**
   - The file contains your username and API key
   - Keep it secure (don't share it publicly)

---

### Step 3: Place Credentials File

The `kaggle.json` file needs to be placed in a specific location:

#### On Mac/Linux:

```bash
# Create .kaggle directory (if it doesn't exist)
mkdir -p ~/.kaggle

# Move the downloaded kaggle.json file
mv ~/Downloads/kaggle.json ~/.kaggle/kaggle.json

# Set correct permissions (IMPORTANT!)
chmod 600 ~/.kaggle/kaggle.json
```

#### On Windows:

```powershell
# Create .kaggle directory
mkdir %USERPROFILE%\.kaggle

# Move the downloaded kaggle.json file
move %USERPROFILE%\Downloads\kaggle.json %USERPROFILE%\.kaggle\kaggle.json
```

**Note**: Windows doesn't require chmod, but make sure the file is not publicly readable.

---

### Step 4: Verify Setup

Test if everything works:

```bash
# Test Kaggle API
kaggle datasets list
```

You should see a list of datasets. If you get an error, check:
- Credentials file is in the correct location
- File permissions are correct (600 on Mac/Linux)
- Your Kaggle account is active

---

## ✅ Verification

### Quick Test

```bash
python setup_kaggle_api.py
```

This will:
- Check if Kaggle is installed
- Verify credentials exist
- Test the connection
- Confirm everything works

### Manual Test

```bash
# List available datasets (should work without errors)
kaggle datasets list

# Try downloading a small test dataset
kaggle datasets download -d msambare/fer2013 -p test_download
```

---

## 📥 Download Datasets

Once setup is complete, you can download datasets:

### Download FER2013

```bash
kaggle datasets download -d msambare/fer2013 -p data/fer2013
cd data/fer2013
unzip fer2013.zip
cd ../..
```

### Download CK+

```bash
kaggle datasets download -d shawon10/ckplus -p data/ck+
cd data/ck+
unzip ckplus.zip
cd ../..
```

### Or Use the Download Script

```bash
python download_datasets.py
# Choose option 1: Download all Kaggle datasets
```

---

## 🐛 Troubleshooting

### Issue: "403 - Forbidden" Error

**Cause**: Invalid credentials or incorrect permissions

**Solution**:
1. Verify `kaggle.json` is in `~/.kaggle/` (Mac/Linux) or `%USERPROFILE%\.kaggle\` (Windows)
2. Check file permissions: `chmod 600 ~/.kaggle/kaggle.json` (Mac/Linux)
3. Verify credentials are correct (re-download from Kaggle if needed)

---

### Issue: "kaggle: command not found"

**Cause**: Kaggle API not installed or not in PATH

**Solution**:
```bash
pip install kaggle
# If using virtual environment, make sure it's activated
```

---

### Issue: "Could not find kaggle.json"

**Cause**: Credentials file not in correct location

**Solution**:
1. Check file location: `ls ~/.kaggle/kaggle.json` (Mac/Linux)
2. Move file if needed: `mv kaggle.json ~/.kaggle/`
3. Set permissions: `chmod 600 ~/.kaggle/kaggle.json`

---

### Issue: "Permission denied" (Mac/Linux)

**Cause**: Incorrect file permissions

**Solution**:
```bash
chmod 600 ~/.kaggle/kaggle.json
```

---

### Issue: "Invalid API key"

**Cause**: Expired or invalid credentials

**Solution**:
1. Go to https://www.kaggle.com/account
2. Create a new API token
3. Replace `~/.kaggle/kaggle.json` with the new file
4. Set permissions: `chmod 600 ~/.kaggle/kaggle.json`

---

## 📝 kaggle.json File Format

Your `kaggle.json` file should look like this:

```json
{
  "username": "your_username",
  "key": "your_api_key_here"
}
```

**Important**: 
- Keep this file private
- Don't commit it to Git
- Don't share it publicly

---

## 🔒 Security Notes

1. **Never commit `kaggle.json` to Git**
   - Add to `.gitignore`: `~/.kaggle/kaggle.json`
   - Or use environment variables for CI/CD

2. **Set correct permissions**
   - Mac/Linux: `chmod 600 ~/.kaggle/kaggle.json`
   - Windows: Make sure file is not publicly readable

3. **Rotate keys if compromised**
   - Go to Kaggle account settings
   - Revoke old key
   - Create new key

---

## ✅ Checklist

- [ ] Kaggle account created/signed in
- [ ] API token downloaded (`kaggle.json`)
- [ ] File placed in `~/.kaggle/` (Mac/Linux) or `%USERPROFILE%\.kaggle\` (Windows)
- [ ] Permissions set: `chmod 600 ~/.kaggle/kaggle.json` (Mac/Linux)
- [ ] Kaggle API installed: `pip install kaggle`
- [ ] Connection tested: `kaggle datasets list`
- [ ] Setup verified: `python setup_kaggle_api.py`

---

## 🎯 Next Steps

After setup is complete:

1. **Download datasets**:
   ```bash
   python download_datasets.py
   ```

2. **Verify downloads**:
   ```bash
   python download_datasets.py
   # Choose option 4: Check dataset structure
   ```

3. **Start training**:
   ```bash
   python train_emotion_model.py
   ```

---

## 📚 Additional Resources

- **Kaggle API Documentation**: https://github.com/Kaggle/kaggle-api
- **Kaggle Account Settings**: https://www.kaggle.com/account
- **Kaggle Datasets**: https://www.kaggle.com/datasets

---

**Once setup is complete, you can download FER2013 and CK+ datasets automatically!** 🚀

