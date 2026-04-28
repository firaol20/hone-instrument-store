'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { paymentsAPI } from '@/lib/api';
import { Loader2, CheckCircle2, XCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ChapaReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Confirming your payment…');
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (!orderId) {
      setStatus('failed');
      setMessage('Missing order. Return to checkout and try again.');
      return;
    }

    let cancelled = false;

    (async () => {
      const tryVerify = async () => {
        await paymentsAPI.chapaVerify(orderId);
        if (!cancelled) {
          setStatus('success');
          setMessage('Payment verified! Redirecting to success page...');
          setTimeout(() => {
            if (!cancelled) {
              router.replace(`/checkout/success?orderId=${orderId}`);
            }
          }, 2000);
        }
      };
      try {
        await tryVerify();
      } catch (first: any) {
        if (cancelled) return;
        // Wait a bit and retry once more
        await new Promise((r) => setTimeout(r, 3000));
        if (cancelled) return;
        try {
          await tryVerify();
        } catch (e: any) {
          if (!cancelled) {
            setStatus('failed');
            setMessage(
              e.response?.data?.error ||
                first.response?.data?.error ||
                'We could not confirm payment yet. If you completed payment, wait a minute and check your orders.'
            );
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200 border border-slate-50 text-center">
          <AnimatePresence mode="wait">
            {status === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="space-y-8"
              >
                <div className="relative mx-auto w-24 h-24">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 border-4 border-slate-100 border-t-orange-500 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck className="w-10 h-10 text-orange-500" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h1 className="text-2xl font-black tracking-tight text-slate-800">Confirming Payment</h1>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Please don&apos;t close this window. We are securely verifying your transaction with Chapa.
                  </p>
                </div>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="mx-auto w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  </motion.div>
                </div>
                <div className="space-y-4">
                  <h1 className="text-2xl font-black tracking-tight text-emerald-900">Success!</h1>
                  <p className="text-emerald-700/70 font-medium leading-relaxed">
                    {message}
                  </p>
                </div>
              </motion.div>
            )}

            {status === 'failed' && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                  <XCircle className="w-12 h-12" />
                </div>
                <div className="space-y-4">
                  <h1 className="text-2xl font-black tracking-tight text-slate-800">Something went wrong</h1>
                  <p className="text-red-600/70 font-medium leading-relaxed bg-red-50 p-4 rounded-2xl border border-red-100">
                    {message}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button asChild size="lg" className="bg-black hover:bg-slate-800 text-white rounded-2xl h-14 font-bold shadow-xl shadow-slate-200">
                    <Link href="/cart" className="flex items-center justify-center gap-2">
                       Try Again <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-2xl h-14 font-bold border-slate-200">
                    <Link href="/account">Go to My Orders</Link>
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function ChapaReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-white">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          </main>
        </div>
      }
    >
      <ChapaReturnContent />
    </Suspense>
  );
}
