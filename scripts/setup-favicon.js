#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Your logo URL from Cloudinary
const logoUrl = 'https://res.cloudinary.com/dovghglgj/image/upload/v1755013017/ijac/logo_ijac_neg_hnsnrp.png';

// Function to download file
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    
    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${destination}`);
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

async function setupFavicon() {
  try {
    // Create public directory if it doesn't exist
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Download the logo to public directory
    const logoPath = path.join(publicDir, 'ijac-logo.png');
    await downloadFile(logoUrl, logoPath);

    console.log('\n✅ Logo downloaded successfully!');
    console.log('\n🔧 Next steps:');
    console.log('1. Convert the logo to ICO format using an online converter like:');
    console.log('   - https://convertio.co/png-ico/');
    console.log('   - https://favicon.io/favicon-converter/');
    console.log('2. Generate multiple favicon sizes (16x16, 32x32, 180x180)');
    console.log('3. Replace the files in public/ and src/app/');
    console.log('\n📝 Files to create:');
    console.log('   - public/favicon.ico');
    console.log('   - public/favicon-16x16.png');
    console.log('   - public/favicon-32x32.png');
    console.log('   - public/apple-touch-icon.png (180x180)');
    console.log('   - src/app/favicon.ico');

  } catch (error) {
    console.error('Error downloading logo:', error);
  }
}

setupFavicon();
