// src/components/dashboard/avatar/avatarUtils.js

/**
 * Create an image element from a URL
 */
export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * Rotate an image
 */
export async function getRotatedImage(imageSrc, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const orientationChanged =
    rotation === 90 || rotation === -90 || rotation === 270 || rotation === -270;
  
  if (orientationChanged) {
    canvas.width = image.height;
    canvas.height = image.width;
  } else {
    canvas.width = image.width;
    canvas.height = image.height;
  }

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  return canvas.toDataURL('image/png');
}

/**
 * Get the cropped image with rotation and flip applied
 */
export async function getCroppedImg(
  imageSrc,
  pixelCrop,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Set canvas size to the desired output size (512x512 for optimal profile picture)
  const targetSize = 512;
  canvas.width = targetSize;
  canvas.height = targetSize;

  // Calculate scale factor to fit crop area into target size
  const scaleX = targetSize / pixelCrop.width;
  const scaleY = targetSize / pixelCrop.height;

  // Apply transformations
  ctx.save();
  
  // Translate to center
  ctx.translate(targetSize / 2, targetSize / 2);
  
  // Apply flip
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  
  // Translate back
  ctx.translate(-targetSize / 2, -targetSize / 2);

  // Draw the cropped image scaled to target size
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetSize,
    targetSize
  );

  ctx.restore();

  // Convert to blob with compression
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      },
      'image/webp', // Use WebP for better compression
      0.92 // High quality (0-1)
    );
  });
}

/**
 * Read a file as data URL
 */
export const readFile = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result), false);
    reader.readAsDataURL(file);
  });
};

/**
 * Compress and optimize image
 */
export async function compressImage(blob, maxSizeKB = 200) {
  // If already small enough, return as is
  if (blob.size <= maxSizeKB * 1024) {
    return blob;
  }

  // Try reducing quality
  const image = await createImage(URL.createObjectURL(blob));
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  // Try different quality levels
  let quality = 0.9;
  let compressedBlob = blob;

  while (quality > 0.5 && compressedBlob.size > maxSizeKB * 1024) {
    compressedBlob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/webp', quality);
    });
    quality -= 0.1;
  }

  return compressedBlob;
}

/**
 * Get file size in human readable format
 */
export function getFileSizeLabel(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}