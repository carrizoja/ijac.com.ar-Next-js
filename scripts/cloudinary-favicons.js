#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Your logo URL from Cloudinary - requesting different sizes
const logoBaseUrl = 'https://res.cloudinary.com/dovghglgj/image/upload';
const logoId = 'v1755013017/ijac/logo_ijac_neg_hnsnrp.png';

// Define the sizes we need for favicons
const faviconSizes = [
  { size: '16x16', filename: 'favicon-16x16.png' },
  { size: '32x32', filename: 'favicon-32x32.png' },
  { size: '180x180', filename: 'apple-touch-icon.png' },
  { size: '192x192', filename: 'android-chrome-192x192.png' },
  { size: '512x512', filename: 'android-chrome-512x512.png' }
];

// Function to download file
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${path.basename(destination)}`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(destination, () => {}); // Delete the file async
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function generateFavicons() {
  try {
    console.log('🎨 Generating iJAC favicons from Cloudinary...\n');
    
    // Create public directory if it doesn't exist
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Download resized versions using Cloudinary transformations
    for (const favicon of faviconSizes) {
      const cloudinaryUrl = `${logoBaseUrl}/c_fit,w_${favicon.size.split('x')[0]},h_${favicon.size.split('x')[1]}/${logoId}`;
      const destinationPath = path.join(publicDir, favicon.filename);
      
      try {
        await downloadFile(cloudinaryUrl, destinationPath);
      } catch (error) {
        console.log(`⚠️  Failed to download ${favicon.filename}: ${error.message}`);
      }
    }

    // Create a simple ICO file by copying the 32x32 version
    const favicon32Path = path.join(publicDir, 'favicon-32x32.png');
    const faviconIcoPath = path.join(publicDir, 'favicon.ico');
    const srcAppFaviconPath = path.join(__dirname, '..', 'src', 'app', 'favicon.ico');
    
    if (fs.existsSync(favicon32Path)) {
      fs.copyFileSync(favicon32Path, faviconIcoPath);
      fs.copyFileSync(favicon32Path, srcAppFaviconPath);
      console.log('✅ Created favicon.ico files');
    }

    // Update the web manifest
    const manifest = {
      name: "iJAC IT Solutions",
      short_name: "iJAC",
      icons: [
        {
          src: "/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png"
        }
      ],
      theme_color: "#1f2937",
      background_color: "#ffffff",
      display: "standalone"
    };

    fs.writeFileSync(
      path.join(publicDir, 'site.webmanifest'),
      JSON.stringify(manifest, null, 2)
    );
    console.log('✅ Updated site.webmanifest');

    console.log('\n🎉 Favicon setup complete!');
    console.log('\n📱 Your iJAC logo is now set as the favicon in multiple sizes:');
    faviconSizes.forEach(favicon => {
      const filePath = path.join(publicDir, favicon.filename);
      if (fs.existsSync(filePath)) {
        console.log(`   ✅ ${favicon.filename} (${favicon.size})`);
      } else {
        console.log(`   ❌ ${favicon.filename} (${favicon.size}) - failed`);
      }
    });

  } catch (error) {
    console.error('❌ Error generating favicons:', error);
  }
}

generateFavicons();
