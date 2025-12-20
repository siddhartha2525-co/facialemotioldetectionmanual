# setup_kaggle_api.py
# Script to help set up Kaggle API for dataset downloads

import os
import sys
import subprocess
from pathlib import Path
import json

def check_kaggle_installed():
    """Check if Kaggle package is installed"""
    try:
        import kaggle
        return True
    except ImportError:
        return False

def install_kaggle():
    """Install Kaggle API package"""
    print("📦 Installing Kaggle API...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "kaggle", "--quiet"])
        print("✅ Kaggle API installed successfully!")
        return True
    except Exception as e:
        print(f"❌ Error installing Kaggle API: {e}")
        return False

def check_kaggle_credentials():
    """Check if Kaggle credentials are set up"""
    kaggle_dir = Path.home() / '.kaggle'
    kaggle_json = kaggle_dir / 'kaggle.json'
    
    if kaggle_json.exists():
        # Check file permissions
        stat = os.stat(kaggle_json)
        if stat.st_mode & 0o077 != 0:
            print("⚠️  Warning: kaggle.json has incorrect permissions!")
            print("   Run: chmod 600 ~/.kaggle/kaggle.json")
            return False
        return True
    return False

def test_kaggle_connection():
    """Test Kaggle API connection"""
    try:
        from kaggle.api.kaggle_api_extended import KaggleApi
        api = KaggleApi()
        api.authenticate()
        
        # Try to list datasets (simple test)
        print("🔍 Testing Kaggle API connection...")
        datasets = api.dataset_list(max_results=1)
        print("✅ Kaggle API connection successful!")
        return True
    except Exception as e:
        print(f"❌ Kaggle API connection failed: {e}")
        return False

def setup_kaggle_credentials():
    """Guide user through setting up Kaggle credentials"""
    print("\n" + "="*60)
    print("📋 Kaggle API Setup Instructions")
    print("="*60)
    print("\nTo download datasets from Kaggle, you need to set up API credentials:")
    print("\nStep 1: Get your Kaggle API token")
    print("  1. Go to: https://www.kaggle.com/account")
    print("  2. Scroll down to 'API' section")
    print("  3. Click 'Create New API Token'")
    print("  4. This will download 'kaggle.json' file")
    print("\nStep 2: Place the credentials file")
    print("  The file should be placed at: ~/.kaggle/kaggle.json")
    print("\nStep 3: Set correct permissions")
    print("  Run: chmod 600 ~/.kaggle/kaggle.json")
    print("\n" + "="*60)
    
    # Check if user wants to provide credentials now
    response = input("\nDo you have kaggle.json ready? (y/n): ").strip().lower()
    
    if response == 'y':
        # Ask for file path
        file_path = input("Enter path to kaggle.json file: ").strip()
        
        if os.path.exists(file_path):
            # Create .kaggle directory
            kaggle_dir = Path.home() / '.kaggle'
            kaggle_dir.mkdir(exist_ok=True)
            
            # Copy file
            import shutil
            dest_path = kaggle_dir / 'kaggle.json'
            shutil.copy(file_path, dest_path)
            
            # Set permissions
            os.chmod(dest_path, 0o600)
            
            print(f"✅ Credentials file copied to {dest_path}")
            print("✅ Permissions set correctly")
            
            # Test connection
            if test_kaggle_connection():
                return True
            else:
                print("\n⚠️  Connection test failed. Please check your credentials.")
                return False
        else:
            print(f"❌ File not found: {file_path}")
            return False
    else:
        print("\n📝 Please follow the instructions above to set up Kaggle API.")
        print("   Once done, run this script again to verify the setup.")
        return False

def main():
    """Main setup function"""
    print("="*60)
    print("🔧 Kaggle API Setup")
    print("="*60)
    print()
    
    # Step 1: Check if Kaggle is installed
    print("Step 1: Checking Kaggle API installation...")
    if not check_kaggle_installed():
        print("❌ Kaggle API not installed")
        if install_kaggle():
            print("✅ Kaggle API installed")
        else:
            print("❌ Failed to install Kaggle API")
            return
    else:
        print("✅ Kaggle API is installed")
    
    print()
    
    # Step 2: Check credentials
    print("Step 2: Checking Kaggle credentials...")
    if not check_kaggle_credentials():
        print("❌ Kaggle credentials not found or incorrect permissions")
        print("\nSetting up credentials...")
        if setup_kaggle_credentials():
            print("✅ Credentials set up successfully")
        else:
            print("❌ Credentials setup incomplete")
            return
    else:
        print("✅ Kaggle credentials found")
    
    print()
    
    # Step 3: Test connection
    print("Step 3: Testing Kaggle API connection...")
    if test_kaggle_connection():
        print("\n" + "="*60)
        print("✅ Kaggle API setup complete!")
        print("="*60)
        print("\nYou can now download datasets:")
        print("  - FER2013: kaggle datasets download -d msambare/fer2013")
        print("  - CK+: kaggle datasets download -d shawon10/ckplus")
        print("\nOr use the download script:")
        print("  python download_datasets.py")
    else:
        print("\n" + "="*60)
        print("❌ Kaggle API setup incomplete")
        print("="*60)
        print("\nPlease check:")
        print("  1. Kaggle API is installed: pip install kaggle")
        print("  2. Credentials file exists: ~/.kaggle/kaggle.json")
        print("  3. File permissions are correct: chmod 600 ~/.kaggle/kaggle.json")
        print("  4. Credentials are valid (check on kaggle.com)")

if __name__ == '__main__':
    main()

