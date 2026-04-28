import { v2 as cloudinary } from 'cloudinary';

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extracts the Cloudinary public_id from a secure URL.
 * Example URL: https://res.cloudinary.com/demo/image/upload/v1234567/folder/file.jpg
 * Returns: folder/file
 */
export const getCloudinaryPublicId = (url: string): string | null => {
  try {
    if (!url || !url.includes('cloudinary.com')) return null;

    const parts = url.split('/upload/');
    if (parts.length !== 2) return null;

    const pathPart = parts[1];
    const pathParts = pathPart.split('/');

    // Remove the version string (e.g. v1776616291) if it exists
    if (pathParts[0].startsWith('v') && !isNaN(Number(pathParts[0].substring(1)))) {
      pathParts.shift();
    }

    const fullPath = pathParts.join('/');

    // Remove the file extension
    const lastDotIndex = fullPath.lastIndexOf('.');
    return lastDotIndex !== -1 ? fullPath.substring(0, lastDotIndex) : fullPath;
  } catch (error) {
    console.error('Error extracting Cloudinary public ID:', error);
    return null;
  }
};

/**
 * Deletes a file from Cloudinary given its URL.
 */
export const deleteFromCloudinary = async (url: string): Promise<boolean> => {
  try {
    const publicId = getCloudinaryPublicId(url);
    if (!publicId) return false;

    console.log(`🗑️ Deleting from Cloudinary: ${publicId}`);

    // By default, resource_type is 'image', but it works for audio/video too if specified.
    // Cloudinary uploader.destroy uses 'image' by default. We can try 'image' first, then 'video' (which includes audio).
    let result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'not found') {
      // Sometimes audio/video files are uploaded as 'video' resource type
      result = await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    }

    console.log(`✅ Cloudinary delete result:`, result);
    return result.result === 'ok';
  } catch (error) {
    console.error('❌ Failed to delete from Cloudinary:', error);
    return false;
  }
};
