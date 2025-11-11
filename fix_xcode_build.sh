#!/bin/bash

echo "🔧 Fixing Xcode build issues..."

# Navigate to project root
cd /Volumes/Atik-Mac-Mini-External/Projects/YellPay

echo "📦 Step 1: Cleaning Xcode DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData/YellPay-*

echo "🗑️  Step 2: Removing Pods and reinstalling..."
cd ios
rm -rf Pods Podfile.lock
echo "✅ Pods removed"

echo "📥 Step 3: Installing pods..."
pod install

echo "🧹 Step 4: Cleaning build folder..."
cd ..
npx expo run:ios --clean

echo "✅ Done! Try building again."
