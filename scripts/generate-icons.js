import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourceIcon = path.join(path.dirname(import.meta.url).replace('file://', ''), '../fxgszs512.png');
const androidResDir = path.join(path.dirname(import.meta.url).replace('file://', ''), '../android/app/src/main/res');

const iconSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

const splashSizes = {
  'drawable': 128,
  'drawable-port-mdpi': { width: 320, height: 480 },
  'drawable-port-hdpi': { width: 480, height: 800 },
  'drawable-port-xhdpi': { width: 720, height: 1280 },
  'drawable-port-xxhdpi': { width: 1080, height: 1920 },
  'drawable-port-xxxhdpi': { width: 1440, height: 2560 },
  'drawable-land-mdpi': { width: 480, height: 320 },
  'drawable-land-hdpi': { width: 800, height: 480 },
  'drawable-land-xhdpi': { width: 1280, height: 720 },
  'drawable-land-xxhdpi': { width: 1920, height: 1080 },
  'drawable-land-xxxhdpi': { width: 2560, height: 1440 }
};

async function generateIcons() {
  console.log('Starting icon generation...');
  
  try {
    const buffer = fs.readFileSync(sourceIcon);
    
    console.log('\n=== Generating launcher icons ===');
    for (const [dir, size] of Object.entries(iconSizes)) {
      const dirPath = path.join(androidResDir, dir);
      
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      const launcherPath = path.join(dirPath, 'ic_launcher.png');
      const launcherRoundPath = path.join(dirPath, 'ic_launcher_round.png');
      const foregroundPath = path.join(dirPath, 'ic_launcher_foreground.png');
      
      console.log(`Generating ${dir} (${size}x${size})...`);
      
      await sharp(buffer)
        .resize(size, size)
        .toFile(launcherPath);
      
      await sharp(buffer)
        .resize(size, size)
        .toFile(launcherRoundPath);
      
      await sharp(buffer)
        .resize(size, size)
        .toFile(foregroundPath);
    }
    
    console.log('\n=== Generating splash screens ===');
    for (const [dir, size] of Object.entries(splashSizes)) {
      const dirPath = path.join(androidResDir, dir);
      
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      const splashPath = path.join(dirPath, 'splash.png');
      
      if (typeof size === 'number') {
        console.log(`Generating ${dir} (${size}x${size})...`);
        await sharp(buffer)
          .resize(size, size)
          .toFile(splashPath);
      } else {
        console.log(`Generating ${dir} (${size.width}x${size.height})...`);
        await sharp(buffer)
          .resize(size.width, size.height)
          .toFile(splashPath);
      }
    }
    
    console.log('\n✅ All icons generated successfully!');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
