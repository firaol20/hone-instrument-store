"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Script from "next/script";
import {
  ShoppingCart,
  ChevronLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Copy,
  Zap,
  MapPin
} from "lucide-react";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ProductCard";
import { productsAPI, ordersAPI, customersAPI, ratingsAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { useCartStore } from "@/lib/cart-store";
import { toast } from "sonner";
import RatingSummary from "@/components/RatingSummary";
import RatingCard from "@/components/RatingCard";
import RatingForm from "@/components/RatingForm";
import StarRating from "@/components/StarRating";
import { useRatingStore } from "@/lib/rating-store";

// Dynamically import map to avoid "window is not defined" during build
const LocationsMap = dynamic(() => import('@/components/LocationsMap'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-slate-50 animate-pulse rounded-3xl flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Showroom Map...</div>
});

export default function ProductDetailClient() {
  const { slug } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

   // Ratings state
   const [ratings, setRatings] = useState<any[]>([]);
   const [ratingStats, setRatingStats] = useState<any>(null);
   const [ratingsLoading, setRatingsLoading] = useState(false);
   
   const { userRatings, setRating } = useRatingStore();
   const userRating = userRatings[product?._id] || 0;

  // Hone Store Data for Map
  const storeLocations = [
    {
      id: 'hone-megenagna',
      name: 'Hone Musical Instruments',
      city: 'Addis Ababa',
      state: '2nd Floor, Bethelem Building, Megenagna',
      latitude: 9.019865918869868,
      longitude: 38.80055158441099,
    }
  ];

  // Structured Data (JSON-LD) for Product
  const productJsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product?.name || '',
    image: product?.images?.[0] || '',
    description: product?.description || '',
    sku: product?.sku || '',
    brand: {
      '@type': 'Brand',
      name: 'Hone Instruments'
    },
    offers: {
      '@type': 'Offer',
      url: `https://honemusics.com/products/${slug}`,
      priceCurrency: 'ETB',
      price: product?.price || 0,
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock'
    }
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText("+251982616263");
    setCopied(true);
    toast.success("Phone number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      name: product.name,
      slug: slug as string,
      price: product.price,
      image: product.images?.[0] || "/placeholder.jpg",
      quantity: 1,
      sku: product.sku || "",
      category: product.categoryId?.name || "Instrument",
      status: product.status
    });
    toast.success(`${product.name} ${t.addedToCart}`, {
      action: {
        label: t.viewCart,
        onClick: () => router.push("/cart")
      }
    });
  };

  const handleBuyNow = () => {
    // Add to cart first
    addItem({
      productId: product._id,
      name: product.name,
      slug: slug as string,
      price: product.price,
      image: product.images?.[0] || "/placeholder.jpg",
      quantity: 1,
      sku: product.sku || "",
      category: product.categoryId?.name || "Instrument",
      status: product.status
    });
    
    // Show guidance message
    toast.info("Proceed to your cart to complete the order", {
      description: "Item has been added! Please checkout from your cart page.",
      action: {
        label: "Open Cart",
        onClick: () => router.push("/cart")
      }
    });
  };

  const handleRateQuick = async (val: number) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${slug}`);
      return;
    }
    try {
      await setRating(product._id, val);
      toast.success('Rating saved!');
      fetchRatings(product._id);
    } catch {
      toast.error('Failed to save rating');
    }
  };

   const t = {
     back: "Back to Home",
     addToCart: "Cart",
     audioDemo: "Listen to Demo",
     shipping: "Free Shipping",
     warranty: "1 Year Warranty",
     returns: "30-Day Returns",
     callUs: "Call for Price",
     buyNow: "Buy Now",
     relatedProducts: "You May Also Like",
     reviews: "Reviews",
     locationTitle: "Visit our Showroom",
     addedToCart: "added to cart",
     viewCart: "View Cart"
   };

   // Price display: 0 means "Call Us" (price not listed)
   const priceLabel = product?.price === 0
     ? t.callUs
     : `ETB ${product?.price?.toLocaleString()}`;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productsAPI.getBySlug(slug as string);
        const data = response.data?.data || response.data;
        setProduct(data);
      } catch (error) {
        toast.error("Product not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (product?.categoryId?.slug) {
      const fetchRelated = async () => {
        try {
          const res = await productsAPI.getAll({ category: product.categoryId.slug, limit: 10 });
          const data = res.data?.data || res.data || [];
          setRelatedProducts(data.filter((p: any) => p._id !== product._id).slice(0, 4));
        } catch (error) { console.error(error); }
      };
      fetchRelated();
    }
  }, [product]);

  // Fetch ratings whenever product loads
  const fetchRatings = React.useCallback(async (id: string) => {
    setRatingsLoading(true);
    try {
      const res = await ratingsAPI.getProductRatings(id, { limit: 20 });
      setRatings(res.data.data.ratings || []);
      setRatingStats(res.data.data.stats || null);
    } catch { /* silently ignore */ } finally {
      setRatingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (product?._id) {
      fetchRatings(product._id);
    }
  }, [product, fetchRatings]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

   if (!product) return null;
 
  return (
    <div className="min-h-screen bg-white">
      {/* Structured Data (JSON-LD) */}
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">{t.back}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-20">
          {/* GALLERY */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative aspect-square bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100">
              <Image 
                src={product.images?.[activeImage] || "/placeholder.jpg"} 
                alt={product.name} 
                fill 
                className={`object-contain p-8 transition-all duration-500 ${product.status === 'sold' ? "grayscale opacity-50" : ""}`} 
                priority 
              />
              <Badge className="absolute top-6 left-6 bg-white/80 backdrop-blur-md text-slate-900 border-none px-4 py-2 rounded-full font-bold">
                {product.categoryId?.name || "Instrument"}
              </Badge>
            </motion.div>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {product.images?.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setActiveImage(idx)} className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === idx ? "border-orange-600 scale-105" : "border-slate-100 opacity-60"}`}>
                  <Image src={img} alt="thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* INFO */}
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-[0.9] uppercase mb-2">{product.name}</h1>

            <div className="flex items-center gap-3 mb-6">
              <StarRating
                rating={userRating || product.averageRating || 0}
                onRatingChange={handleRateQuick}
                size={22}
                readonly={userRating > 0}
              />
              <span className="text-xs font-bold text-slate-400 mt-0.5">({product.totalReviews || 0} {t.reviews})</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <span className="text-xl md:text-2xl font-black text-orange-600 tracking-tighter">{priceLabel}</span>
              {product.price === 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200">
                  <span className="text-sm font-bold text-slate-700">+251 98 261 6263</span>
                  <button onClick={handleCopyPhone} className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-500 hover:text-orange-600"><Copy className="w-4 h-4" /></button>
                </div>
              )}
            </div>

            {product.audioDemo && (
              <div className="mb-8">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">{t.audioDemo}</p>
                <AudioPlayer src={product.audioDemo} title={product.name} />
              </div>
            )}

            <p className="text-slate-500 text-sm leading-relaxed font-medium mb-10">{product.description}</p>

            {/* ACTION BUTTONS: Sticky on Mobile, Static on Desktop */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50 md:static md:p-0 md:bg-transparent md:border-0 md:mb-12">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="max-w-7xl mx-auto flex flex-row gap-3"
              >
                <Button
                  onClick={handleBuyNow}
                  disabled={buyNowLoading || product.price === 0 || product.status === 'sold'}
                  className={`flex-[2] h-14 md:h-16 rounded-2xl font-black uppercase tracking-widest transition-all gap-2 text-[10px] md:text-sm shadow-xl ${
                    product.status === 'sold'
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-600/20"
                  }`}
                >
                  {buyNowLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : product.status === 'sold' ? null : <Zap className="w-4 h-4 md:w-5 md:h-5 fill-white" />}
                  <span className="truncate">{product.status === 'sold' ? "Sold Out" : t.buyNow}</span>
                </Button>
                <Button
                  onClick={handleAddToCart}
                  disabled={product.status === 'sold'}
                  className={`flex-1 h-14 md:h-16 rounded-2xl font-black uppercase tracking-widest transition-all gap-2 text-[10px] md:text-sm shadow-xl ${
                    product.status === 'sold'
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none"
                    : "bg-slate-950 text-white hover:bg-slate-800 shadow-slate-950/20"
                  }`}
                >
                  {product.status !== 'sold' && <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />}
                  <span className="truncate">{product.status === 'sold' ? "Sold Out" : t.addToCart}</span>
                </Button>
              </motion.div>
            </div>

            <div className="grid grid-cols-3 gap-4 py-8 border-y border-slate-100">
              <div className="flex flex-col items-center text-center gap-2"><Truck className="w-5 h-5 text-orange-600" /><span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t.shipping}</span></div>
              <div className="flex flex-col items-center text-center gap-2"><ShieldCheck className="w-5 h-5 text-orange-600" /><span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t.warranty}</span></div>
              <div className="flex flex-col items-center text-center gap-2"><RotateCcw className="w-5 h-5 text-orange-600" /><span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t.returns}</span></div>
            </div>
          </div>
        </div>

        {/* MAP SECTION (IMPROVED) */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><MapPin className="w-5 h-5" /></div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase">{t.locationTitle}</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center bg-slate-50 rounded-[2.5rem] p-4 md:p-8 border border-slate-100">
            <div className="lg:col-span-1 space-y-4">
              <div>
                <h3 className="font-black text-slate-900 uppercase text-lg">Megenagna Branch</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">Bethelem Building, Near Megenagna Roundabout<br />Addis Ababa, Ethiopia</p>
              </div>
              <div className="space-y-2 pt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Open Hours</p>
                <p className="text-sm font-bold text-slate-700">Mon - Sat: 9:00 AM - 7:00 PM</p>
              </div>
            </div>
            <div className="lg:col-span-2 relative h-80 w-full overflow-hidden rounded-[2rem] border-4 border-white shadow-xl shadow-slate-200/50">
              <LocationsMap locations={storeLocations} />
            </div>
          </div>
        </section>

        {/* RATINGS SECTION */}
        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase mb-8">
            {t.reviews}<span className="text-orange-600">.</span>
          </h2>

          {/* Stats summary */}
          {ratingStats && <div className="mb-6"><RatingSummary stats={ratingStats} /></div>}

          {/* Write a review */}
          {isAuthenticated && userRating === 0 && product?._id && (
            <div className="mb-8">
              <RatingForm
                productId={product._id}
                onSuccess={() => {
                  fetchRatings(product._id);
                }}
              />
            </div>
          )}
          {isAuthenticated && userRating > 0 && (
            <p className="text-xs text-slate-400 text-center mb-8 font-bold uppercase tracking-widest">
              ✓ You have already reviewed this instrument
            </p>
          )}
          {!isAuthenticated && (
            <p className="text-xs text-slate-400 text-center mb-8">
              <a href="/login" className="text-orange-600 font-bold hover:underline">Log in</a> to leave a review
            </p>
          )}

          {/* Review cards */}
          {ratingsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : ratings.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {ratings.map((r) => <RatingCard key={r._id} rating={r} />)}
            </div>
          )}
        </section>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase mb-12">{t.relatedProducts}<span className="text-orange-600">.</span></h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
              {relatedProducts.map((p) => (
                <motion.div key={p._id} whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
                  <ProductCard id={p._id} name={p.name} slug={p.slug} price={p.price} image={p.images?.[0] || "/placeholder.jpg"} category={p.categoryId?.name || "Instrument"} rating={p.rating} status={p.status} />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
