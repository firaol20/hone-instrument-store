import { Response } from 'express';
import Order from '../models/Order';
import Customer from '../models/Customer';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

const SHIPPING_FEES: Record<string, number> = {
  standard: 10,
  express: 25,
  pickup: 0,
  free_delivery: 0,
};

function computeShippingFee(deliveryOption: string): number {
  return SHIPPING_FEES[deliveryOption] ?? 10;
}

async function assertOrderOwnedByCustomer(orderId: string, userId: string) {
  const customer = await Customer.findOne({ userId });
  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }
  if (order.customerId.toString() !== customer._id.toString()) {
    throw new ApiError(403, 'Forbidden');
  }
  return { order, customer };
}

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { items, address, deliveryOption, notes, customerPhone, customerEmail } = req.body;

    if (!items || items.length === 0) {
      throw new ApiError(400, 'Cart is empty');
    }

    if (!address || !deliveryOption) {
      throw new ApiError(400, 'Address and delivery option are required');
    }

    // Get customer
    const customer = await Customer.findOne({ userId: req.userId }).populate('userId');
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    const user = customer.userId as any;

    // Calculate totals
    let subtotal = 0;
    const orderItems = await Promise.all(
      items.map(async (item: any) => {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new ApiError(404, `Product ${item.productId} not found`);
        }
        subtotal += product.price * item.quantity;
        return {
          productId: product._id,
          quantity: item.quantity,
          price: product.price,
        };
      })
    );

    const shippingFee = computeShippingFee(deliveryOption);
    const total = subtotal + shippingFee;

    // Create order
    const order = new Order({
      customerId: customer._id,
      items: orderItems,
      address,
      deliveryOption,
      subtotal,
      shippingFee,
      total,
      status: 'pending',
      notes,
      customerPhone: customerPhone || customer.phone || '',
      customerEmail: customerEmail || user?.email || '',
    });

    await order.save();

    // Trigger Notification & Telegram
    try {
      const { createAndBroadcastNotification, sendOrderTelegramNotification } = await import('../services/notificationService');
      const msg = `🎉 New Order Placed!\n\nOrder ID: ${order._id}\nTotal: ${total} ETB\nDelivery: ${deliveryOption}\nStatus: Pending`;
      await createAndBroadcastNotification('order', `New Order Placed: ${total} ETB`, { orderId: order._id });
      await sendOrderTelegramNotification(msg);
    } catch (notifErr) {
      console.error('Notification error:', notifErr);
    }

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to create order' });
    }
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await assertOrderOwnedByCustomer(id, req.userId!);

    const order = await Order.findById(id)
      .populate('customerId')
      .populate('items.productId');

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

export const updateOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { address, deliveryOption, notes } = req.body;

    const { order } = await assertOrderOwnedByCustomer(id, req.userId!);

    if (order.status !== 'pending') {
      throw new ApiError(400, 'Order can no longer be updated');
    }

    const nextDelivery = deliveryOption ?? order.deliveryOption;
    if (!['standard', 'express', 'pickup', 'free_delivery'].includes(nextDelivery)) {
      throw new ApiError(400, 'Invalid delivery option');
    }

    const nextAddress = address ?? order.address;

    if (nextDelivery === 'free_delivery') {
      const lat = nextAddress?.coordinates?.lat;
      const lng = nextAddress?.coordinates?.lng;
      if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
        throw new ApiError(400, 'Free delivery requires a pinned location (latitude and longitude)');
      }
    }

    const shippingFee = computeShippingFee(nextDelivery);
    const subtotal = order.subtotal;
    const total = subtotal + shippingFee;

    order.address = nextAddress;
    order.deliveryOption = nextDelivery;
    order.shippingFee = shippingFee;
    order.total = total;
    if (notes !== undefined) {
      order.notes = notes;
    }

    await order.save();

    const populated = await Order.findById(order._id)
      .populate('items.productId');

    res.json({
      success: true,
      data: populated,
      message: 'Order updated',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to update order' });
    }
  }
};

export const getCustomerOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const customer = await Customer.findOne({ userId: req.userId });
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find({ customerId: customer._id })
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .populate('items.productId');

    const total = await Order.countDocuments({ customerId: customer._id });

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
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to fetch orders' });
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

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    res.json({
      success: true,
      data: order,
      message: 'Order status updated',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to update order' });
    }
  }
};
