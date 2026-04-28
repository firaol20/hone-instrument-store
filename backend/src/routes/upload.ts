import express, { Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { authenticate, requireAdmin } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

const router = express.Router();

// Multer config (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Cloudinary config (assuming env vars exist)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * @route POST /api/upload
 * @desc  Upload a file to Cloudinary
 * @access Admin
 */
router.post('/', authenticate as any, requireAdmin as any, upload.single('file') as any, async (req: any, res: any) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded');
    }

    const folder = req.body.folder || 'hone_store';
    
    // Convert buffer to base64
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(fileBase64, {
      folder,
      resource_type: 'auto',
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        bytes: result.bytes,
        format: result.format,
      },
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      console.error('❌ Cloudinary upload failed:', error.message || error);
      res.status(500).json({ success: false, error: 'Failed to upload file to storage.' });
    }
  }
});

export default router;
