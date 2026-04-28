import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import * as ratingController from '../controllers/ratingController';

const router = express.Router();

// Public / customer routes
router.get('/user-ratings',             authenticate, ratingController.getUserAllRatings);
router.get('/product/:productId',       ratingController.getProductRatings);
router.get('/product/:productId/user',  authenticate, ratingController.getUserRatingForProduct);
router.post('/',                        authenticate, ratingController.createRating);

// Admin routes
router.get('/',    authenticate, requireAdmin, ratingController.getAllRatings);
router.delete('/:id', authenticate, requireAdmin, ratingController.deleteRating);

export default router;
