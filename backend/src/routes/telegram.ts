import express from 'express';
import { authenticate } from '../middleware/auth';
import * as telegramController from '../controllers/telegramController';

const router = express.Router();

// Webhook endpoint for Telegram updates
router.post('/webhook', telegramController.handleWebhook);

// Set webhook URL (admin only)
router.post('/set-webhook', authenticate, telegramController.setWebhook);

// Link Telegram account to user
router.post('/link-account', authenticate, telegramController.linkTelegramAccount);

export default router;
