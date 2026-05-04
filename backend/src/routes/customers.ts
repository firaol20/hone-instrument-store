import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import Customer from '../models/Customer';
import * as orderController from '../controllers/orderController';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler';

const router = express.Router();

// Get customer profile
router.get('/profile', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const customer = await Customer.findOne({ userId: req.userId }).populate('userId', 'email role');
  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }
  res.json({ success: true, data: customer });
}));

// Update customer profile
router.put('/profile', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { name, phone } = req.body;
  const customer = await Customer.findOneAndUpdate(
    { userId: req.userId },
    { name, phone },
    { new: true }
  );
  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }
  res.json({ success: true, data: customer });
}));

// Get customer orders
router.get('/orders', authenticate, orderController.getCustomerOrders);

// Add address
router.post('/addresses', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { type, street, city, state, zip, country, isDefault, coordinates } = req.body;
  
  const customer = await Customer.findOne({ userId: req.userId });
  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  // If this is the first address or isDefault is true, manage other default flags
  if (isDefault) {
    customer.addresses.forEach(addr => addr.isDefault = false);
  }

  customer.addresses.push({ 
    type, 
    street, 
    city, 
    state, 
    zip: zip || '0000', 
    country: country || 'Ethiopia', 
    isDefault: isDefault || customer.addresses.length === 0,
    coordinates
  });

  await customer.save();
  res.json({ success: true, data: customer.addresses[customer.addresses.length - 1] });
}));

// Update address
router.put('/addresses/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { type, street, city, state, zip, country, isDefault, coordinates } = req.body;
  
  const customer = await Customer.findOne({ userId: req.userId });
  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  const address = customer.addresses.id(req.params.id);
  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  if (isDefault) {
    customer.addresses.forEach(addr => addr.isDefault = false);
  }

  Object.assign(address, { type, street, city, state, zip, country, isDefault, coordinates });
  await customer.save();
  
  res.json({ success: true, data: address });
}));

// Delete address
router.delete('/addresses/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const customer = await Customer.findOne({ userId: req.userId });
  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  customer.addresses.pull({ _id: req.params.id });
  await customer.save();
  
  res.json({ success: true, message: 'Address deleted' });
}));

// Get addresses
router.get('/addresses', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const customer = await Customer.findOne({ userId: req.userId });
  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }
  res.json({ success: true, data: customer.addresses });
}));

export default router;
