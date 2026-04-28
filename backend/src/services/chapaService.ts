import axios from 'axios';

const CHAPA_BASE = 'https://api.chapa.co/v1';

export interface ChapaInitializePayload {
  amount: string;
  currency: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  tx_ref: string;
  callback_url: string;
  return_url: string;
  customization?: { title?: string; description?: string; logo?: string };
  meta?: Record<string, unknown>;
}

export async function chapaInitialize(payload: ChapaInitializePayload) {
  const secret = process.env.CHAPA_SECRET_KEY;
  if (!secret) {
    throw new Error('CHAPA_SECRET_KEY is not configured');
  }
  const { data } = await axios.post(`${CHAPA_BASE}/transaction/initialize`, payload, {
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });
  return data as {
    message?: string;
    status?: string;
    data?: { checkout_url?: string; tx_ref?: string };
  };
}

export async function chapaVerify(txRef: string) {
  const secret = process.env.CHAPA_SECRET_KEY;
  if (!secret) {
    throw new Error('CHAPA_SECRET_KEY is not configured');
  }
  const { data } = await axios.get(`${CHAPA_BASE}/transaction/verify/${encodeURIComponent(txRef)}`, {
    headers: { Authorization: `Bearer ${secret}` },
    timeout: 30000,
  });
  return data;
}

/** Normalize Chapa verify / webhook payload for success + amount checks */
export function parseChapaVerificationResult(raw: any): {
  success: boolean;
  txRef?: string;
  chapaReference?: string;
  amount?: number;
  currency?: string;
} {
  const inner = raw?.data ?? raw;
  const outerOk = String(raw?.status ?? '').toLowerCase() === 'success';
  const innerOk = String(inner?.status ?? '').toLowerCase() === 'success';
  const success = outerOk || innerOk;
  const amountStr = inner?.amount ?? raw?.data?.amount ?? raw?.amount;
  const amount = amountStr != null ? parseFloat(String(amountStr)) : undefined;
  return {
    success,
    txRef: inner?.tx_ref ?? raw?.data?.tx_ref ?? raw?.tx_ref,
    chapaReference:
      inner?.reference ?? raw?.data?.reference ?? raw?.reference ?? inner?.chapa_reference,
    amount,
    currency: String(inner?.currency ?? raw?.data?.currency ?? raw?.currency ?? '')
      .toUpperCase()
      .trim() || undefined,
  };
}
