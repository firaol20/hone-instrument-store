'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { productsAPI } from '@/lib/api';
import { useCartStore } from '@/lib/cart-store';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import { Sparkles, X, Plus, Star, Heart, Grid2X2, LayoutGrid } from 'lucide-react';
import { addToWishlist, isInWishlist, removeFromWishlistById } from "@/components/WishlistButton";
import Image from 'next/image';
import ModernTiltCard from '@/components/TiltCard';

export default function ComparisonDuoPage() {
  const [mode, setMode] = useState<'duo' | 'quad'>('duo');
  const [slots, setSlots] = useState<any[]>([null, null, null, null]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dynamicData, setDynamicData] = useState<Record<string, { desc: string; loading: boolean }>>({});
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const res = await productsAPI.getAll({ limit: 100 });
        setAllProducts(res.data?.data || []);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const generateAIDescription = async (product: any) => {
    if (!product || dynamicData[product._id]?.desc) return;

    setDynamicData((prev: any) => ({
      ...prev,
      [product._id]: { desc: "", loading: true }
    }));


  };

  const handleSelect = (product: any, slotIndex: number) => {
    const newSlots = [...slots];
    newSlots[slotIndex] = product;
    setSlots(newSlots);

    if (product && slotIndex === 0) {
      setSlots([product, null, null, null]);
    }

    if (product) generateAIDescription(product);
  };

  const handleWishlist = (product: any) => {
    if (isInWishlist(product._id)) {
      removeFromWishlistById(product._id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '/placeholder.jpg',
        slug: product.slug
      });
      toast.success('Added to wishlist');
    }
    setWishlist((prev: string[]) => {
      if (isInWishlist(product._id)) {
        return prev.filter(id => id !== product._id);
      }
      return [...prev, product._id];
    });
  };

  const getFilteredOptions = (excludeIndices: number[]) => {
    const firstProduct = slots[0];
    if (!firstProduct) return allProducts;

    const excludedIds = excludeIndices.map(i => slots[i]?._id).filter(Boolean);
    return allProducts.filter(p =>
      p.categoryId?._id === firstProduct.categoryId?._id &&
      !excludedIds.includes(p._id)
    );
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "fill-slate-200 text-slate-200"}`} />
    ));
  };

  const getPriceDiff = (price: number, allPrices: number[]) => {
    if (allPrices.length < 2) return null;

    const sorted = [...allPrices].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const range = max - min;

    if (range === 0) return null;

    const ratio = (price - min) / range;

    if (ratio <= 0.33) {
      return { text: 'Cheapest', class: 'bg-green-100 text-green-600' };
    } else if (ratio <= 0.66) {
      return { text: 'Moderate', class: 'bg-yellow-100 text-yellow-600' };
    } else {
      return { text: 'Expensive', class: 'bg-red-100 text-red-600' };
    }
  };

  const renderProductSlot = (product: any, slotIndex: number, options: any[], label: string) => {
    if (!product) {
      return (
        <div key={slotIndex} className="flex-1 border-2 border-dashed border-slate-200 rounded-[2rem] p-4 flex flex-col items-center justify-center min-h-[380px] bg-slate-50/50">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 mb-4">{label}</span>
          <select
            onChange={(e) => handleSelect(allProducts.find(p => p._id === e.target.value) || null, slotIndex)}
            className="w-full max-w-[180px] bg-white border border-slate-200 rounded-xl p-3 text-[10px] font-bold uppercase outline-none focus:ring-2 ring-orange-100"
          >
            <option value="">Select Item</option>
            {options.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
      );
    }

    // const aiInfo = dynamicData[product._id];
    const activeSlots = mode === 'duo' ? slots.slice(0, 2) : slots;
    const allPrices = activeSlots.filter(Boolean).map((s: any) => s.price);
    const priceDiff = getPriceDiff(product.price, allPrices);

    return (
      <div key={slotIndex} className="flex-1 bg-white rounded-[2rem] p-3 md:p-6 border border-slate-100 relative shadow-sm">
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={() => handleWishlist(product)}
            className={`p-2 rounded-full ${wishlist.includes(product._id) ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400 hover:text-red-500'}`}
          >
            <Heart className={`w-4 h-4 ${wishlist.includes(product._id) ? 'fill-white' : ''}`} />
          </button>
          <button
            onClick={() => handleSelect(null, slotIndex)}
            className="p-2 bg-slate-100 text-slate-400 hover:text-red-500 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <ModernTiltCard className="aspect-square relative mb-4 bg-slate-50 rounded-2xl p-2 cursor-pointer block group">
          <Image src={product.images?.[0] || '/placeholder.jpg'} alt={product.name} fill className="object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110" />
        </ModernTiltCard>

        <h2 className="text-sm md:text-xl font-black uppercase tracking-tighter leading-tight mb-1">{product.name}</h2>
        <p className="text-orange-600 font-black text-xs md:text-sm mb-2">ETB {product.price.toLocaleString()}</p>

        {priceDiff && (
          <div className={`inline-block px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-wider mb-3 ${priceDiff.class}`}>
            {priceDiff.text}
          </div>
        )}

        {product.rating && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">{getRatingStars(product.rating.averageRating)}</div>
            <span className="text-[9px] font-bold text-slate-400">({product.rating.totalRatings})</span>
          </div>
        )}
        {/* AI Insight - Description */}
        {/* <div className="mb-4 min-h-[60px]">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-3 h-3 ${aiInfo?.loading ? 'animate-pulse text-orange-500' : 'text-slate-400'}`} />
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
              {aiInfo?.loading ? 'Analyzing real-world data...' : 'Detailed AI Insight'}
            </span>
          </div>
          {aiInfo?.loading ? (
            <div className="space-y-2">
              <div className="h-1.5 w-full bg-slate-100 animate-pulse rounded-full" />
              <div className="h-1.5 w-full bg-slate-100 animate-pulse rounded-full" />
              <div className="h-1.5 w-4/6 bg-slate-100 animate-pulse rounded-full" />
            </div>
          ) : (
            <div className="text-[10px] md:text-[11px] leading-relaxed text-slate-600 italic max-h-[250px] overflow-y-auto pr-2 whitespace-pre-wrap custom-scrollbar">
              {aiInfo?.desc}
            </div>
          )}
        </div> */}

        <Button
          onClick={() => addItem({
            productId: product._id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            quantity: 1,
            image: product.images?.[0] || '/placeholder.jpg',
            category: product.categoryId?.name || 'Instrument',
            sku: product.sku || "",
          })}
          className="w-full h-10 bg-slate-950 hover:bg-orange-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest"
        >
          Add to Cart <Plus className="w-3 h-3 ml-1" />
        </Button>
      </div>
    );
  };

  const renderSpecsTable = () => {
    const activeSlots = mode === 'duo' ? slots.slice(0, 2) : slots;
    const activeProducts = activeSlots.filter(Boolean);
    if (activeProducts.length < 2) return null;

    const allKeys = Array.from(new Set(activeProducts.flatMap(p => Object.keys(p.specs || {}))));

    return (
      <div className="mt-6 bg-white rounded-[2rem] p-4 md:p-8 border border-slate-100 shadow-sm">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6 text-center">Technical Breakdown</h3>
        <div className="divide-y divide-slate-50">
          {allKeys.map(key => (
            <div key={key} className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-8 py-4">
              {activeProducts.map((product, idx) => (
                <div key={idx} className={`text-center px-1 ${idx > 0 ? 'border-l border-slate-100' : ''}`}>
                  <span className="block text-[7px] uppercase text-slate-300 mb-1 tracking-widest">{key}</span>
                  <span className="text-[10px] md:text-xs font-bold text-slate-900">{product.specs?.[key] || '—'}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const activeSlots = mode === 'duo' ? slots.slice(0, 2) : slots;
  const activeOptions = mode === 'duo'
    ? [allProducts, getFilteredOptions([0])]
    : [allProducts, getFilteredOptions([0]), getFilteredOptions([0, 1]), getFilteredOptions([0, 1, 2])];

  return (
    <div className="min-h-screen bg-slate-50/30">
      <Header />
      <main className="max-w-7xl mx-auto px-2 py-6 md:px-8 md:py-12">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center">
            <h1 className="text-2xl md:text-5xl font-black uppercase tracking-tighter mb-1">Compare<span className="text-orange-600">.</span></h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">which one is best for you?</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('duo')}
              className={`p-3 rounded-xl ${mode === 'duo' ? 'bg-slate-950 text-white' : 'bg-white text-slate-500'}`}
              title="Duo View"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMode('quad')}
              className={`p-3 rounded-xl ${mode === 'quad' ? 'bg-slate-950 text-white' : 'bg-white text-slate-500'}`}
              title="Quad View"
            >
              <Grid2X2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-row gap-2 md:gap-6 items-start flex-wrap">
          {activeSlots.map((product, idx) =>
            renderProductSlot(product, idx, activeOptions[idx], idx === 0 ? "First Choice" : `Slot ${idx + 1}`)
          )}
        </div>

        {renderSpecsTable()}
      </main>
    </div>
  );
}