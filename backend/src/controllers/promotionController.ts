import { Request, Response } from 'express';
import Promotion from '../models/Promotion';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { deleteFromCloudinary } from '../utils/cloudinary';

/**
 * Get all promotions (Admin)
 */
export const getPromotions = async (req: AuthRequest, res: Response) => {
  try {
    const promotions = await Promotion.find().sort('-createdAt');
    res.json({ success: true, data: promotions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch promotions' });
  }
};

/**
 * Get active promotions (Public)
 */
export const getActivePromotions = async (req: Request, res: Response) => {
  try {
    const activePromotions = await Promotion.find({
      status: 'active',
      expiryDate: { $gt: new Date() }
    }).sort('-createdAt');

    res.json({ success: true, data: activePromotions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch active promotions' });
  }
};

/**
 * Create a new promotion
 */
export const createPromotion = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, bannerImage, type, expiryDate, status } = req.body;

    if (!title || !expiryDate) {
      throw new ApiError(400, 'Title and end date are required');
    }

    const promotion = new Promotion({
      title,
      description,
      bannerImage,
      type: type || 'banner',
      expiryDate: new Date(expiryDate),
      status: status || 'inactive'
    });

    await promotion.save();

    res.status(201).json({
      success: true,
      data: promotion,
      message: 'Promotion created successfully'
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to create promotion' });
    }
  }
};

/**
 * Update an existing promotion
 */
export const updatePromotion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, bannerImage, type, expiryDate, status } = req.body;

    const promotion = await Promotion.findById(id);
    if (!promotion) {
      throw new ApiError(404, 'Promotion not found');
    }

    if (title) promotion.title = title;
    if (description !== undefined) promotion.description = description;
    if (bannerImage !== undefined) promotion.bannerImage = bannerImage;
    if (type) promotion.type = type;
    if (expiryDate) promotion.expiryDate = new Date(expiryDate);
    if (status) promotion.status = status;

    await promotion.save();

    res.json({
      success: true,
      data: promotion,
      message: 'Promotion updated successfully'
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to update promotion' });
    }
  }
};

/**
 * Delete a promotion
 */
export const deletePromotion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const promotion = await Promotion.findByIdAndDelete(id);

    if (!promotion) {
      throw new ApiError(404, 'Promotion not found');
    }

    // Delete image from Cloudinary if it exists
    if (promotion.bannerImage) {
      await deleteFromCloudinary(promotion.bannerImage);
    }

    res.json({
      success: true,
      message: 'Promotion deleted successfully'
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to delete promotion' });
    }
  }
};
