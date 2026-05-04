import express from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = express.Router();

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Limit each IP to 10 login requests per windowMs
  message: { success: false, error: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5, // Limit each IP to 5 signup requests per windowMs
  message: { success: false, error: 'Too many accounts created from this IP, please try again after an hour' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,
  message: { success: false, error: 'Too many password reset requests, please try again after an hour' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// Validation schemas
const signupValidation = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  validate
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  validate
];

const resetPasswordValidation = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validate
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
  validate
];

// Routes
router.post('/signup', signupLimiter, signupValidation, authController.signup);
router.post('/login', loginLimiter, loginValidation, authController.login);
router.post('/google', loginLimiter, authController.googleAuth);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, changePasswordValidation, authController.changePassword);
router.post('/forgot-password', passwordResetLimiter, forgotPasswordValidation, authController.forgotPassword);
router.post('/reset-password/:token', passwordResetLimiter, resetPasswordValidation, authController.resetPassword);

export default router;
