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

  console.log('getCroppedImg called with:', { rotation, flip, pixelCrop });

  // Set canvas size to the desired output size (512x512 for optimal profile picture)
  const targetSize = 512;
  canvas.width = targetSize;
  canvas.height = targetSize;

  // Clear canvas
  ctx.clearRect(0, 0, targetSize, targetSize);

  // Save the context state
  ctx.save();

  // Move origin to center of canvas
  ctx.translate(targetSize / 2, targetSize / 2);

  // Apply rotation around center
  if (rotation !== 0) {
    console.log('Applying rotation:', rotation);
    ctx.rotate((rotation * Math.PI) / 180);
  }

  // Apply flip by scaling
  const scaleX = flip.horizontal ? -1 : 1;
  const scaleY = flip.vertical ? -1 : 1;
  console.log('Applying flip scale:', { scaleX, scaleY });
  ctx.scale(scaleX, scaleY);

  // Draw image centered on the transformed canvas
  // After transforms, we draw from center (negative half-size)
  const drawX = -targetSize / 2;
  const drawY = -targetSize / 2;
  
  console.log('Drawing image at:', { drawX, drawY, targetSize });
  
  ctx.drawImage(
    image,
    pixelCrop.x,      // Source X
    pixelCrop.y,      // Source Y
    pixelCrop.width,  // Source Width
    pixelCrop.height, // Source Height
    drawX,            // Destination X (from center)
    drawY,            // Destination Y (from center)
    targetSize,       // Destination Width
    targetSize        // Destination Height
  );

  // Restore context state
  ctx.restore();

  console.log('Image drawn, converting to blob...');

  // Convert to blob with compression
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        console.log('Blob created, size:', blob.size);
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
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result), false);
    reader.addEventListener('error', (error) => reject(error), false);
    
    if (file instanceof Blob || file instanceof File) {
      reader.readAsDataURL(file);
    } else {
      reject(new Error('Invalid file type'));
    }
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