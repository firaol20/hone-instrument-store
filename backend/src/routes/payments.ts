import express from 'express';
import { authenticate } from '../middleware/auth';
import * as chapaController from '../controllers/chapaController';

const router = express.Router();

// Chapa (primary checkout)
router.post('/chapa/initialize', authenticate, chapaController.initializeChapaPayment);
router.post('/chapa/webhook', chapaController.chapaWebhook);
router.get('/chapa/verify', authenticate, chapaController.verifyChapaPayment);

export default router;
