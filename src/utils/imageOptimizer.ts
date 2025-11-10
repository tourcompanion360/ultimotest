/**
 * Image Optimization Utility
 * Compresses and resizes images while maintaining quality
 * Perfect for logos and avatars
 */

interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
}

/**
 * Optimizes an image file for web use
 * @param file - The original image file
 * @param options - Optimization options
 * @returns Optimized blob and metadata
 */
export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {}
): Promise<{ blob: Blob; width: number; height: number; originalSize: number; optimizedSize: number }> {
  const {
    maxWidth = 400,  // Perfect for logos - sharp at all sizes
    maxHeight = 400,
    quality = 0.9,   // High quality - 90% looks perfect, much smaller size
    outputFormat = 'image/webp' // WebP: best compression, great quality, modern browser support
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      img.onload = () => {
        try {
          // Calculate new dimensions maintaining aspect ratio
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;
            
            if (width > height) {
              width = maxWidth;
              height = Math.round(width / aspectRatio);
            } else {
              height = maxHeight;
              width = Math.round(height * aspectRatio);
            }
          }

          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Enable high-quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw image with high quality
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'));
                return;
              }

              resolve({
                blob,
                width,
                height,
                originalSize: file.size,
                optimizedSize: blob.size
              });
            },
            outputFormat,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Calculates compression ratio
 */
export function getCompressionRatio(originalSize: number, optimizedSize: number): number {
  return Math.round((1 - optimizedSize / originalSize) * 100);
}

/**
 * Validates if file is an image
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(file.type);
}

/**
 * Quick optimization preset for avatars/logos
 */
export async function optimizeAvatar(file: File) {
  return optimizeImage(file, {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.92,
    outputFormat: 'image/webp'
  });
}

/**
 * Quick optimization preset for high-quality logos
 */
export async function optimizeLogo(file: File) {
  return optimizeImage(file, {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.95,
    outputFormat: 'image/webp'
  });
}
