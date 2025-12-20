# export_model.py
# Export trained emotion detection model to various formats

import torch
import torch.onnx
import onnx
import tensorflow as tf
from train_emotion_model import EmotionResNet34, CONFIG
from emotion_mapping import EMOTION_CLASSES
import os

def export_to_pytorch(model_path, output_path):
    """Export to PyTorch .pth format"""
    print(f"Exporting to PyTorch: {output_path}")
    
    # Load model
    checkpoint = torch.load(model_path, map_location='cpu')
    model = EmotionResNet34(num_classes=CONFIG['num_classes'], pretrained=False)
    model.load_state_dict(checkpoint['model_state_dict'])
    model.eval()
    
    # Save model
    torch.save(model.state_dict(), output_path)
    print(f"✓ PyTorch model saved to {output_path}")
    return output_path

def export_to_onnx(model_path, output_path, image_size=112):
    """Export to ONNX format"""
    print(f"Exporting to ONNX: {output_path}")
    
    # Load model
    checkpoint = torch.load(model_path, map_location='cpu')
    model = EmotionResNet34(num_classes=CONFIG['num_classes'], pretrained=False)
    model.load_state_dict(checkpoint['model_state_dict'])
    model.eval()
    
    # Create dummy input
    dummy_input = torch.randn(1, 3, image_size, image_size)
    
    # Export to ONNX
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=11,
        do_constant_folding=True,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={
            'input': {0: 'batch_size'},
            'output': {0: 'batch_size'}
        }
    )
    
    # Verify ONNX model
    onnx_model = onnx.load(output_path)
    onnx.checker.check_model(onnx_model)
    
    print(f"✓ ONNX model saved to {output_path}")
    return output_path

def export_to_tensorflow(model_path, output_path, image_size=112):
    """Export to TensorFlow .h5 format"""
    print(f"Exporting to TensorFlow: {output_path}")
    
    try:
        import tf2onnx
        from onnx_tf.backend import prepare
        
        # First export to ONNX
        onnx_path = output_path.replace('.h5', '.onnx')
        export_to_onnx(model_path, onnx_path, image_size)
        
        # Convert ONNX to TensorFlow
        onnx_model = onnx.load(onnx_path)
        tf_rep = prepare(onnx_model)
        tf_rep.export_graph(output_path)
        
        print(f"✓ TensorFlow model saved to {output_path}")
        return output_path
    except Exception as e:
        print(f"⚠ TensorFlow export failed: {e}")
        print("  Note: TensorFlow export requires additional dependencies")
        return None

def main():
    """Main export function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Export emotion detection model')
    parser.add_argument('--model', type=str, required=True, help='Path to trained model (.pth)')
    parser.add_argument('--output_dir', type=str, default='models/exported', help='Output directory')
    parser.add_argument('--formats', nargs='+', choices=['pytorch', 'onnx', 'tensorflow', 'all'],
                       default=['all'], help='Export formats')
    
    args = parser.parse_args()
    
    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Get model name
    model_name = os.path.splitext(os.path.basename(args.model))[0]
    
    # Export to requested formats
    if 'all' in args.formats or 'pytorch' in args.formats:
        pytorch_path = os.path.join(args.output_dir, f'{model_name}.pth')
        export_to_pytorch(args.model, pytorch_path)
    
    if 'all' in args.formats or 'onnx' in args.formats:
        onnx_path = os.path.join(args.output_dir, f'{model_name}.onnx')
        export_to_onnx(args.model, onnx_path)
    
    if 'all' in args.formats or 'tensorflow' in args.formats:
        tf_path = os.path.join(args.output_dir, f'{model_name}.h5')
        export_to_tensorflow(args.model, tf_path)
    
    print("\n" + "="*50)
    print("Export complete!")
    print("="*50)
    print(f"Exported models saved to: {args.output_dir}")

if __name__ == '__main__':
    main()

