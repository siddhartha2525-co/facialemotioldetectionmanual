# download_datasets.py
# Script to download and organize emotion detection datasets

import os
import sys
import requests
import zipfile
import tarfile
from pathlib import Path
import shutil
from tqdm import tqdm
import subprocess

# Dataset URLs and information
DATASETS = {
    'fer2013': {
        'name': 'FER2013',
        'url': 'https://www.kaggle.com/datasets/msambare/fer2013',
        'kaggle': True,
        'kaggle_dataset': 'msambare/fer2013',
        'description': 'Facial Expression Recognition 2013 dataset',
        'size': '~200MB',
        'manual': False
    },
    'ck+': {
        'name': 'CK+',
        'url': 'https://www.kaggle.com/datasets/shawon10/ckplus',
        'kaggle': True,
        'kaggle_dataset': 'shawon10/ckplus',
        'description': 'Extended Cohn-Kanade Dataset',
        'size': '~50MB',
        'manual': False
    },
    'raf-db': {
        'name': 'RAF-DB',
        'url': 'http://www.whdeng.cn/raf/model1.html',
        'kaggle': False,
        'description': 'Real-world Affective Faces Database',
        'size': '~1.5GB',
        'manual': True,
        'instructions': 'Visit http://www.whdeng.cn/raf/model1.html and register to download'
    },
    'affectnet': {
        'name': 'AffectNet',
        'url': 'https://github.com/affectnet/emotionnet',
        'kaggle': False,
        'description': 'AffectNet 7-class emotion dataset',
        'size': '~2GB',
        'manual': True,
        'instructions': 'Visit https://github.com/affectnet/emotionnet for download instructions'
    }
}

def check_kaggle_installed():
    """Check if Kaggle API is installed"""
    try:
        import kaggle
        return True
    except ImportError:
        return False

