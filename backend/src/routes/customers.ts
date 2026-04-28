import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import Customer from '../models/Customer';
import * as orderController from '../controllers/orderController';

const router = express.Router();

// Get customer profile
router.get('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.userId }).populate('userId', 'email role');
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

// Update customer profile
router.put('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, phone } = req.body;
    const customer = await Customer.findOneAndUpdate(
      { userId: req.userId },
      { name, phone },
      { new: true }
    );
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// Get customer orders
router.get('/orders', authenticate, orderController.getCustomerOrders);

// Add address
router.post('/addresses', authenticate, async (req: AuthRequest, res) => {
  try {
    const { type, street, city, state, zip, country, isDefault } = req.body;
    const customer = await Customer.findOneAndUpdate(
      { userId: req.userId },
      {
        $push: {
          addresses: { type, street, city, state, zip, country, isDefault },
        },
      },
      { new: true }
    );
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add address' });
  }
});

// Get addresses
router.get('/addresses', authenticate, async (req: AuthRequest, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.userId });
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    res.json({ success: true, data: customer.addresses });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch addresses' });
  }
});

export default router;
