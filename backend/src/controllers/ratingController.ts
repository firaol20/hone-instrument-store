import { Response } from 'express';
import Rating from '../models/Rating';
import RatingStats from '../models/RatingStats';
import Order from '../models/Order';
import Customer from '../models/Customer';
import { AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

// ─────────────────────────────────────────────
// Internal: recompute + upsert stats for a product
// ─────────────────────────────────────────────
async function updateProductRatingStats(productId: string) {
  const ratings = await Rating.find({ productId });
  const totalRatings = ratings.length;

  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;

  for (const r of ratings) {
    counts[r.rating as keyof typeof counts]++;
    sum += r.rating;
  }

  const averageRating = totalRatings
    ? Number((sum / totalRatings).toFixed(1))
    : 0;

  await RatingStats.findOneAndUpdate(
    { productId },
    {
      productId,
      averageRating,
      totalRatings,
      rating1Count: counts[1],
      rating2Count: counts[2],
      rating3Count: counts[3],
      rating4Count: counts[4],
      rating5Count: counts[5],
    },
    { upsert: true, new: true }
  );
}

// ─────────────────────────────────────────────
// POST /api/ratings
// ─────────────────────────────────────────────
export const createRating = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, rating, review } = req.body;

    if (!productId || !rating) {
      throw new ApiError(400, 'Product ID and rating are required');
    }
    if (rating < 1 || rating > 5) {
      throw new ApiError(400, 'Rating must be between 1 and 5');
    }

    const customer = await Customer.findOne({ userId: req.userId });
    if (!customer) throw new ApiError(404, 'Customer profile not found');

    // Verified purchase check
    const order = await Order.findOne({
      customerId: customer._id,
      'items.productId': productId,
      status: 'delivered',
    });

    const filter = { customerId: customer._id, productId };
    const update: any = {
      orderId: order?._id,
      rating: Number(rating),
      isVerifiedPurchase: !!order,
    };

    if (review !== undefined) {
      update.review = (review || '').trim();
    }

    const existingRating = await Rating.findOne(filter);
    if (existingRating) {
      throw new ApiError(400, 'You have already rated this product');
    }

    const newRating = await Rating.create({
      ...filter,
      ...update
    });
    await updateProductRatingStats(productId);

    res.status(201).json({
      success: true,
      data: newRating,
      message: 'Rating submitted successfully',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      console.error('Create rating error:', error);
      res.status(500).json({ success: false, error: 'Failed to create rating' });
    }
  }
};

// ─────────────────────────────────────────────
// GET /api/ratings/product/:productId
// ─────────────────────────────────────────────
export const getProductRatings = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum   = Math.max(1, Number(page));
    const limitNum  = Math.max(1, Math.min(50, Number(limit)));
    const skip      = (pageNum - 1) * limitNum;

    const [ratings, total, stats] = await Promise.all([
      Rating.find({ productId })
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .populate('customerId', 'name'),
      Rating.countDocuments({ productId }),
      RatingStats.findOne({ productId }),
    ]);

    const defaultStats = {
      averageRating: 0,
      totalRatings:  0,
      rating1Count:  0,
      rating2Count:  0,
      rating3Count:  0,
      rating4Count:  0,
      rating5Count:  0,
    };

    const s = stats ?? defaultStats;

    res.json({
      success: true,
      data: {
        ratings,
        stats: {
          averageRating: s.averageRating,
          totalRatings:  s.totalRatings,
          distribution: {
            5: s.rating5Count,
            4: s.rating4Count,
            3: s.rating3Count,
            2: s.rating2Count,
            1: s.rating1Count,
          },
        },
      },
      pagination: {
        total,
        page:  pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ratings' });
  }
};

// ─────────────────────────────────────────────
// GET /api/ratings/product/:productId/user
// ─────────────────────────────────────────────
export const getUserRatingForProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;

    const customer = await Customer.findOne({ userId: req.userId });
    if (!customer) return res.json({ success: true, data: null });

    const rating = await Rating.findOne({ customerId: customer._id, productId });
    res.json({ success: true, data: rating });
  } catch (error) {
    console.error('Get user rating error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch rating' });
  }
};
// ─────────────────────────────────────────────
// GET /api/ratings/user-ratings
// ─────────────────────────────────────────────
export const getUserAllRatings = async (req: AuthRequest, res: Response) => {
  try {
    const customer = await Customer.findOne({ userId: req.userId });
    if (!customer) return res.json({ success: true, data: {} });

    const ratings = await Rating.find({ customerId: customer._id });
    
    // Map array into a dictionary: { "productId": ratingValue } for optimal frontend lookup
    const ratingsMap: Record<string, number> = {};
    ratings.forEach((r) => {
      if (r.productId && r.rating) {
        ratingsMap[r.productId.toString()] = r.rating;
      }
    });

    res.json({ success: true, data: ratingsMap });
  } catch (error) {
    console.error('Get all user ratings error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user ratings' });
  }
};
// ─────────────────────────────────────────────
// Admin: GET /api/ratings
// ─────────────────────────────────────────────
export const getAllRatings = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum  = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(50, Number(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [ratings, total] = await Promise.all([
      Rating.find()
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .populate('productId',  'name')
        .populate('customerId', 'name'),
      Rating.countDocuments(),
    ]);

    res.json({
      success: true,
      data: ratings,
      pagination: {
        total,
        page:  pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch ratings' });
  }
};

// ─────────────────────────────────────────────
// Admin: DELETE /api/ratings/:id
// ─────────────────────────────────────────────
export const deleteRating = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const rating = await Rating.findByIdAndDelete(id);

    if (!rating) throw new ApiError(404, 'Rating not found');

    await updateProductRatingStats(rating.productId.toString());

    res.json({ success: true, message: 'Rating deleted successfully' });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to delete rating' });
    }
  }
};
