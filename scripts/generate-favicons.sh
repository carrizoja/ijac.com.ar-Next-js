#!/bin/bash

# Favicon generation script for iJAC logo
# This script helps generate favicon files from your logo

echo "🎨 iJAC Favicon Generator"
echo "========================"

# Check if the logo file exists
if [ ! -f "public/ijac-logo.png" ]; then
    echo "❌ Logo file not found at public/ijac-logo.png"
    exit 1
fi

echo "✅ Logo found at public/ijac-logo.png"

# Create favicon directory if it doesn't exist
mkdir -p public/favicons

echo ""
echo "🔧 To generate favicons from your logo, you can:"
echo ""
echo "1. 🌐 Use online tools (Recommended):"
echo "   • Visit https://favicon.io/favicon-converter/"
echo "   • Upload public/ijac-logo.png"
echo "   • Download the generated favicon package"
echo "   • Extract files to public/ directory"
echo ""
echo "2. 🛠️ Use command line tools:"
echo "   • Install ImageMagick: sudo apt install imagemagick"
echo "   • Run: convert public/ijac-logo.png -resize 32x32 public/favicon-32x32.png"
echo "   • Run: convert public/ijac-logo.png -resize 16x16 public/favicon-16x16.png"
echo "   • Run: convert public/ijac-logo.png -resize 180x180 public/apple-touch-icon.png"
echo ""
echo "3. 📱 Manual creation:"
echo "   • Open public/ijac-logo.png in GIMP or similar"
echo "   • Resize to 32x32, 16x16, 180x180 pixels"
echo "   • Save as PNG and ICO formats"
echo ""

echo "📋 Files needed:"
echo "   ✓ public/ijac-logo.png (Downloaded)"
echo "   ⏳ public/favicon.ico"
echo "   ⏳ public/favicon-16x16.png"
echo "   ⏳ public/favicon-32x32.png"
echo "   ⏳ public/apple-touch-icon.png"
echo "   ⏳ src/app/favicon.ico"
echo ""

# Create a web manifest for the favicon
cat > public/site.webmanifest << 'EOF'
{
    "name": "iJAC IT Solutions",
    "short_name": "iJAC",
    "icons": [
        {
            "src": "/android-chrome-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/android-chrome-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ],
    "theme_color": "#1f2937",
    "background_color": "#ffffff",
    "display": "standalone"
}
EOF

echo "✅ Created site.webmanifest"
echo ""
echo "🎯 Next: Visit https://favicon.io/favicon-converter/ and upload your logo!"
