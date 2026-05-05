import express from 'express';
import { authenticate, requireAdmin, requireOwner } from '../middleware/auth';
import * as adminController from '../controllers/adminController';

const router = express.Router();

router.get('/dashboard', authenticate, requireAdmin, adminController.getDashboard);
router.get('/revenue-stats', authenticate, requireAdmin, adminController.getRevenueStats);
router.get('/products', authenticate, requireAdmin, adminController.getProducts);
router.post('/products', authenticate, requireAdmin, adminController.createProduct);
router.put('/products/:id', authenticate, requireAdmin, adminController.updateProduct);
router.delete('/products/:id', authenticate, requireAdmin, adminController.deleteProduct);
router.get('/orders', authenticate, requireAdmin, adminController.getOrders);
router.get('/orders/:id', authenticate, requireAdmin, adminController.getOrderById);
router.put('/orders/:id', authenticate, requireAdmin, adminController.updateOrderStatus);
router.delete('/orders/:id', authenticate, requireAdmin, adminController.deleteOrder);
router.get('/customers', authenticate, requireAdmin, adminController.getCustomers);
router.put('/customers/:id/toggle-admin', authenticate, requireOwner, adminController.toggleAdminRole);
router.delete('/customers/:id', authenticate, requireAdmin, adminController.deleteCustomer);

router.get('/media', authenticate, requireAdmin, adminController.getMediaAssets);
router.post('/media', authenticate, requireAdmin, adminController.uploadMediaAsset);
router.delete('/media/:id', authenticate, requireAdmin, adminController.deleteMediaAsset);

router.get('/settings', authenticate, requireAdmin, adminController.getSettings);
router.put('/settings', authenticate, requireAdmin, adminController.updateSettings);
router.post('/settings/maintenance', authenticate, requireAdmin, adminController.toggleMaintenanceMode);

import * as notificationController from '../controllers/notificationController';

router.get('/notifications', authenticate, requireAdmin, notificationController.getNotifications);
router.get('/notifications/stream', authenticate, requireAdmin, notificationController.streamNotifications);
router.put('/notifications/read', authenticate, requireAdmin, notificationController.markAsRead);

export default router;
