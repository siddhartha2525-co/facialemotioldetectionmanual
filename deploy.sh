#!/bin/bash
# Quick Deployment Script for Railway
# Run this after creating GitHub repository

echo "🚀 Railway Deployment Script"
echo "============================"
echo ""

# Check if git remote exists
if git remote -v | grep -q "origin"; then
    echo "✅ Git remote 'origin' already configured"
    git remote -v
else
    echo "⚠️  Git remote not configured yet"
    echo ""
    echo "Please create GitHub repository first:"
    echo "  1. Go to: https://github.com/new"
    echo "  2. Repository name: facial-emotion-project"
    echo "  3. DO NOT initialize with README"
    echo "  4. Click 'Create repository'"
    echo ""
    echo "Then run:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/facial-emotion-project.git"
    echo "  git push -u origin main"
    exit 1
fi

echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Code pushed to GitHub successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "  1. Go to: https://railway.app"
    echo "  2. Sign up with GitHub"
    echo "  3. New Project → Deploy from GitHub repo"
    echo "  4. Select your repository"
    echo "  5. Set environment variables (see DEPLOY_NOW.md)"
    echo "  6. Get your public URL!"
    echo ""
    echo "🎉 Your app will be live in minutes!"
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "  - GitHub repository exists"
    echo "  - Remote URL is correct"
    echo "  - You have push access"
fi

