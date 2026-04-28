import express from 'express';
import * as productController from '../controllers/productController';

const router = express.Router();

// Specific routes MUST come before /:id wildcard
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', productController.getProductById);

export default router;
