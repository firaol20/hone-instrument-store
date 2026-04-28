'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ordersAPI, paymentsAPI, customersAPI } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, MapPin, Phone, Clock, ExternalLink, CreditCard, ShieldCheck, Truck, Check, Search, ArrowRight } from 'lucide-react';
import { HONE_SHOWROOM, getDirectionsUrl } from '@/lib/store-location';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/cart-store';

const LocationPicker = dynamic(
  () => import('@/components/LocationPicker').then((mod) => mod.LocationPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-xs text-slate-500">
        Loading map…
      </div>
    ),
  }
);

function ChapaPayButton({ orderId, amountEtb }: { orderId: string; amountEtb: number }) {
  const [payLoading, setPayLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const startChapa = async () => {
    setPayLoading(true);
    setErrorMessage('');
    try {
      const res = await paymentsAPI.chapaInitialize(orderId);
      const url = res.data?.data?.checkoutUrl;
      if (!url) {
        throw new Error('No checkout URL from server');
      }
      window.location.href = url;
    } catch (e: any) {
      setErrorMessage(e.response?.data?.error || e.message || 'Could not start Chapa checkout');
      setPayLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
        <p className="text-sm text-emerald-800">
          You will be redirected to <strong>Chapa</strong> to complete payment in ETB (Telebirr, cards, bank transfer,
          and other local methods).
        </p>
      </div>
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
        >
          {errorMessage}
        </motion.div>
      )}
      <Button
        type="button"
        size="lg"
        className="w-full bg-emerald-600 hover:bg-emerald-700 h-14 text-lg font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
        onClick={startChapa}
        disabled={payLoading}
      >
        {payLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
            Connecting to Chapa…
          </>
        ) : (
          `Pay ETB ${amountEtb.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        )}
      </Button>
      <div className="flex items-center justify-center gap-4 grayscale opacity-50">
        <div className="h-6 w-10 bg-gray-200 rounded" />
        <div className="h-6 w-10 bg-gray-200 rounded" />
        <div className="h-6 w-10 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

type DeliveryChoice = 'free_delivery' | 'pickup';

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deliveryOption, setDeliveryOption] = useState<DeliveryChoice>('free_delivery');
  const [searchQuery, setSearchQuery] = useState('');
  const [formattedAddress, setFormattedAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [geoToken, setGeoToken] = useState(0);
  const [step, setStep] = useState(1);
  const { items, getTotalPrice, clearCart } = useCartStore();
  const subtotal = getTotalPrice();
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0 && step === 1) {
      router.push('/cart');
      return;
    }

    const loadCustomer = async () => {
      try {
        const response = await customersAPI.getProfile();
        const addrs = response.data?.data?.addresses;
        if (addrs && addrs.length > 0) {
          setFormattedAddress(addrs[0].street || '');
          setSearchQuery(addrs[0].street || '');
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          router.push('/login?redirect=/checkout');
        }
      } finally {
        setLoading(false);
      }
    };
    loadCustomer();
  }, [router, items.length, step]);

  const handleDeliveryChange = (value: string) => {
    const v = value as DeliveryChoice;
    const prev = deliveryOption;
    setDeliveryOption(v);
    if (v === 'free_delivery' && prev === 'pickup') {
      if (typeof window !== 'undefined' && window.confirm('May we use your current location to find you?')) {
        setGeoToken((t) => t + 1);
      }
    }
  };

  const shippingFees: Record<string, number> = {
    free_delivery: 0,
    pickup: 0,
    standard: 10,
    express: 25,
  };

  const shippingFee = shippingFees[deliveryOption] ?? 0;
  const total = subtotal + shippingFee;

  const canProceed =
    deliveryOption === 'pickup' ||
    (deliveryOption === 'free_delivery' &&
      coords !== null &&
      typeof coords.lat === 'number' &&
      typeof coords.lng === 'number' &&
      !Number.isNaN(coords.lat) &&
      !Number.isNaN(coords.lng));

  const handleProceedToPayment = async () => {
    if (!canProceed || items.length === 0 || deliveryOption === 'pickup') return;
    try {
      setLoading(true);

      const address = {
        type: 'home' as const,
        street: formattedAddress || searchQuery || 'Delivery location',
        city: 'Addis Ababa',
        state: 'Addis Ababa',
        zip: '1000',
        country: 'ET',
        coordinates: coords!,
        mapUrl: `https://www.google.com/maps?q=${coords!.lat},${coords!.lng}`,
        deliveryInstructions: deliveryInstructions.trim() || undefined,
      };

      const notes = deliveryInstructions.trim() ? `Driver notes: ${deliveryInstructions.trim()}` : undefined;

      const orderData = {
        items: items.map(item => ({ productId: item.productId, quantity: item.quantity })),
        address,
        deliveryOption,
        notes,
      };

      const res = await ordersAPI.create(orderData);
      setCreatedOrderId(res.data.data._id);
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Failed to proceed:', error);
      toast.error(error.response?.data?.error || 'Could not continue to payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl"
            >
              💳
            </motion.div>
            <p className="mt-6 text-slate-500 font-medium animate-pulse">Initializing secure checkout...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 lg:py-12">


        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div key="step1" className="mb-10 border-b border-slate-50 pb-6">
                <div className="flex items-center justify-between mb-2">
                  <Link href="/cart" className="flex items-center gap-1.5 text-slate-400 hover:text-orange-600 transition-colors">
                    <ArrowLeft size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Back to cart</span>
                  </Link>
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic leading-none">
                  Checkout <span className="text-orange-600">.</span>
                </h1>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-8">
                  <Card className="border-none shadow-none rounded-3xl bg-slate-50 overflow-hidden">
                    <CardHeader className="pb-4 px-6 md:px-8 pt-8 md:pt-10">
                      <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600 mb-4">Step 1 of 2</CardTitle>
                      <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">Delivery details</h2>
                    </CardHeader>
                    <CardContent className="px-6 md:px-8 pb-8 md:pb-10 space-y-8">
                      <RadioGroup
                        value={deliveryOption}
                        onValueChange={handleDeliveryChange}
                        className="grid gap-4 sm:grid-cols-2"
                      >
                        <label
                          className={`flex flex-col items-start gap-4 rounded-2xl border-2 p-5 cursor-pointer transition-all duration-300 ${deliveryOption === 'free_delivery'
                            ? 'border-orange-500 bg-orange-50/50 ring-4 ring-orange-500/10'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                        >
                          <div className="flex justify-between w-full items-start">
                            <div className={`p-2.5 rounded-xl ${deliveryOption === 'free_delivery' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                              <Truck className="w-5 h-5" />
                            </div>
                            <RadioGroupItem value="free_delivery" id="free_delivery" className="sr-only" />
                            {deliveryOption === 'free_delivery' && (
                              <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-black text-lg block">Free Delivery</span>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                              Deliver directly to your pin location.
                            </p>
                          </div>
                        </label>

                        <label
                          className={`flex flex-col items-start gap-4 rounded-2xl border-2 p-5 cursor-pointer transition-all duration-300 ${deliveryOption === 'pickup'
                            ? 'border-orange-500 bg-orange-50/50 ring-4 ring-orange-500/10'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                        >
                          <div className="flex justify-between w-full items-start">
                            <div className={`p-2.5 rounded-xl ${deliveryOption === 'pickup' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                              <MapPin className="w-5 h-5" />
                            </div>
                            <RadioGroupItem value="pickup" id="pickup" className="sr-only" />
                            {deliveryOption === 'pickup' && (
                              <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-black text-lg block">Pickup</span>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                              Pick up at our showroom.
                            </p>
                          </div>
                        </label>
                      </RadioGroup>

                      <AnimatePresence mode="wait">
                        {deliveryOption === 'free_delivery' && (
                          <motion.div
                            key="delivery-fields"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden space-y-6"
                          >
                            <Separator className="bg-slate-200" />

                            <div className="rounded-[2rem] border-2 border-slate-100 shadow-sm relative">
                              <LocationPicker
                                mode="deliver"
                                address={searchQuery}
                                geoRequestToken={geoToken}
                                onLocationSelect={(c) => setCoords(c)}
                                onAddressSelect={(line) => {
                                  setFormattedAddress(line);
                                  setSearchQuery(line);
                                }}
                              />
                            </div>

                            {!canProceed && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs font-bold flex items-center gap-3"
                              >
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                Please pin your delivery location on the map.
                              </motion.div>
                            )}
                          </motion.div>
                        )}

                        {deliveryOption === 'pickup' && (
                          <motion.div
                            key="pickup-fields"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden space-y-6"
                          >
                            <Separator className="bg-slate-200" />

                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="p-5 rounded-2xl bg-white border border-slate-100 flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
                                  <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Call</span>
                                  <a href={`tel:${HONE_SHOWROOM.phoneTel}`} className="font-black text-slate-800 hover:text-orange-600">{HONE_SHOWROOM.phone}</a>
                                </div>
                              </div>
                              <div className="p-5 rounded-2xl bg-white border border-slate-100 flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
                                  <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Ready</span>
                                  <span className="font-black text-slate-600">Anytime</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-6">
                                <div className="p-3 rounded-xl bg-white text-orange-600 shadow-sm border border-slate-100">
                                  <MapPin className="w-6 h-6" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Showroom</span>
                                  <p className="font-black text-slate-800">
                                    {HONE_SHOWROOM.name}
                                    <br />
                                    <span className="text-sm font-medium text-slate-500">{HONE_SHOWROOM.street}, {HONE_SHOWROOM.city}</span>
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="rounded-lg font-black text-xs bg-white border-slate-200 hover:bg-black hover:text-indigo-400"
                                  onClick={() => window.open(getDirectionsUrl(HONE_SHOWROOM.lat, HONE_SHOWROOM.lng), '_blank')}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2 text-black hover:text-indigo-400" />
                                  Get Directions
                                </Button>
                              </div>

                              <div className="rounded-xl overflow-hidden border-2 border-white h-[250px]">
                                <LocationPicker mode="pickup" onLocationSelect={() => { }} />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                          variant="ghost"
                          onClick={() => router.push('/cart')}
                          className="h-12 rounded-xl font-black text-slate-400 hover:text-black hover:bg-slate-100 text-xs uppercase tracking-widest"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleProceedToPayment}
                          disabled={loading || !canProceed || deliveryOption === 'pickup'}
                          className="flex-1 h-12 rounded-xl text-sm font-black bg-orange-600 hover:bg-orange-700 text-white transition-all duration-300 shadow-lg shadow-orange-200 disabled:opacity-50 active:scale-[0.98]"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              {deliveryOption === 'pickup' ? 'Checkout Disabled for Pickup' : 'Continue to Payment'}
                              {deliveryOption !== 'pickup' && <ArrowRight className="w-4 h-4 ml-2" />}
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-5 lg:sticky lg:top-8">
                  <div className="bg-slate-950 rounded-[2rem] p-8 text-white shadow-xl">
                    <h2 className="text-lg font-black uppercase italic tracking-tighter mb-6 border-b border-white/5 pb-4 text-orange-500">Order Summary</h2>

                    <div className="space-y-3 mb-8">
                      {items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-xs font-medium">
                          <span className="text-slate-400">{item.name || 'Product'} × {item.quantity}</span>
                          <span className="font-black">ETB {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                        <span>Subtotal</span>
                        <span>ETB {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                        <span>Delivery</span>
                        <span className="text-emerald-500">Free</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-between items-end mb-8">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Total</span>
                      <span className="text-2xl font-black italic tracking-tighter">ETB {total.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <ShieldCheck size={12} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Secured Checkout</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="font-black text-slate-400 hover:text-black hover:bg-slate-100 rounded-xl px-6 text-xs uppercase tracking-widest h-12"
              >
                <ArrowLeft className="w-3 h-3 mr-2" />
                Back to Delivery
              </Button>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-8">
                  <Card className="border-none shadow-none rounded-3xl bg-slate-50 overflow-hidden">
                    <CardHeader className="pb-4 px-6 md:px-8 pt-8 md:pt-10">
                      <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-4">Step 2 of 2</CardTitle>
                      <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">Payment</h2>
                    </CardHeader>
                    <CardContent className="px-6 md:px-8 pb-8 md:pb-10 space-y-6">
                      {createdOrderId && <ChapaPayButton orderId={createdOrderId} amountEtb={total} />}
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-5 lg:sticky lg:top-8">
                  <div className="bg-slate-950 rounded-[2rem] p-8 text-white shadow-xl">
                    <h2 className="text-lg font-black uppercase italic tracking-tighter mb-6 border-b border-white/5 pb-4 text-orange-500">Order Summary</h2>

                    <div className="space-y-3 mb-8">
                      {items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-xs font-medium">
                          <span className="text-slate-400">{item.name || 'Product'} × {item.quantity}</span>
                          <span className="font-black">ETB {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                        <span>Subtotal</span>
                        <span>ETB {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                        <span>Delivery</span>
                        <span className="text-emerald-500">Free</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-between items-end mb-8">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Total</span>
                      <span className="text-2xl font-black italic tracking-tighter">ETB {total.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <ShieldCheck size={12} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Secured Checkout</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
