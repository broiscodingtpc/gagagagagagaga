#!/usr/bin/env bash

echo "🚀 MNEX v2.5 Autonomous Learning - Railway Deploy"
echo "================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found! Make sure you're in the project root."
    exit 1
fi

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git not found! Please install git."
    exit 1
fi

# Check if railway CLI is available
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found! Please install: npm install -g @railway/cli"
    exit 1
fi

echo "✅ Environment checks passed"

# Add all changes
echo "📝 Adding changes to git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
else
    # Commit changes
    echo "💾 Committing changes..."
    git commit -m "MNEX v2.5 Autonomous Learning + UI Update

- Added AI core learning system with Twitter/web data collection
- Implemented autonomous posting with proof logging
- Added daily Telegram reports and self-reflection cycles
- Created modern frontend with React Router and /whitepaper route
- Enhanced orb with learning pulse animation
- Added Dexscreener placeholder link
- Extended database schema with lessons and evolution tables
- Added new environment variables for learning configuration
- Integrated new scheduler alongside existing autonomous AI
- Updated Railway deployment configuration"
    
    echo "✅ Changes committed"
fi

# Push to origin
echo "📤 Pushing to origin..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to origin"
else
    echo "❌ Failed to push to origin"
    exit 1
fi

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

if [ $? -eq 0 ]; then
    echo "✅ Successfully deployed to Railway"
    echo ""
    echo "🎉 MNEX v2.5 Autonomous Learning is now live!"
    echo ""
    echo "📋 What's new:"
    echo "  • AI learns from Twitter and web data"
    echo "  • Autonomous posting with proof tokens"
    echo "  • Daily Telegram reports"
    echo "  • Self-reflection every 3 days"
    echo "  • Modern UI with /whitepaper route"
    echo "  • Enhanced orb with learning animations"
    echo ""
    echo "🔗 Check your Railway dashboard for deployment status"
else
    echo "❌ Railway deployment failed"
    exit 1
fi
