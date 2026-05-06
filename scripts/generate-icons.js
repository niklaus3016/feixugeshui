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

async function generateIcons() {
  console.log('Starting icon generation...');
  
  try {
    const buffer = fs.readFileSync(sourceIcon);
    
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
    
    console.log('Generating splash.png for drawable...');
    const splashPath = path.join(androidResDir, 'drawable', 'splash.png');
    const drawableDir = path.dirname(splashPath);
    
    if (!fs.existsSync(drawableDir)) {
      fs.mkdirSync(drawableDir, { recursive: true });
    }
    
    await sharp(buffer)
      .resize(128, 128)
      .toFile(splashPath);
    
    console.log('✅ All icons generated successfully!');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
