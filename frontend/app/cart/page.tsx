"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Plus, Minus, ShoppingBag, ArrowRight, Trash2,
  ShieldCheck, Loader2, ChevronLeft, Copy, Check, MapPin,
  Search, CreditCard, Truck
} from "lucide-react";
import { Header } from "@/components/Header";
import { useCartStore } from "@/lib/cart-store";
import { ordersAPI, customersAPI } from "@/lib/api";
import { toast } from "sonner";

import { ProductCard } from "@/components/ProductCard";

const LocationPicker = dynamic(() => import('@/components/LocationPicker').then(mod => mod.LocationPicker), {
  ssr: false,
  loading: () => <div className="h-48 bg-slate-50 animate-pulse rounded-2xl flex items-center justify-center text-[8px] font-black uppercase tracking-widest text-slate-300">Syncing Map...</div>
});

export default function CartPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [exactLocation, setExactLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
    if (token) loadCustomer();
  }, []);

  const loadCustomer = async () => {
    try {
      const response = await customersAPI.getProfile();
      setCustomer(response.data.data);
    } catch (error: any) {
      if (error.response?.status === 401) setIsLoggedIn(false);
    }
  };

  const handleCopyPhone = (id: string) => {
    navigator.clipboard.writeText("+251982616263");
    setCopiedId(id);
    toast.success("Phone number copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      toast.error("Login required");
      router.push("/login?redirect=/cart");
      return;
    }
    router.push(`/checkout`);
  };

  const total = getTotalPrice();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        {/* Navigation & Title */}
        <div className="mb-10 border-b border-slate-50 pb-6">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => router.push('/')} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-950 transition-colors">
              <ChevronLeft size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
            </button>
            {items.length > 0 && (
              <button onClick={() => clearCart()} className="text-[8px] font-black text-slate-300 hover:text-red-500 uppercase tracking-widest transition-colors">
                Clear All
              </button>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic leading-none">
            Cart <span className="text-orange-600">Review.</span>
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="py-20 text-center border border-slate-50 rounded-[2rem]">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Registry is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left: Product Grid (2 columns on mobile) */}
            <div className="lg:col-span-7 space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {items.map((item) => (
                  <ProductCard
                    key={item.productId}
                    id={item.productId}
                    name={item.name}
                    slug={item.slug || ""}
                    price={item.price}
                    image={item.image || "/placeholder.jpg"}
                    category={item.category || "Instrument"}
                    showAddToCart={false}
                    actions={
                      <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center bg-slate-900 text-white rounded-lg p-0.5 gap-1">
                            <button onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))} className="w-5 h-5 flex items-center justify-center hover:bg-slate-800 rounded-md transition-colors"><Minus size={8} /></button>
                            <span className="w-4 text-center text-[9px] font-black">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-5 h-5 flex items-center justify-center hover:bg-slate-800 rounded-md transition-colors"><Plus size={8} /></button>
                          </div>
                          <button onClick={() => removeItem(item.productId)} className="text-slate-300 hover:text-red-500 transition-colors p-2 -mr-2">
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Subtotal</span>
                          <p className="text-[9px] font-black text-slate-950">
                            {item.price === 0 ? "—" : `ETB ${(item.price * item.quantity).toLocaleString()}`}
                          </p>
                        </div>
                      </div>
                    }
                  />
                ))}
              </div>

              {/* Protocol / Steps Section */}
              <div className="bg-slate-50 rounded-3xl p-6 md:p-8 border border-orange-100">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600 mb-6">Procurement Protocol</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { icon: <Search size={14} />, title: "Verify Selection", desc: "Review your items and quantities." },
                    { icon: <MapPin size={14} />, title: "Pin Location", desc: "Mark your exact delivery coordinates." },
                    { icon: <Truck size={14} />, title: "Deploy Fleet", desc: "Order is dispatched for doorstep delivery." }
                  ].map((step, i) => (
                    <div key={i} className="space-y-2">
                      <div className="text-orange-600 font-black flex items-center gap-2">
                        <span className="text-[10px]">0{i + 1}</span>
                        {step.icon}
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-tight">{step.title}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Summary Console */}
            <div className="lg:col-span-5 lg:sticky lg:top-8">
              <div className="bg-slate-950 rounded-[2rem] p-8 text-white shadow-xl shadow-slate-100">
                <h2 className="text-lg font-black uppercase italic tracking-tighter mb-6 border-b border-white/5 pb-4 text-orange-500">Order Summary</h2>

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                    <span>Subtotal</span>
                    <span>ETB {total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                    <span>Logistics</span>
                    <span className="text-emerald-500">Free</span>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Total</span>
                    <span className="text-2xl font-black italic tracking-tighter">ETB {total.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={loading || total === 0}
                  className="w-full py-4 bg-white text-slate-950 hover:bg-orange-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <>Execute Checkout <ArrowRight size={14} /></>}
                </button>

                <div className="mt-6 flex items-center justify-center gap-2 text-slate-600">
                  <ShieldCheck size={12} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Secured via Hone Cloud</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}