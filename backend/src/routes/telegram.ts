import express from 'express';
import { authenticate } from '../middleware/auth';
import * as telegramController from '../controllers/telegramController';

const router = express.Router();

// Webhook endpoint for Telegram updates (Main bot)
router.post('/webhook', telegramController.handleWebhook);

// Set webhook URL (admin only)
router.post('/set-webhook', authenticate, telegramController.setWebhook);

// Webhook endpoint for Order bot
router.post('/order-webhook', telegramController.handleOrderWebhook);

// Set webhook URL for Order bot (admin only)
router.post('/set-order-webhook', authenticate, telegramController.setOrderWebhook);

// Link Telegram account to user
router.post('/link-account', authenticate, telegramController.linkTelegramAccount);

export default router;
