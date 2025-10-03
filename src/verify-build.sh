#!/bin/bash

# Build Verification Script
# This script tests if your app is ready for deployment

echo "🔍 Verifying build readiness..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "❌ node_modules not found. Running npm install..."
  npm install
else
  echo "✅ node_modules found"
fi

# Check if src directory exists
if [ ! -d "src" ]; then
  echo "❌ src directory not found!"
  exit 1
else
  echo "✅ src directory exists"
fi

# Check if public directory exists
if [ ! -d "public" ]; then
  echo "❌ public directory not found!"
  exit 1
else
  echo "✅ public directory exists"
fi

# Check if assets exist
if [ ! -d "public/assets" ]; then
  echo "❌ public/assets directory not found!"
  exit 1
else
  echo "✅ public/assets directory exists"
fi

# Check critical files
FILES=(
  "index.html"
  "package.json"
  "vite.config.ts"
  "src/main.tsx"
  "src/App.tsx"
  "src/index.css"
  "public/_redirects"
  "public/robots.txt"
  "public/sitemap.xml"
  "netlify.toml"
)

for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing: $file"
    exit 1
  else
    echo "✅ Found: $file"
  fi
done

# Try building
echo ""
echo "🔨 Testing build process..."
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ BUILD SUCCESSFUL!"
  echo ""
  echo "🎉 Your app is ready for deployment!"
  echo ""
  echo "Next steps:"
  echo "1. git add ."
  echo "2. git commit -m 'Ready for production'"
  echo "3. git push"
  echo "4. Deploy on Netlify (see QUICK-START.md)"
  echo ""
else
  echo ""
  echo "❌ BUILD FAILED!"
  echo "Please fix the errors above before deploying."
  exit 1
fi
