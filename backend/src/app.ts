import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(
  express.json({
    verify: (req: Request, _res: Response, buf: Buffer) => {
      if (req.originalUrl?.includes('/chapa/webhook')) {
        req.rawBody = Buffer.from(buf);
      }
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Server is running' });
});

// API Routes will be mounted here
app.use('/api/auth', require('./routes/auth').default);
app.use('/api/products', require('./routes/products').default);
app.use('/api/categories', require('./routes/categories').default);
app.use('/api/orders', require('./routes/orders').default);
app.use('/api/customers', require('./routes/customers').default);
app.use('/api/payments', require('./routes/payments').default);
app.use('/api/upload', require('./routes/upload').default);
app.use('/api/telegram', require('./routes/telegram').default);
app.use('/api/admin', require('./routes/admin').default);
app.use('/api/admin/promotions', require('./routes/promotionRoutes').default);
app.use('/api/ratings', require('./routes/ratings').default);
app.use('/api/public', require('./routes/public').default);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
