# continue_training.py
# Script to continue training from a checkpoint

import torch
import torch.nn as nn
import torch.optim as optim
from train_emotion_model import (
    EmotionResNet34, 
    EmotionDataset, 
    EmotionAugmentation,
    train_epoch, 
    validate,
    CONFIG,
    EMOTION_CLASSES
)
from torch.utils.data import DataLoader, ConcatDataset
import os
from pathlib import Path

def continue_training_from_checkpoint(checkpoint_path, additional_epochs=20):
    """
    Continue training from a saved checkpoint
    
    Args:
        checkpoint_path: Path to checkpoint file (.pth)
        additional_epochs: Number of additional epochs to train
    """
    print("="*60)
    print("🔄 Continue Training from Checkpoint")
    print("="*60)
    
    # Load checkpoint
    print(f"\n📂 Loading checkpoint: {checkpoint_path}")
    checkpoint = torch.load(checkpoint_path, map_location=CONFIG['device'])
    
    # Get starting epoch
    start_epoch = checkpoint.get('epoch', 0) + 1
    total_epochs = start_epoch + additional_epochs
    
    print(f"   Starting from epoch: {start_epoch}")
    print(f"   Training for {additional_epochs} more epochs")
    print(f"   Total epochs: {total_epochs}")
    
    # Load datasets (same as original training)
    print("\n📊 Loading datasets...")
    datasets = []
    dataset_dirs = {
        'fer2013': 'data/fer2013',
        'ck+': 'data/ck+',
        'archive2': 'data/archive2'
    }
    
    train_transform = EmotionAugmentation(is_training=True)
    val_transform = EmotionAugmentation(is_training=False)
    
    for dataset_name, data_dir in dataset_dirs.items():
        if os.path.exists(data_dir):
            train_dataset = EmotionDataset(data_dir, dataset_name, train_transform, split='train')
            if len(train_dataset) > 0:
                datasets.append(train_dataset)
                print(f"   ✓ Loaded {len(train_dataset)} samples from {dataset_name}")
    
    if len(datasets) == 0:
        print("❌ No datasets found!")
        return
    
    combined_dataset = ConcatDataset(datasets)
    print(f"\n   Total training samples: {len(combined_dataset)}")
    
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
    print("\n🤖 Loading model...")
    model = EmotionResNet34(num_classes=CONFIG['num_classes'], pretrained=False)
    model.load_state_dict(checkpoint['model_state_dict'])
    model = model.to(CONFIG['device'])
    
    # Load optimizer state
    optimizer = optim.AdamW(
        model.parameters(),
        lr=CONFIG['learning_rate'],
        weight_decay=1e-4
    )
    optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
    
    # Learning rate scheduler
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='min', factor=0.5, patience=5
    )
    
    # Loss function
    criterion = nn.CrossEntropyLoss()
    
    # Get best validation accuracy so far
    best_val_acc = checkpoint.get('val_acc', 0.0)
    print(f"   Previous best validation accuracy: {best_val_acc:.2f}%")
    
    # Training loop
    print("\n" + "="*60)
    print("🚀 Continuing Training...")
    print("="*60)
    
    for epoch in range(start_epoch, total_epochs):
        print(f"\nEpoch {epoch+1}/{total_epochs}")
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
        'epoch': total_epochs - 1,
        'model_state_dict': model.state_dict(),
        'optimizer_state_dict': optimizer.state_dict(),
        'val_acc': val_acc,
        'class_acc': class_acc,
        'config': CONFIG
    }, final_model_path)
    
    print("\n" + "="*60)
    print("✅ Training continuation complete!")
    print("="*60)
    print(f"Final validation accuracy: {val_acc:.2f}%")
    print(f"Best validation accuracy: {best_val_acc:.2f}%")
    print(f"Models saved to: {CONFIG['save_dir']}")

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python continue_training.py <checkpoint_path> [additional_epochs]")
        print("\nExample:")
        print("  python continue_training.py models/emotion_resnet34_epoch_20.pth 20")
        print("  (Continue from epoch 20, train 20 more epochs)")
        sys.exit(1)
    
    checkpoint_path = sys.argv[1]
    additional_epochs = int(sys.argv[2]) if len(sys.argv) > 2 else 20
    
    if not os.path.exists(checkpoint_path):
        print(f"❌ Checkpoint not found: {checkpoint_path}")
        sys.exit(1)
    
    continue_training_from_checkpoint(checkpoint_path, additional_epochs)

