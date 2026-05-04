import { Response } from 'express';
import Product, { IProduct } from '../models/Product';
import Category from '../models/Category';
import RatingStats from '../models/RatingStats';
import { AuthRequest } from '../middleware/auth';
import mongoose, { FilterQuery } from 'mongoose';
import { ApiError, asyncHandler } from '../middleware/errorHandler';

export const getAllProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { category, minPrice, maxPrice, search, sort = '-createdAt', page = 1, limit = 12 } = req.query;

  let query: FilterQuery<IProduct> = {};

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

  // Search with fallback
  if (search) {
    query.$or = [
      { $text: { $search: String(search) } },
      { name: { $regex: String(search), $options: 'i' } }
    ];
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Math.min(100, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  // Use a proper cursor for text score if we did pure text search, but since we use $or, we'll sort normally
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
});

export const getProductById = asyncHandler(async (req: AuthRequest, res: Response) => {
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
});

export const getProductBySlug = asyncHandler(async (req: AuthRequest, res: Response) => {
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
});

export const searchProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { q, limit = 10 } = req.query;

  if (!q) {
    throw new ApiError(400, 'Search query is required');
  }

  const queryStr = String(q);

  // Try text search first
  let products = await Product.find(
    { $text: { $search: queryStr } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(Number(limit))
    .populate('categoryId', 'name slug');

  // Fallback to regex if no text results found (better fuzzy matching)
  if (products.length === 0) {
    products = await Product.find({
      $or: [
        { name: { $regex: queryStr, $options: 'i' } },
        { description: { $regex: queryStr, $options: 'i' } },
        { sku: { $regex: queryStr, $options: 'i' } }
      ]
    })
      .limit(Number(limit))
      .populate('categoryId', 'name slug');
  }

  res.json({
    success: true,
    data: products,
  });
});
