# organize_manual_downloads.py
# Helper script to organize manually downloaded datasets

import os
import shutil
from pathlib import Path
from emotion_mapping import EMOTION_CLASSES, normalize_emotion
import json

def organize_fer2013(source_dir, target_dir):
    """
    Organize FER2013 dataset from manual download
    
    Expected source structure:
    - fer2013/
      - train/
        - Angry/
        - Disgust/
        - Fear/
        - Happy/
        - Neutral/
        - Sad/
        - Surprise/
    """
    source = Path(source_dir)
    target = Path(target_dir) / 'train'
    target.mkdir(parents=True, exist_ok=True)
    
    # Create emotion folders
    for emotion in EMOTION_CLASSES:
        (target / emotion).mkdir(exist_ok=True)
    
    # Mapping for FER2013 folder names
    fer2013_mapping = {
        'Angry': 'angry',
        'Disgust': 'disgust',
        'Fear': 'fear',
        'Happy': 'happy',
        'Neutral': 'neutral',
        'Sad': 'sad',
        'Surprise': 'surprise'
    }
    
    train_dir = source / 'train'
    if not train_dir.exists():
        print(f"⚠️  Train directory not found: {train_dir}")
        return False
    
    copied = 0
    for folder_name, emotion in fer2013_mapping.items():
        source_folder = train_dir / folder_name
        target_folder = target / emotion
        
        if source_folder.exists():
            # Copy all images
            for img_file in source_folder.glob('*.jpg'):
                shutil.copy2(img_file, target_folder / img_file.name)
                copied += 1
            for img_file in source_folder.glob('*.png'):
                shutil.copy2(img_file, target_folder / img_file.name)
                copied += 1
            
            print(f"✓ Copied {emotion} images from {folder_name}")
        else:
            print(f"⚠️  Folder not found: {source_folder}")
    
    print(f"\n✅ Organized {copied} images from FER2013")
    return True

def organize_ckplus(source_dir, target_dir):
    """
    Organize CK+ dataset from manual download
    """
    source = Path(source_dir)
    target = Path(target_dir) / 'train'
    target.mkdir(parents=True, exist_ok=True)
    
    # Create emotion folders
    for emotion in EMOTION_CLASSES:
        (target / emotion).mkdir(exist_ok=True)
    
    # CK+ structure varies, try common patterns
    copied = 0
    
    # Try to find images in common locations
    for img_file in source.rglob('*.png'):
        # Try to determine emotion from path or filename
        # This is a basic implementation - may need adjustment
        emotion = 'neutral'  # Default
        
        # Check parent folder name
        parent_name = img_file.parent.name.lower()
        emotion = normalize_emotion(parent_name)
        
        target_folder = target / emotion
        shutil.copy2(img_file, target_folder / img_file.name)
        copied += 1
    
    for img_file in source.rglob('*.jpg'):
        parent_name = img_file.parent.name.lower()
        emotion = normalize_emotion(parent_name)
        target_folder = target / emotion
        shutil.copy2(img_file, target_folder / img_file.name)
        copied += 1
    
    print(f"\n✅ Organized {copied} images from CK+")
    return True

def organize_generic(source_dir, target_dir, dataset_name):
    """
    Generic organizer for any dataset structure
    """
    source = Path(source_dir)
    target = Path(target_dir) / 'train'
    target.mkdir(parents=True, exist_ok=True)
    
    # Create emotion folders
    for emotion in EMOTION_CLASSES:
        (target / emotion).mkdir(exist_ok=True)
    
    copied = 0
    
    # Look for emotion-named folders
    for folder in source.rglob('*'):
        if folder.is_dir():
            folder_name = folder.name.lower()
            emotion = normalize_emotion(folder_name)
            
            if emotion in EMOTION_CLASSES:
                target_folder = target / emotion
                
                # Copy images from this folder
                for img_file in folder.glob('*.jpg'):
                    shutil.copy2(img_file, target_folder / img_file.name)
                    copied += 1
                for img_file in folder.glob('*.png'):
                    shutil.copy2(img_file, target_folder / img_file.name)
                    copied += 1
    
    print(f"\n✅ Organized {copied} images from {dataset_name}")
    return True

def main():
    """Main organization function"""
    print("="*60)
    print("📁 Manual Dataset Organizer")
    print("="*60)
    print("\nThis script helps organize manually downloaded datasets.")
    print("\nAvailable options:")
    print("  1. Organize FER2013")
    print("  2. Organize CK+")
    print("  3. Generic organizer (for any dataset)")
    print("  4. Exit")
    
    choice = input("\nEnter your choice (1-4): ").strip()
    
    if choice == '1':
        source = input("Enter path to downloaded FER2013 folder: ").strip()
        target = 'data/fer2013'
        organize_fer2013(source, target)
    
    elif choice == '2':
        source = input("Enter path to downloaded CK+ folder: ").strip()
        target = 'data/ck+'
        organize_ckplus(source, target)
    
    elif choice == '3':
        source = input("Enter path to downloaded dataset folder: ").strip()
        dataset_name = input("Enter dataset name: ").strip()
        target = f'data/{dataset_name.lower().replace(" ", "_")}'
        organize_generic(source, target, dataset_name)
    
    elif choice == '4':
        print("Exiting...")
        return
    
    else:
        print("❌ Invalid choice!")
    
    print("\n" + "="*60)
    print("✅ Organization complete!")
    print("="*60)
    print("\nNext steps:")
    print("  1. Verify dataset structure: python download_datasets.py (option 4)")
    print("  2. Start training: python train_emotion_model.py")

if __name__ == '__main__':
    main()

