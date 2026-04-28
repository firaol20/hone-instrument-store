import Order from '../models/Order';
import Product from '../models/Product';
import { ApiError } from '../middleware/errorHandler';

export const fulfillOrder = async (orderId: string, paymentId?: string) => {
  const order = await Order.findById(orderId);
  
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }


  if (order.status === 'paid' || order.status === 'processing' || order.status === 'delivered') {
    return order;
  }

  // Update status and payment info
  order.status = 'paid';
  if (paymentId) {
    order.paymentId = paymentId;
  }



  await order.save();
  return order;
};

