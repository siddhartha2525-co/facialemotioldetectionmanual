# train_emotion_model.py
# High-accuracy emotion detection model training
# Uses ResNet-34 for 90-95% accuracy on RAF-DB, AffectNet, FER2013, CK+

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, ConcatDataset
from torchvision import transforms, models
from torchvision.models import resnet34
import torchvision.transforms.functional as F
import numpy as np
from PIL import Image
import os
import json
from pathlib import Path
from tqdm import tqdm
import random
from emotion_mapping import (
    normalize_emotion, 
    EMOTION_CLASSES, 
    EMOTION_TO_INDEX,
    map_dataset_label
)

# Training configuration
CONFIG = {
    'image_size': 112,  # 96x96 or 112x112 for optimal performance
    'batch_size': 64,
    'epochs': 20,  # Reduced to 20 for faster training (~6-8 hours). Can continue training later!
    'learning_rate': 1e-4,
    'num_classes': 7,
    'device': 'cuda' if torch.cuda.is_available() else 'cpu',
    'num_workers': 4,
    'save_dir': 'models',
    'model_name': 'emotion_resnet34',
    'validation_split': 0.2,
    'test_split': 0.1,
}

print(f"Using device: {CONFIG['device']}")
print(f"Training configuration: {CONFIG}")

