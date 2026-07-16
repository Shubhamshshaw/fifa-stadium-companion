#!/bin/bash

# FIFA Stadium Companion - Deployment Script
# This script deploys the application to Firebase Hosting

set -e

echo "📦 FIFA Stadium Companion - Deployment"
echo "======================================"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "📥 Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Verify builds exist
if [ ! -d "client/dist" ]; then
    echo "❌ Frontend build not found. Run 'npm run build' in client/ first."
    exit 1
fi

if [ ! -d "server/FifaStadiumCompanion.Api/bin/Release" ]; then
    echo "❌ Backend build not found. Run 'dotnet publish' in server/ first."
    exit 1
fi

echo "✅ Builds verified"
echo ""

# Initialize Firebase if not already done
if [ ! -f ".firebaserc" ]; then
    echo "🔧 Initializing Firebase project..."
    firebase init hosting --project fifa-stadium-companion
else
    echo "✅ Firebase project already configured"
fi

echo ""
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo ""
echo "✅ Deployment complete!"
echo "📱 Your application is live at: https://fifa-stadium-companion.web.app"