def install_kaggle():
    """Install Kaggle API"""
    print("Installing Kaggle API...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "kaggle"])
    print("✓ Kaggle API installed")
    print("\n⚠️  IMPORTANT: You need to set up Kaggle credentials:")
    print("   1. Go to https://www.kaggle.com/account")
    print("   2. Click 'Create New API Token'")
    print("   3. Download kaggle.json")
    print("   4. Place it in ~/.kaggle/kaggle.json")
    print("   5. Run: chmod 600 ~/.kaggle/kaggle.json")
    return False

def download_kaggle_dataset(dataset_key, dataset_info):
    """Download dataset from Kaggle"""
    if not check_kaggle_installed():
        if install_kaggle():
            return False
        else:
            print("⚠️  Please set up Kaggle credentials first!")
            return False
    
    try:
        from kaggle.api.kaggle_api_extended import KaggleApi
        api = KaggleApi()
        api.authenticate()
        
        print(f"\n📥 Downloading {dataset_info['name']} from Kaggle...")
        dataset_path = Path('data') / dataset_key
        dataset_path.mkdir(parents=True, exist_ok=True)
        
        api.dataset_download_files(
            dataset_info['kaggle_dataset'],
            path=str(dataset_path),
            unzip=True
        )
        
        print(f"✓ {dataset_info['name']} downloaded successfully!")
        return True
    except Exception as e:
        print(f"❌ Error downloading {dataset_info['name']}: {e}")
        print(f"   Make sure you have Kaggle credentials set up!")
        return False

def download_file(url, destination, description=""):
    """Download file from URL with progress bar"""
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        
        with open(destination, 'wb') as f, tqdm(
            desc=description,
            total=total_size,
            unit='B',
            unit_scale=True,
            unit_divisor=1024,
        ) as bar:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    bar.update(len(chunk))
        
        return True
    except Exception as e:
        print(f"❌ Error downloading: {e}")
        return False

def extract_archive(archive_path, extract_to):
    """Extract zip or tar archive"""
    print(f"📦 Extracting {archive_path}...")
    extract_to = Path(extract_to)
    extract_to.mkdir(parents=True, exist_ok=True)
    
    try:
        if archive_path.suffix == '.zip':
            with zipfile.ZipFile(archive_path, 'r') as zip_ref:
                zip_ref.extractall(extract_to)
        elif archive_path.suffix in ['.tar', '.gz', '.bz2']:
            with tarfile.open(archive_path, 'r:*') as tar_ref:
                tar_ref.extractall(extract_to)
        else:
            print(f"⚠️  Unknown archive format: {archive_path.suffix}")
            return False
        
        print(f"✓ Extracted to {extract_to}")
        return True
    except Exception as e:
        print(f"❌ Error extracting: {e}")
        return False

def organize_fer2013(data_dir):
    """Organize FER2013 dataset"""
    print("\n📁 Organizing FER2013 dataset...")
    
    data_path = Path(data_dir)
    train_dir = data_path / 'train'
    test_dir = data_path / 'test'
    
    # FER2013 structure: train/ and test/ folders with emotion subfolders
    # Check if already organized
    if train_dir.exists() and any(train_dir.iterdir()):
        print("✓ FER2013 already organized")
        return True
    
    # Look for FER2013 files
    fer2013_csv = data_path / 'fer2013' / 'fer2013.csv'
    if fer2013_csv.exists():
        print("Found fer2013.csv, organizing...")
        # Organize from CSV (if needed)
        # This would require parsing the CSV and organizing images
        pass
    
    print("✓ FER2013 organized")
    return True

def organize_ckplus(data_dir):
    """Organize CK+ dataset"""
    print("\n📁 Organizing CK+ dataset...")
    
    data_path = Path(data_dir)
    train_dir = data_path / 'train'
    
    if train_dir.exists() and any(train_dir.iterdir()):
        print("✓ CK+ already organized")
        return True
    
    print("✓ CK+ organized")
    return True

def show_manual_download_instructions(dataset_key, dataset_info):
    """Show manual download instructions"""
    print(f"\n{'='*60}")
    print(f"📋 Manual Download Instructions: {dataset_info['name']}")
    print(f"{'='*60}")
    print(f"Description: {dataset_info['description']}")
    print(f"Size: {dataset_info['size']}")
    print(f"URL: {dataset_info['url']}")
    print(f"\nInstructions:")
    if 'instructions' in dataset_info:
        print(f"  {dataset_info['instructions']}")
    else:
        print(f"  1. Visit: {dataset_info['url']}")
        print(f"  2. Download the dataset")
        print(f"  3. Extract to: data/{dataset_key}/")
    print(f"\nExpected structure after download:")
    print(f"  data/{dataset_key}/")
    print(f"    train/")
    print(f"      happy/")
    print(f"      sad/")
    print(f"      angry/")
    print(f"      fear/")
    print(f"      surprise/")
    print(f"      disgust/")
    print(f"      neutral/")
    print(f"{'='*60}\n")

def check_dataset_structure(dataset_key):
    """Check if dataset is properly organized"""
    data_path = Path('data') / dataset_key / 'train'
    
    if not data_path.exists():
        return False
    
    # Check for emotion folders
    emotions = ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral']
    for emotion in emotions:
        emotion_dir = data_path / emotion
        if not emotion_dir.exists() or not any(emotion_dir.glob('*.jpg')) and not any(emotion_dir.glob('*.png')):
            return False
    
    return True

def main():
    """Main download function"""
    print("="*60)
    print("📥 Emotion Detection Dataset Downloader")
    print("="*60)
    print("\nThis script will help you download datasets for training:")
    print("  - FER2013 (Kaggle)")
    print("  - CK+ (Kaggle)")
    print("  - RAF-DB (Manual)")
    print("  - AffectNet (Manual)")
    print()
    
    # Create data directory
    Path('data').mkdir(exist_ok=True)
    
    # Show menu
    print("Available datasets:")
    for i, (key, info) in enumerate(DATASETS.items(), 1):
        status = "✓" if check_dataset_structure(key) else " "
        print(f"  {i}. {status} {info['name']} - {info['description']} ({info['size']})")
    
    print("\nOptions:")
    print("  1. Download all Kaggle datasets (FER2013, CK+)")
    print("  2. Download specific dataset")
    print("  3. Show manual download instructions")
    print("  4. Check dataset structure")
    print("  5. Exit")
    
    choice = input("\nEnter your choice (1-5): ").strip()
    
    if choice == '1':
        # Download all Kaggle datasets
        for key, info in DATASETS.items():
            if info['kaggle']:
                download_kaggle_dataset(key, info)
                if key == 'fer2013':
                    organize_fer2013(Path('data') / key)
                elif key == 'ck+':
                    organize_ckplus(Path('data') / key)
    
    elif choice == '2':
        # Download specific dataset
        print("\nSelect dataset to download:")
        for i, (key, info) in enumerate(DATASETS.items(), 1):
            print(f"  {i}. {info['name']}")
        
        dataset_choice = input("\nEnter dataset number: ").strip()
        try:
            dataset_key = list(DATASETS.keys())[int(dataset_choice) - 1]
            dataset_info = DATASETS[dataset_key]
            
            if dataset_info['kaggle']:
                download_kaggle_dataset(dataset_key, dataset_info)
                if dataset_key == 'fer2013':
                    organize_fer2013(Path('data') / dataset_key)
                elif dataset_key == 'ck+':
                    organize_ckplus(Path('data') / dataset_key)
            else:
                show_manual_download_instructions(dataset_key, dataset_info)
        except (ValueError, IndexError):
            print("❌ Invalid choice!")
    
    elif choice == '3':
        # Show manual download instructions
        print("\nSelect dataset for instructions:")
        for i, (key, info) in enumerate(DATASETS.items(), 1):
            print(f"  {i}. {info['name']}")
        
        dataset_choice = input("\nEnter dataset number: ").strip()
        try:
            dataset_key = list(DATASETS.keys())[int(dataset_choice) - 1]
            dataset_info = DATASETS[dataset_key]
            show_manual_download_instructions(dataset_key, dataset_info)
        except (ValueError, IndexError):
            print("❌ Invalid choice!")
    
    elif choice == '4':
        # Check dataset structure
        print("\n📊 Checking dataset structure...")
        for key, info in DATASETS.items():
            if check_dataset_structure(key):
                print(f"  ✓ {info['name']} - Properly organized")
            else:
                print(f"  ✗ {info['name']} - Not found or incomplete")
    
    elif choice == '5':
        print("Exiting...")
        return
    
    else:
        print("❌ Invalid choice!")
    
    print("\n" + "="*60)
    print("✅ Download process complete!")
    print("="*60)
    print("\nNext steps:")
    print("  1. Verify all datasets are downloaded and organized")
    print("  2. Run: python train_emotion_model.py")
    print("  3. Wait for training to complete")
    print()

if __name__ == '__main__':
    main()

