import { Response } from 'express';
import Product from '../models/Product';
import Order from '../models/Order';
import Customer from '../models/Customer';
import User from '../models/User';
import Category from '../models/Category';
import Promotion from '../models/Promotion';
import MediaAsset from '../models/MediaAsset';
import Settings from '../models/Settings';
import { AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import * as orderService from '../services/orderService';
import { deleteFromCloudinary } from '../utils/cloudinary';

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const totalRevenueAgg = await Order.aggregate([
      { $match: { status: { $in: ['paid', 'processing', 'shipped', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Current 30 days revenue
    const currentMonthRevenueAgg = await Order.aggregate([
      { $match: { status: { $in: ['paid', 'processing', 'shipped', 'delivered'] }, createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const currentMonthRevenue = currentMonthRevenueAgg[0]?.total || 0;

    // Previous 30 days revenue
    const previousMonthRevenueAgg = await Order.aggregate([
      { $match: { status: { $in: ['paid', 'processing', 'shipped', 'delivered'] }, createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const previousMonthRevenue = previousMonthRevenueAgg[0]?.total || 0;

    let revenueChangePercentage = 0;
    if (previousMonthRevenue === 0) {
      revenueChangePercentage = currentMonthRevenue > 0 ? 100 : 0;
    } else {
      revenueChangePercentage = Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100);
    }

    // New customers in last 30 days
    const newCustomersThisMonth = await Customer.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('customerId', 'name')
      .exec();

    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          totalOrders,
          totalCustomers,
          totalRevenue,
          revenueChangePercentage,
          newCustomersThisMonth,
        },
        recentOrders,
        orderStats: Object.fromEntries(
          orderStats.map((item) => [item._id, item.count])
        ),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
  }
};

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;

    let query: any = {};

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) query.categoryId = cat._id;
    }

    if (search) {
      query.$text = { $search: String(search) };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(query)
      .skip(skip)
      .limit(limitNum)
      .populate('categoryId', 'name slug');

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
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

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, description, categoryId, price, sku, specs, images } = req.body;

    if (!name || !slug || !price || !categoryId) {
      throw new ApiError(400, 'Missing required fields');
    }

    // Check for duplicate slug
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      throw new ApiError(400, 'Product slug already exists');
    }

    const product = new Product({
      name,
      slug,
      description,
      categoryId,
      price: Number(price),
      sku,
      specs: specs ? (typeof specs === 'string' ? JSON.parse(specs) : specs) : {},
      images: images ? (typeof images === 'string' ? JSON.parse(images) : images) : [],
    });

    await product.save();

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to create product' });
    }
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, categoryId, price, sku, specs, images } = req.body;

    const updateData: any = {
      name,
      slug,
      description,
      categoryId,
      sku,
    };

    if (price !== undefined) updateData.price = Number(price);
    
    if (specs !== undefined) {
      updateData.specs = typeof specs === 'string' ? JSON.parse(specs) : specs;
    }
    if (images !== undefined) {
      updateData.images = typeof images === 'string' ? JSON.parse(images) : images;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to update product' });
    }
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, 'Invalid order status');
    }

    let order;
    if (status === 'paid') {
      order = await orderService.fulfillOrder(id);
    } else {
      order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
    }

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    res.json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to update order' });
    }
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Delete all product images from Cloudinary
    if (product.images && product.images.length > 0) {
      await Promise.all(product.images.map((imgUrl: string) => deleteFromCloudinary(imgUrl)));
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to delete product' });
    }
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    let query: any = {};
    if (status) query.status = status;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .populate('customerId', 'name phone')
      .populate('items.productId', 'name price');

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('customerId', 'name phone email')
      .populate('items.productId', 'name price images');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to fetch order' });
    }
  }
};

export const getCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const customers = await Customer.find()
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'email role');

    const total = await Customer.countDocuments();

    res.json({
      success: true,
      data: customers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch customers' });
  }
};
export const deleteCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to delete customer' });
    }
  }
};

export const toggleAdminRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // id is a Customer _id, so we need to find the linked User
    const customer = await Customer.findById(id);
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    const user = await User.findById(customer.userId);
    if (!user) {
      throw new ApiError(404, 'User account not found');
    }

    if (user.role === 'owner') {
      throw new ApiError(403, 'Cannot modify Owner role');
    }
    
    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();
    
    res.json({
      success: true,
      data: { role: user.role },
      message: `User role updated to ${user.role}`,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to update user role' });
    }
  }
};

