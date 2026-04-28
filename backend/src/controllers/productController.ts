import { Response } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import RatingStats from '../models/RatingStats';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';
import { ApiError } from '../middleware/errorHandler';

export const getAllProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { category, minPrice, maxPrice, search, sort = '-createdAt', page = 1, limit = 12 } = req.query;

    let query: any = {};

    // Filter by category
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.categoryId = categoryDoc._id;
      }
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search
    if (search) {
      query.$text = { $search: String(search) };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(query)
      .sort(String(sort))
      .skip(skip)
      .limit(limitNum)
      .populate('categoryId', 'name slug');

    const total = await Product.countDocuments(query);

    // Fetch rating stats for all products
    const productIds = products.map(p => p._id);
    const ratingStats = await RatingStats.find({ productId: { $in: productIds } });
    const ratingMap = new Map(ratingStats.map(r => [r.productId.toString(), r]));

    // Attach rating to each product
    const productsWithRating = products.map(p => {
      const stats = ratingMap.get(p._id.toString());
      return {
        ...p.toObject(),
        rating: stats ? {
          averageRating: stats.averageRating,
          totalRatings: stats.rating1Count + stats.rating2Count + stats.rating3Count + stats.rating4Count + stats.rating5Count,
        } : undefined,
      };
    });

    res.json({
      success: true,
      data: productsWithRating,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate('categoryId', 'name slug');

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Fetch rating stats
    const ratingStats = await RatingStats.findOne({ productId: product._id });
    const productData = product.toObject();
    
    if (ratingStats) {
      productData.rating = {
        averageRating: ratingStats.averageRating,
        totalRatings: ratingStats.rating1Count + ratingStats.rating2Count + ratingStats.rating3Count + ratingStats.rating4Count + ratingStats.rating5Count,
      };
    }

    res.json({
      success: true,
      data: productData,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to fetch product' });
    }
  }
};

export const getProductBySlug = async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug }).populate('categoryId', 'name slug');

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Fetch rating stats
    const ratingStats = await RatingStats.findOne({ productId: product._id });
    const productData = product.toObject();
    
    if (ratingStats) {
      productData.rating = {
        averageRating: ratingStats.averageRating,
        totalRatings: ratingStats.rating1Count + ratingStats.rating2Count + ratingStats.rating3Count + ratingStats.rating4Count + ratingStats.rating5Count,
      };
    }

    res.json({
      success: true,
      data: productData,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to fetch product' });
    }
  }
};

export const searchProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      throw new ApiError(400, 'Search query is required');
    }

    const products = await Product.find(
      { $text: { $search: String(q) } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(Number(limit))
      .populate('categoryId', 'name slug');

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Search failed' });
    }
  }
};
