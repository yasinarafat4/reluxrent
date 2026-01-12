const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const saveBase64Image = async (base64String) => {
  const matches = base64String.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) throw new Error('Invalid base64 string');

  const ext = matches[1].split('/')[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const filename = `${uuidv4()}.avif`;
  const filepath = path.join(uploadDir, filename);

  // Ensure uploads directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Optimize + always save as WebP
  await sharp(buffer)
    .rotate() // auto-orient
    .resize(1200, 1200, { fit: 'inside' }) // limit max size
    .webp({ quality: 50 }) // compress to webp
    .toFile(filepath);

  return `/uploads/${filename}`;
};

const processImage = async (input) => {
  if (!input) return null;

  // Already uploaded image URL
  if (typeof input === 'string' && input.startsWith('https')) return input;

  if (typeof input === 'string' && input.startsWith('/uploads')) return input;

  // base64 string
  if (typeof input === 'string' && input.startsWith('data:image')) {
    return saveBase64Image(input);
  }

  // React Admin file object
  if (typeof input === 'object') {
    if (input.src?.startsWith('data:image')) return saveBase64Image(input.src);
    if (typeof input.src === 'string') return input.src;
  }

  return null;
};

module.exports = {
  processImage,
  saveBase64Image,
};
