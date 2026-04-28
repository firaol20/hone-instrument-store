import { Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Customer from '../models/Customer';
import { AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import { sendEmail } from '../utils/sendEmail';

const generateAuthTokens = (userId: string, role: string) => {
  const token = jwt.sign(
    { userId, role },
    (process.env.JWT_SECRET || 'secret') as jwt.Secret,
    { expiresIn: (process.env.JWT_EXPIRY || '30d') } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { userId },
    (process.env.JWT_REFRESH_SECRET || 'refresh-secret') as jwt.Secret,
    { expiresIn: (process.env.JWT_REFRESH_EXPIRY || '365d') } as jwt.SignOptions
  );

  return { token, refreshToken };
};

export const signup = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      throw new ApiError(400, 'Email, password, and name are required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    // Create user
    const user = new User({
      email,
      password,
      role: 'user',
    });

    await user.save();

    // Create customer profile
    const customer = new Customer({
      userId: user._id,
      name,
      phone: '',
      addresses: [],
    });

    await customer.save();

    const { token, refreshToken } = generateAuthTokens(String(user._id), user.role);

    res.status(201).json({
      success: true,
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Signup failed' });
    }
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const { token, refreshToken } = generateAuthTokens(String(user._id), user.role);

    res.json({
      success: true,
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Login failed' });
    }
  }
};

export const refreshToken = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token is required');
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret') as {
      userId: string;
    };

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      (process.env.JWT_SECRET || 'secret') as jwt.Secret,
      { expiresIn: (process.env.JWT_EXPIRY || '30d') } as jwt.SignOptions
    );

    res.json({
      success: true,
      data: {
        token,
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid refresh token' });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

export const googleAuth = async (req: AuthRequest, res: Response) => {
  try {
    const { idToken } = req.body;
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!idToken) {
      throw new ApiError(400, 'Google ID token is required');
    }

    if (!googleClientId) {
      throw new ApiError(500, 'GOOGLE_CLIENT_ID is not configured on the server');
    }

    const tokenInfoResponse = await axios.get(
      'https://oauth2.googleapis.com/tokeninfo',
      {
        params: { id_token: idToken },
      }
    );

    const payload = tokenInfoResponse.data as {
      aud?: string;
      exp?: string;
      email?: string;
      email_verified?: string | boolean;
      name?: string;
      given_name?: string;
    };

    if (payload.aud !== googleClientId) {
      throw new ApiError(401, 'Invalid Google token audience');
    }

    if (payload.exp && Number(payload.exp) * 1000 < Date.now()) {
      throw new ApiError(401, 'Google token has expired');
    }

    const email = payload.email?.toLowerCase();
    const emailVerified =
      payload.email_verified === true || payload.email_verified === 'true';

    if (!email || !emailVerified) {
      throw new ApiError(401, 'Google account email is not verified');
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        password: crypto.randomBytes(24).toString('hex'),
        role: 'user',
      });
      await user.save();
    }

    const customerName =
      payload.name || payload.given_name || email.split('@')[0];

    const existingCustomer = await Customer.findOne({ userId: user._id });
    if (!existingCustomer) {
      await Customer.create({
        userId: user._id,
        name: customerName,
        phone: '',
        addresses: [],
      });
    }

    const { token, refreshToken } = generateAuthTokens(String(user._id), user.role);

    res.json({
      success: true,
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
      return;
    }

    res.status(401).json({ success: false, error: 'Google authentication failed' });
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) throw new ApiError(400, 'Email is required');

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, 'User not found');

    // Create reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Ensure frontend URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const message = `You requested a password reset. Please go to this link to reset your password:\n\n${resetUrl}\n\nIf you didn't request this, please ignore this email.`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        text: message,
      });

      res.status(200).json({ success: true, data: 'Reset link sent to your email' });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      throw new ApiError(500, 'Email could not be sent');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Forgot password failed' });
    }
  }
};

export const resetPassword = async (req: AuthRequest, res: Response) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      throw new ApiError(400, 'Invalid or expired password reset token');
    }

    const { password } = req.body;
    if (!password) {
      throw new ApiError(400, 'Password is required');
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, data: 'Password updated successfully' });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Reset password failed' });
    }
  }
};