export const getPromotions = async (req: AuthRequest, res: Response) => {
  try {
    const promotions = await Promotion.find().sort('-createdAt');
    res.json({ success: true, data: promotions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch promotions' });
  }
};

export const createPromotion = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, type, expiryDate } = req.body;
    
    if (!title || !description || !type || !expiryDate) {
      throw new ApiError(400, 'Missing required fields');
    }
    
    const promotion = new Promotion({
      title,
      description,
      type,
      expiryDate: new Date(expiryDate),
      status: 'active',
    });
    
    await promotion.save();
    
    res.status(201).json({
      success: true,
      data: promotion,
      message: 'Promotion created successfully',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to create promotion' });
    }
  }
};

export const updatePromotion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, type, expiryDate, status } = req.body;
    
    const promotion = await Promotion.findByIdAndUpdate(
      id,
      {
        title,
        description,
        type,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        status,
      },
      { new: true }
    );
    
    if (!promotion) {
      throw new ApiError(404, 'Promotion not found');
    }
    
    res.json({
      success: true,
      data: promotion,
      message: 'Promotion updated successfully',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to update promotion' });
    }
  }
};

export const deletePromotion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const promotion = await Promotion.findByIdAndDelete(id);
    
    if (!promotion) {
      throw new ApiError(404, 'Promotion not found');
    }
    
    res.json({ success: true, message: 'Promotion deleted successfully' });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to delete promotion' });
    }
  }
};

export const getMediaAssets = async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query;
    let query: any = {};
    if (type) query.type = { $regex: type, $options: 'i' };
    
    const assets = await MediaAsset.find(query).sort('-createdAt');
    res.json({ success: true, data: assets });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch media assets' });
  }
};

export const uploadMediaAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { name, url, type, size, cloudinaryId } = req.body;
    
    if (!name || !url || !type) {
      throw new ApiError(400, 'Missing required fields');
    }
    
    const asset = new MediaAsset({
      name,
      url,
      type,
      size: size || 0,
      cloudinaryId,
    });
    
    await asset.save();
    
    res.status(201).json({
      success: true,
      data: asset,
      message: 'Media asset uploaded successfully',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to upload media asset' });
    }
  }
};

export const deleteMediaAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const asset = await MediaAsset.findByIdAndDelete(id);
    
    if (!asset) {
      throw new ApiError(404, 'Media asset not found');
    }
    
    // Delete the media asset from Cloudinary
    if (asset.url) {
      await deleteFromCloudinary(asset.url);
    }
    
    res.json({ success: true, message: 'Media asset deleted successfully' });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to delete media asset' });
    }
  }
};

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const maintenanceMode = await Settings.findOne({ key: 'maintenanceMode' });
    const storeName = await Settings.findOne({ key: 'storeName' });
    const currency = await Settings.findOne({ key: 'currency' });
    
    res.json({
      success: true,
      data: {
        maintenanceMode: maintenanceMode?.value || false,
        storeName: storeName?.value || 'Hone Instrumental',
        currency: currency?.value || 'ETB',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { key, value } = req.body;
    
    if (!key) {
      throw new ApiError(400, 'Setting key is required');
    }
    
    await Settings.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true, new: true }
    );
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to update settings' });
    }
  }
};

export const toggleMaintenanceMode = async (req: AuthRequest, res: Response) => {
  try {
    const { enabled } = req.body;
    
    await Settings.findOneAndUpdate(
      { key: 'maintenanceMode' },
      { key: 'maintenanceMode', value: Boolean(enabled) },
      { upsert: true, new: true }
    );
    
    res.json({
      success: true,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to toggle maintenance mode' });
  }
};

export const getRevenueStats = async (req: AuthRequest, res: Response) => {
  try {
    const { period = '7d', groupBy = 'day' } = req.query;
    
    let startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);
    else if (period === '12m') startDate.setFullYear(startDate.getFullYear() - 1);
    
    const groupFormat = groupBy === 'week' ? '%Y-W%V' : groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';

    const revenueByDay = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['paid', 'processing', 'shipped', 'delivered'] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    
    const categoryStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['paid', 'processing', 'shipped', 'delivered'] },
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category.name',
          count: { $sum: 1 },
          revenue: { $sum: '$items.price' },
        },
      },
    ]);
    
    res.json({
      success: true,
      data: {
        revenueByDay,
        categoryStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch revenue stats' });
  }
};
export const deleteOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Strictly restrict deletion to delivered orders
    if (order.status !== 'delivered') {
      throw new ApiError(400, 'Only delivered orders can be deleted for registry cleanup');
    }

    await Order.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Delivered order purged from registry successfully',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to delete order' });
    }
  }
};
