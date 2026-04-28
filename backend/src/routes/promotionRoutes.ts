import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import * as promotionController from '../controllers/promotionController';

const router = express.Router();

// Public route - active promotions for storefront
router.get('/active', promotionController.getActivePromotions);

// Admin routes (require login and admin role)
router.get('/', authenticate, requireAdmin, promotionController.getPromotions);
router.post('/', authenticate, requireAdmin, promotionController.createPromotion);
router.put('/:id', authenticate, requireAdmin, promotionController.updatePromotion);
router.delete('/:id', authenticate, requireAdmin, promotionController.deletePromotion);

export default router;
