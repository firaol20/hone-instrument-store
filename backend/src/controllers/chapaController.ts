import crypto from 'crypto';
import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import Customer from '../models/Customer';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import {
  chapaInitialize,
  chapaVerify,
  parseChapaVerificationResult,
} from '../services/chapaService';
import { fulfillOrder } from '../services/orderService';

function formatChapaAmount(total: number): string {
  const n = Math.max(0, Math.round(total * 100) / 100);
  return n.toFixed(2);
}

async function assertCustomerOrder(orderId: string, userId: string) {
  const customer = await Customer.findOne({ userId });
  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }
  if (order.customerId.toString() !== customer._id.toString()) {
    throw new ApiError(403, 'Forbidden');
  }
  return { order, customer };
}

async function finalizeOrderFromChapa(orderId: string, txRef: string) {
  const verifyRaw = await chapaVerify(txRef);
  const parsed = parseChapaVerificationResult(verifyRaw);

  if (!parsed.success) {
    return { ok: false as const, message: 'Payment not completed or verification failed' };
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return { ok: false as const, message: 'Order not found' };
  }

  if (order.status === 'paid') {
    const populated = await Order.findById(orderId).populate('items.productId');
    return { ok: true as const, order: populated, alreadyPaid: true };
  }

  if (order.chapaTxRef && order.chapaTxRef !== txRef) {
    return { ok: false as const, message: 'Transaction does not match this order' };
  }

  const expectedCurrency = (process.env.CHAPA_CURRENCY || 'ETB').toUpperCase();
  if (parsed.currency && parsed.currency !== expectedCurrency) {
    return { ok: false as const, message: 'Currency mismatch' };
  }

  if (parsed.amount != null && Math.abs(parsed.amount - order.total) > 1.5) {
    return { ok: false as const, message: 'Amount mismatch' };
  }

  const paymentId = parsed.chapaReference || txRef;
  try {
    const updated = await fulfillOrder(orderId, paymentId);
    return { ok: true as const, order: updated };
  } catch (err: any) {
    return { ok: false as const, message: err.message || 'Could not finalize order' };
  }
}

export const initializeChapaPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.body as { orderId?: string };
    if (!orderId) {
      throw new ApiError(400, 'Order ID is required');
    }

    const { order, customer } = await assertCustomerOrder(orderId, req.userId!);

    if (order.status !== 'pending') {
      throw new ApiError(400, 'Order is not awaiting payment');
    }

    const user = await User.findById(req.userId).select('email');
    const email = user?.email || 'customer@hone.et';
    const fullName = (customer.name || 'Customer').trim();
    const nameParts = fullName.split(/\s+/);
    const first_name = nameParts[0] || 'Customer';
    const last_name = nameParts.slice(1).join(' ') || 'Hone';

    let phone = (customer.phone || '').replace(/\D/g, '');
    if (phone.startsWith('251')) {
      phone = phone.slice(3);
    }
    if (phone.length < 9) {
      phone = '911234567';
    }
    phone = phone.slice(-9);
    const phone_number = phone.startsWith('0') ? phone : `0${phone}`;

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    const apiPublicUrl = (process.env.API_PUBLIC_URL || 'http://localhost:5000').replace(/\/$/, '');
    const callback_url =
      process.env.CHAPA_CALLBACK_URL || `${apiPublicUrl}/api/payments/chapa/webhook`;
    const return_url = `${frontendUrl}/checkout/chapa/return?orderId=${order._id}`;

    const currency = (process.env.CHAPA_CURRENCY || 'ETB').toUpperCase();
    const amount = formatChapaAmount(order.total);

    const txRef = `hone-${order._id}-${Date.now()}`;
    order.chapaTxRef = txRef;
    await order.save();

    try {
      const chapaRes = await chapaInitialize({
        amount,
        currency,
        email,
        first_name,
        last_name,
        phone_number,
        tx_ref: txRef,
        callback_url,
        return_url,
        customization: {
          title: 'Hone — Order payment',
          description: `Order ${String(order._id).slice(-8)}`,
        },
        meta: { orderId: order._id.toString() },
      });

      const checkoutUrl = chapaRes.data?.checkout_url;
      const st = String(chapaRes.status || '').toLowerCase();
      if (st === 'fail' || st === 'failed' || !checkoutUrl) {
        order.chapaTxRef = undefined;
        await order.save();
        throw new ApiError(
          502,
          typeof chapaRes.message === 'string' ? chapaRes.message : 'Chapa did not return a checkout URL'
        );
      }

      res.json({
        success: true,
        data: {
          checkoutUrl,
          txRef,
        },
      });
    } catch (err: any) {
      order.chapaTxRef = undefined;
      await order.save();
      if (err instanceof ApiError) {
        throw err;
      }
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Chapa initialization failed';
      throw new ApiError(502, typeof msg === 'string' ? msg : 'Chapa initialization failed');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      console.error('Chapa initialize:', error);
      res.status(500).json({ success: false, error: 'Failed to initialize payment' });
    }
  }
};

export const chapaWebhook = async (req: Request, res: Response) => {
  try {
    /** Dashboard “Secret hash” → use CHAPA_WEBHOOK_SECRET; falls back to API key if unset */
    const webhookSecret =
      (process.env.CHAPA_WEBHOOK_SECRET || process.env.CHAPA_SECRET_KEY || '').trim();
    const sig = (req.headers['x-chapa-signature'] || req.headers['chapa-signature']) as
      | string
      | undefined;

    if (webhookSecret && sig) {
      const payload = req.rawBody?.length ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
      const expected = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex').toLowerCase();
      const received = String(sig).trim().toLowerCase();
      let match = false;
      if (expected.length === received.length) {
        try {
          match = crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(received, 'utf8'));
        } catch {
          match = false;
        }
      }
      if (!match) {
        return res.status(401).json({ success: false, error: 'Invalid signature' });
      }
    }

    const body = req.body as Record<string, unknown>;
    const txRef = (body.tx_ref || body.reference) as string | undefined;
    if (!txRef || typeof txRef !== 'string') {
      return res.status(200).json({ received: true });
    }

    const order = await Order.findOne({ chapaTxRef: txRef });
    if (!order) {
      return res.status(200).json({ received: true });
    }

    const result = await finalizeOrderFromChapa(order._id.toString(), txRef);
    if (!result.ok) {
      console.warn('Chapa webhook finalize:', result.message);
    }

    return res.status(200).json({ received: true });
  } catch (e) {
    console.error('Chapa webhook error', e);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};

export const verifyChapaPayment = async (req: AuthRequest, res: Response) => {
  try {
    const orderId = req.query.orderId as string;
    if (!orderId) {
      throw new ApiError(400, 'orderId is required');
    }

    const { order } = await assertCustomerOrder(orderId, req.userId!);

    if (order.status === 'paid') {
      const populated = await Order.findById(orderId).populate('items.productId');
      return res.json({ success: true, data: { order: populated, status: 'paid' } });
    }

    if (!order.chapaTxRef) {
      throw new ApiError(400, 'No active Chapa session for this order');
    }

    const result = await finalizeOrderFromChapa(orderId, order.chapaTxRef);
    if (!result.ok) {
      throw new ApiError(400, result.message);
    }

    res.json({
      success: true,
      data: { order: result.order, status: 'paid' },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      console.error('Chapa verify:', error);
      res.status(500).json({ success: false, error: 'Verification failed' });
    }
  }
};