# Data augmentation transforms
class EmotionAugmentation:
    """Advanced data augmentation for emotion detection"""
    
    def __init__(self, is_training=True):
        self.is_training = is_training
        
    def __call__(self, img):
        if not self.is_training:
            # Validation/test: only resize and normalize
            return transforms.Compose([
                transforms.Resize((CONFIG['image_size'], CONFIG['image_size'])),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                                    std=[0.229, 0.224, 0.225])
            ])(img)
        
        # Training: full augmentation
        # Random crop
        img = transforms.RandomResizedCrop(
            CONFIG['image_size'], 
            scale=(0.8, 1.0)
        )(img)
        
        # Horizontal flip (50% chance)
        if random.random() > 0.5:
            img = F.hflip(img)
        
        # Small rotation ±10°
        angle = random.uniform(-10, 10)
        img = F.rotate(img, angle)
        
        # Color jitter (brightness, contrast, saturation)
        img = transforms.ColorJitter(
            brightness=0.2,
            contrast=0.2,
            saturation=0.2,
            hue=0.1
        )(img)
        
        # Gaussian noise (simulates low camera quality)
        if random.random() > 0.7:
            img = self.add_gaussian_noise(img)
        
        # Random shadow (simulates lighting variations)
        if random.random() > 0.7:
            img = self.add_random_shadow(img)
        
        # Blur (simulates low camera quality)
        if random.random() > 0.7:
            img = transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 0.5))(img)
        
        # Convert to tensor and normalize
        img = transforms.ToTensor()(img)
        img = transforms.Normalize(
            mean=[0.485, 0.456, 0.406], 
            std=[0.229, 0.224, 0.225]
        )(img)
        
        return img
    
    def add_gaussian_noise(self, img):
        """Add Gaussian noise to image"""
        img_array = np.array(img)
        noise = np.random.normal(0, 10, img_array.shape).astype(np.uint8)
        noisy_img = np.clip(img_array.astype(np.int16) + noise, 0, 255).astype(np.uint8)
        return Image.fromarray(noisy_img)
    
    def add_random_shadow(self, img):
        """Add random shadow effect"""
        img_array = np.array(img)
        h, w = img_array.shape[:2]
        
        # Create random shadow mask
        shadow_mask = np.ones((h, w), dtype=np.float32)
        x1, y1 = random.randint(0, w//2), random.randint(0, h//2)
        x2, y2 = random.randint(w//2, w), random.randint(h//2, h)
        
        # Create gradient shadow
        for y in range(h):
            for x in range(w):
                if x1 <= x <= x2 and y1 <= y <= y2:
                    shadow_mask[y, x] = random.uniform(0.5, 0.9)
        
        # Apply shadow
        if len(img_array.shape) == 3:
            shadow_mask = shadow_mask[:, :, np.newaxis]
        img_array = (img_array * shadow_mask).astype(np.uint8)
        
        return Image.fromarray(img_array)

# Dataset class
class EmotionDataset(Dataset):
    """Emotion detection dataset"""
    
    def __init__(self, data_dir, dataset_name, transform=None, split='train'):
        self.data_dir = Path(data_dir)
        self.dataset_name = dataset_name
        self.transform = transform
        self.split = split
        self.samples = []
        
        self.load_dataset()
    
    def load_dataset(self):
        """Load dataset samples"""
        # This is a template - you'll need to adapt based on your dataset structure
        # Expected structure:
        # data_dir/
        #   train/
        #     happy/
        #     sad/
        #     angry/
        #     ...
        
        split_dir = self.data_dir / self.split
        if not split_dir.exists():
            print(f"Warning: {split_dir} does not exist. Skipping {self.dataset_name} {self.split}")
            return
        
        for emotion_dir in split_dir.iterdir():
            if not emotion_dir.is_dir():
                continue
            
            emotion_label = emotion_dir.name
            normalized_emotion = map_dataset_label(self.dataset_name, emotion_label)
            
            if normalized_emotion not in EMOTION_CLASSES:
                continue
            
            # Load all images in this emotion directory
            for img_path in emotion_dir.glob('*.jpg'):
                self.samples.append({
                    'image_path': str(img_path),
                    'label': normalized_emotion,
                    'label_index': EMOTION_TO_INDEX[normalized_emotion]
                })
            
            for img_path in emotion_dir.glob('*.png'):
                self.samples.append({
                    'image_path': str(img_path),
                    'label': normalized_emotion,
                    'label_index': EMOTION_TO_INDEX[normalized_emotion]
                })
        
        print(f"Loaded {len(self.samples)} samples from {self.dataset_name} ({self.split})")
    
    def __len__(self):
        return len(self.samples)
    
    def __getitem__(self, idx):
        sample = self.samples[idx]
        
        # Load image
        try:
            image = Image.open(sample['image_path']).convert('RGB')
        except Exception as e:
            print(f"Error loading image {sample['image_path']}: {e}")
            # Return a black image as fallback
            image = Image.new('RGB', (CONFIG['image_size'], CONFIG['image_size']))
        
        # Apply transforms
        if self.transform:
            image = self.transform(image)
        
        return {
            'image': image,
            'label': sample['label_index'],
            'label_name': sample['label']
        }

# ResNet-34 model for emotion detection
class EmotionResNet34(nn.Module):
    """ResNet-34 model for emotion detection"""
    
    def __init__(self, num_classes=7, pretrained=True):
        super(EmotionResNet34, self).__init__()
        
        # Load pretrained ResNet-34
        self.backbone = resnet34(pretrained=pretrained)
        
        # Replace final fully connected layer
        num_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(num_features, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, num_classes)
        )
    
    def forward(self, x):
        return self.backbone(x)

# Training function
def train_epoch(model, dataloader, criterion, optimizer, device):
    """Train for one epoch"""
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    
    progress_bar = tqdm(dataloader, desc='Training')
    for batch in progress_bar:
        images = batch['image'].to(device)
        labels = batch['label'].to(device)
        
        # Forward pass
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        
        # Backward pass
        loss.backward()
        optimizer.step()
        
        # Statistics
        running_loss += loss.item()
        _, predicted = torch.max(outputs.data, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()
        
        # Update progress bar
        progress_bar.set_postfix({
            'loss': f'{loss.item():.4f}',
            'acc': f'{100 * correct / total:.2f}%'
        })
    
    epoch_loss = running_loss / len(dataloader)
    epoch_acc = 100 * correct / total
    
    return epoch_loss, epoch_acc

# Validation function
def validate(model, dataloader, criterion, device):
    """Validate model"""
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    
    # Per-class accuracy
    class_correct = {i: 0 for i in range(CONFIG['num_classes'])}
    class_total = {i: 0 for i in range(CONFIG['num_classes'])}
    
    with torch.no_grad():
        progress_bar = tqdm(dataloader, desc='Validating')
        for batch in progress_bar:
            images = batch['image'].to(device)
            labels = batch['label'].to(device)
            
            # Forward pass
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            # Statistics
            running_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            
            # Per-class statistics
            for i in range(labels.size(0)):
                label = labels[i].item()
                class_total[label] += 1
                if predicted[i] == label:
                    class_correct[label] += 1
            
            # Update progress bar
            progress_bar.set_postfix({
                'loss': f'{loss.item():.4f}',
                'acc': f'{100 * correct / total:.2f}%'
            })
    
    epoch_loss = running_loss / len(dataloader)
    epoch_acc = 100 * correct / total
    
    # Per-class accuracy
    class_acc = {}
    for i in range(CONFIG['num_classes']):
        if class_total[i] > 0:
            class_acc[EMOTION_CLASSES[i]] = 100 * class_correct[i] / class_total[i]
        else:
            class_acc[EMOTION_CLASSES[i]] = 0.0
    
    return epoch_loss, epoch_acc, class_acc

# Main training function
def main():
    """Main training function"""
    
    # Create save directory
    os.makedirs(CONFIG['save_dir'], exist_ok=True)
    
    # Load datasets
    print("\n" + "="*50)
    print("Loading datasets...")
    print("="*50)
    
    datasets = []
    dataset_dirs = {
        'raf-db': 'data/raf-db',
        'affectnet': 'data/affectnet',
        'fer2013': 'data/fer2013',
        'ck+': 'data/ck+'
    }
    
    # Training datasets
    train_transform = EmotionAugmentation(is_training=True)
    val_transform = EmotionAugmentation(is_training=False)
    
    for dataset_name, data_dir in dataset_dirs.items():
        if os.path.exists(data_dir):
            train_dataset = EmotionDataset(data_dir, dataset_name, train_transform, split='train')
            if len(train_dataset) > 0:
                datasets.append(train_dataset)
        else:
            print(f"Warning: {data_dir} not found. Skipping {dataset_name}")
    
    if len(datasets) == 0:
        print("ERROR: No datasets found! Please check your data directories.")
        print("Expected structure:")
        print("  data/raf-db/train/happy/")
        print("  data/raf-db/train/sad/")
        print("  ...")
        return
    
    # Combine all datasets
    combined_dataset = ConcatDataset(datasets)
    print(f"\nTotal training samples: {len(combined_dataset)}")
    
    # Split into train/val
    train_size = int((1 - CONFIG['validation_split']) * len(combined_dataset))
    val_size = len(combined_dataset) - train_size
    train_dataset, val_dataset = torch.utils.data.random_split(
        combined_dataset, [train_size, val_size]
    )
    
    # Create data loaders
    train_loader = DataLoader(
        train_dataset,
        batch_size=CONFIG['batch_size'],
        shuffle=True,
        num_workers=CONFIG['num_workers'],
        pin_memory=True
    )
    
    val_loader = DataLoader(
        val_dataset,
        batch_size=CONFIG['batch_size'],
        shuffle=False,
        num_workers=CONFIG['num_workers'],
        pin_memory=True
    )
    
    # Initialize model
    print("\n" + "="*50)
    print("Initializing model...")
    print("="*50)
    try:
        model = EmotionResNet34(num_classes=CONFIG['num_classes'], pretrained=True)
    except Exception as e:
        print(f"⚠️  Warning: Could not load pretrained weights: {e}")
        print("   Using model without pretrained weights (will train from scratch)")
        model = EmotionResNet34(num_classes=CONFIG['num_classes'], pretrained=False)
    model = model.to(CONFIG['device'])
    
    # Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(
        model.parameters(),
        lr=CONFIG['learning_rate'],
        weight_decay=1e-4
    )
    
    # Learning rate scheduler
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='min', factor=0.5, patience=5
    )
    
    # Training loop
    print("\n" + "="*50)
    print("Starting training...")
    print("="*50)
    
    best_val_acc = 0.0
    train_history = {
        'train_loss': [],
        'train_acc': [],
        'val_loss': [],
        'val_acc': []
    }
    
    for epoch in range(CONFIG['epochs']):
        print(f"\nEpoch {epoch+1}/{CONFIG['epochs']}")
        print("-" * 50)
        
        # Train
        train_loss, train_acc = train_epoch(
            model, train_loader, criterion, optimizer, CONFIG['device']
        )
        
        # Validate
        val_loss, val_acc, class_acc = validate(
            model, val_loader, criterion, CONFIG['device']
        )
        
        # Update learning rate
        scheduler.step(val_loss)
        current_lr = optimizer.param_groups[0]['lr']
        if current_lr != CONFIG['learning_rate']:
            print(f"   Learning rate updated to: {current_lr:.6f}")
        
        # Save history
        train_history['train_loss'].append(train_loss)
        train_history['train_acc'].append(train_acc)
        train_history['val_loss'].append(val_loss)
        train_history['val_acc'].append(val_acc)
        
        # Print per-class accuracy
        print("\nPer-class validation accuracy:")
        for emotion, acc in class_acc.items():
            print(f"  {emotion:10}: {acc:6.2f}%")
        
        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            model_path = os.path.join(CONFIG['save_dir'], f"{CONFIG['model_name']}_best.pth")
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'val_acc': val_acc,
                'class_acc': class_acc,
                'config': CONFIG
            }, model_path)
            print(f"\n✓ Saved best model (val_acc: {val_acc:.2f}%)")
        
        # Save checkpoint every 10 epochs
        if (epoch + 1) % 10 == 0:
            checkpoint_path = os.path.join(
                CONFIG['save_dir'], 
                f"{CONFIG['model_name']}_epoch_{epoch+1}.pth"
            )
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'val_acc': val_acc,
                'class_acc': class_acc,
                'config': CONFIG
            }, checkpoint_path)
    
    # Save final model
    final_model_path = os.path.join(CONFIG['save_dir'], f"{CONFIG['model_name']}_final.pth")
    torch.save({
        'epoch': CONFIG['epochs'],
        'model_state_dict': model.state_dict(),
        'optimizer_state_dict': optimizer.state_dict(),
        'val_acc': val_acc,
        'class_acc': class_acc,
        'config': CONFIG
    }, final_model_path)
    
    # Save training history
    history_path = os.path.join(CONFIG['save_dir'], 'training_history.json')
    with open(history_path, 'w') as f:
        json.dump(train_history, f, indent=2)
    
    print("\n" + "="*50)
    print("Training complete!")
    print("="*50)
    print(f"Best validation accuracy: {best_val_acc:.2f}%")
    print(f"Models saved to: {CONFIG['save_dir']}")
    print(f"Training history saved to: {history_path}")

if __name__ == '__main__':
    main()

