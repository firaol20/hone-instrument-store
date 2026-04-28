'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ordersAPI } from '@/lib/api';
import { CheckCircle2, Package, Truck, MapPin, Receipt, ArrowRight, ShoppingBag, Calendar, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useCartStore } from '@/lib/cart-store';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCartStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (!orderId) {
      router.push('/');
      return;
    }
    loadOrder(orderId);
    clearCart();
  }, [searchParams, router, clearCart]);

  const loadOrder = async (orderId: string) => {
    try {
      const response = await ordersAPI.getById(orderId);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
             <motion.div
               animate={{ scale: [1, 1.2, 1] }}
               transition={{ repeat: Infinity, duration: 1.5 }}
               className="text-6xl"
             >
               🎉
             </motion.div>
             <p className="text-slate-500 font-bold animate-pulse">Finalizing your order...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm px-6">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <ShoppingBag className="w-10 h-10 text-slate-400" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 mb-2">Order Not Found</h1>
            <p className="text-slate-500 font-medium mb-8">We couldn&apos;t retrieve your order details. Please check your account.</p>
            <Button asChild className="w-full h-14 rounded-2xl bg-black font-bold">
               <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const getDeliveryInfo = (option: string) => {
    const info: Record<string, { time: string; icon: any; color: string }> = {
      standard: { time: '5-7 business days', icon: Truck, color: 'text-blue-500' },
      express: { time: '2-3 business days', icon: Package, color: 'text-orange-500' },
      pickup: { time: 'Available today', icon: MapPin, color: 'text-emerald-500' },
      free_delivery: { time: 'Ready for delivery', icon: Truck, color: 'text-orange-500' },
    };
    return info[option] || info.standard;
  };

  const deliveryInfo = getDeliveryInfo(order.deliveryOption);
  const DeliveryIcon = deliveryInfo.icon;

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      <Header />

      <main className="flex-1 pb-16">
        {/* Celebratory Hero */}
        <div className="bg-black text-white py-16 md:py-24 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500 blur-[120px] rounded-full" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 blur-[120px] rounded-full" />
           </div>
           
           <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 100 }}
                className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8"
              >
                 <CheckCircle2 className="w-10 h-10 text-orange-400" />
              </motion.div>
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-black tracking-tighter mb-4"
              >
                Thank you for your order!
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl text-white/60 font-medium max-w-2xl mx-auto"
              >
                Order <span className="font-mono text-white">#{order._id.toString().slice(-12).toUpperCase()}</span> is confirmed and being processed.
              </motion.p>
           </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-20">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Quick Actions */}
            <motion.div variants={item} className="md:col-span-2 flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="flex-1 h-14 rounded-2xl bg-white text-black border border-slate-200 hover:bg-slate-50 font-bold shadow-sm transition-all active:scale-[0.98]">
                 <Link href="/products" className="flex items-center justify-center gap-2">
                    <ShoppingBag className="w-5 h-5" /> Continue Shopping
                 </Link>
              </Button>
              <Button asChild size="lg" className="flex-1 h-14 rounded-2xl bg-black text-white hover:bg-slate-800 font-bold shadow-xl shadow-slate-200 transition-all active:scale-[0.98]">
                 <Link href="/account" className="flex items-center justify-center gap-2">
                    View Orders <ArrowRight className="w-5 h-5" />
                 </Link>
              </Button>
            </motion.div>

            {/* Order Status Card */}
            <motion.div variants={item}>
              <Card className="h-full border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100/50">
                  <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1 font-bold rounded-lg capitalize">
                        {order.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                      <p className="font-bold text-slate-800">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                     <div className={`p-3 rounded-xl bg-white shadow-sm ${deliveryInfo.color}`}>
                        <DeliveryIcon className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{order.deliveryOption.replace('_', ' ')}</p>
                        <p className="font-bold text-slate-800">{deliveryInfo.time}</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Delivery Address</p>
                        <p className="font-bold text-slate-800 leading-tight">
                          {order.address?.street}<br />
                          <span className="text-slate-500 font-medium">
                            {order.address?.city}, {order.address?.state} {order.address?.zip}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Summary Card */}
            <motion.div variants={item}>
              <Card className="h-full border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100/50">
                  <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-slate-400" />
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4 mb-6">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs">
                              {item.quantity}×
                           </div>
                           <p className="font-bold text-slate-800 group-hover:text-black line-clamp-1">{item.productId?.name || 'Product'}</p>
                        </div>
                        <p className="font-bold text-slate-900">ETB {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-6 border-t border-slate-100">
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Subtotal</span>
                      <span className="text-slate-900">ETB {order.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Shipping</span>
                      <span className={order.shippingFee === 0 ? 'text-emerald-600 font-bold' : 'text-slate-900'}>
                        {order.shippingFee === 0 ? 'FREE' : `ETB ${order.shippingFee?.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-end pt-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Paid</span>
                          <span className="text-3xl font-black tracking-tighter text-black">
                            ETB {order.total?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-slate-400 pb-1">ETB {order.total?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split('.')[1]}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Next Steps Info */}
            <motion.div variants={item} className="md:col-span-2">
              <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
                 <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Tag className="w-8 h-8 text-blue-500" />
                 </div>
                 <div className="flex-1 text-center md:text-left">
                    <h3 className="font-black text-slate-800 text-lg">What happens next?</h3>
                    <p className="text-slate-500 font-medium leading-relaxed mt-1">
                      We sent a confirmation receipt to your email. Our team will start preparing your instrument, and you&apos;ll receive another notification when it&apos;s ready for dispatch or pickup.
                    </p>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-white">
          <Header />
          <main className="flex-1 flex items-center justify-center">
             <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-black rounded-full animate-spin mx-auto" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Order</p>
             </div>
          </main>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
