#!/bin/bash
# Quick script to organize your 3 downloaded datasets

echo "🚀 Organizing Your 3 Datasets"
echo "================================"
echo ""

cd "$(dirname "$0")"

# Dataset paths
ARCHIVE1="/Users/adeshsiddharth123/Downloads/archive"
ARCHIVE2="/Users/adeshsiddharth123/Downloads/archive 2"
ARCHIVE3="/Users/adeshsiddharth123/Downloads/archive (3)"

echo "📁 Found datasets:"
echo "  1. $ARCHIVE1"
echo "  2. $ARCHIVE2"
echo "  3. $ARCHIVE3"
echo ""

# Check if Python script exists
if [ ! -f "organize_manual_downloads.py" ]; then
    echo "❌ organize_manual_downloads.py not found!"
    exit 1
fi

echo "📋 Starting organization..."
echo ""
echo "You'll need to run the organizer for each dataset."
echo "The script will ask you to identify each dataset."
echo ""

# Create data directory
mkdir -p data

echo "✅ Ready to organize!"
echo ""
echo "Run this command for each dataset:"
echo "  python organize_manual_downloads.py"
echo ""
echo "For each dataset:"
echo "  - If it's FER2013: Choose option 1"
echo "  - If it's CK+: Choose option 2"
echo "  - If it's another dataset: Choose option 3 (Generic)"
echo ""
echo "Enter the paths when asked:"
echo "  Dataset 1: $ARCHIVE1"
echo "  Dataset 2: $ARCHIVE2"
echo "  Dataset 3: $ARCHIVE3"
echo ""

