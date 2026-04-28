import express from 'express';
import { authenticate } from '../middleware/auth';
import * as orderController from '../controllers/orderController';

const router = express.Router();

router.post('/', authenticate, orderController.createOrder);
router.get('/customer/orders', authenticate, orderController.getCustomerOrders);
router.patch('/:id', authenticate, orderController.updateOrder);
router.get('/:id', authenticate, orderController.getOrderById);

export default router;
