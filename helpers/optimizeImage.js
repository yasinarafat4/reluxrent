const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

async function optimizeImage(filePath) {
  const originalExt = path.extname(filePath);
  const dir = path.dirname(filePath);
  const baseName = path.basename(filePath, originalExt);
  const optimizedPath = path.join(dir, `${baseName}-optimized.webp`);

  try {
    await sharp(filePath).resize({ width: 600, withoutEnlargement: true }).toFormat('webp', { quality: 80 }).toFile(optimizedPath);

    await fs.unlink(filePath);

    return optimizedPath;
  } catch (error) {
    console.error('Image optimization error:', error);
    throw error;
  }
}

module.exports = { optimizeImage };
