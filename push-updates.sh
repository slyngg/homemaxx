#!/bin/bash

# HomeMAXX Git Push Script
# Commits and pushes all recent updates including legal compliance and testimonial system

echo "🚀 HomeMAXX - Pushing Latest Updates to GitHub"
echo "=============================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Add all new and modified files
echo "📁 Adding files to staging..."
git add .

# Check git status
echo "📊 Current git status:"
git status --short

# Create comprehensive commit message
COMMIT_MSG="🎉 Major Update: Legal Compliance & Testimonial System

✅ Legal Compliance Suite:
- Terms of Service with instant cash program terms
- Investment Disclaimers with comprehensive risk warnings  
- Enhanced Privacy Policy with CCPA compliance
- Functional opt-out and privacy request pages

✅ Funnel Enhancements:
- Revamped final slide with Google login integration
- Fixed resume offer button navigation and design
- Improved cash offer progress indicators

✅ Testimonial Capture System:
- Video recording with MediaRecorder API
- \$7,500 bonus incentive structure
- Comprehensive form with situation tracking
- Auto-save functionality and analytics tracking
- Sample success stories for social proof

✅ Technical Improvements:
- Enhanced qualification logic for cash offers
- Improved Netlify function for slots management
- Mobile-responsive design across all new pages
- Professional styling with animations and gradients

🎯 Business Impact:
- Complete legal protection and compliance
- Powerful testimonial generation system
- Enhanced user experience and conversion optimization
- Revolutionary \$7,500 instant cash offer program fully implemented

All high-priority tasks completed. Ready for production deployment."

# Commit changes
echo "💾 Committing changes..."
git commit -m "$COMMIT_MSG"

if [ $? -eq 0 ]; then
    echo "✅ Commit successful!"
    
    # Push to remote repository
    echo "🌐 Pushing to remote repository..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo "🎉 Successfully pushed to GitHub!"
        echo ""
        echo "📋 Summary of Changes:"
        echo "- Legal compliance pages created"
        echo "- Testimonial capture system implemented"
        echo "- Funnel improvements deployed"
        echo "- All TODO items completed"
        echo ""
        echo "🔗 Repository updated with latest changes"
    else
        echo "❌ Failed to push to remote repository"
        echo "Please check your internet connection and repository permissions"
        exit 1
    fi
else
    echo "❌ Commit failed"
    echo "Please check for any issues with the files"
    exit 1
fi

echo ""
echo "✨ HomeMAXX platform is now fully updated!"
echo "🚀 Ready for production deployment"
