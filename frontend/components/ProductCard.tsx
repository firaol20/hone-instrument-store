"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "@/lib/cart-store";
import { toast } from "sonner";

import { Star, Heart } from "lucide-react";
import StarRating from "@/components/StarRating";
import { useRatingStore } from "@/lib/rating-store";
import { useAuthStore } from "@/lib/auth-store";
import { addToFavorites, removeFromFavoritesById, isInFavorites } from "@/components/FavoriteButton";
import { useState, useEffect } from "react";
import { useTranslation } from "./TranslationProvider";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  category: string;
  rating?: {
    averageRating: number;
    totalRatings: number;
  };
  showAddToCart?: boolean;
  status?: 'available' | 'sold';
  actions?: React.ReactNode;
  className?: string;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  image,
  category,
  rating,
  showAddToCart = true,
  status = 'available',
  actions,
  className = "",
}: ProductCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { userRatings, setRating } = useRatingStore();

  const userRating = userRatings[id] || 0;
  const isSold = status === 'sold';

  const handleRate = async (val: number) => {
    if (!isAuthenticated) {
      router.push(`/login`);
      return;
    }
    try {
      await setRating(id, val);
      toast.success('Rating saved!');
    } catch {
      toast.error('Failed to save rating');
    }
  };

  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(isInFavorites(id));
  }, [id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFavorite) {
      removeFromFavoritesById(id);
      setIsFavorite(false);
      toast.info("Removed from favorites");
    } else {
      addToFavorites({
        _id: id,
        name,
        price,
        image,
        slug
      });
      setIsFavorite(true);
      toast.success("Added to favorites");
    }
  };

  // Price display: 0 means "Call Us" (price not listed)
  const priceLabel = price === 0
    ? "🤙 Call Us"
    : `ETB ${price.toLocaleString()}`;

  const addToCartLabel = isSold ? t('soldOut') : t('addToCart');

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSold) return;
    
    addItem({
      productId: id,
      name,
      slug,
      price,
      image,
      quantity: 1,
      category,
      sku: "",
      status: status,
    });
    toast.success(`${name} added to cart`, {
      action: {
        label: "View Cart",
        onClick: () => router.push("/cart")
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`w-full h-full ${className}`}
    >
      <Card className="group border-slate-100 bg-white shadow-sm transition-all duration-300 flex flex-col h-full rounded-[1rem] md:rounded-[1.5rem] p-2 md:p-4 hover:border-slate-300">
        {/* Image Section */}
        <CardContent className="p-0">
          <div className="relative block w-full aspect-square overflow-hidden rounded-[0.5rem] md:rounded-[1rem] bg-slate-50 border border-slate-50 group-hover:border-slate-100 transition-colors">
            <Link
              href={`/products/${slug}`}
              className="block w-full h-full"
            >
              <Image
                src={image}
                alt={`Hone Musical Instruments - ${category} - ${name}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isSold ? "grayscale opacity-70" : ""}`}
              />
              {isSold && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                  <span className="bg-red-600 text-white text-[10px] md:text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    {t('soldOut')}
                  </span>
                </div>
              )}
            </Link>
            
            {/* Favorite Button */}
            {!isSold && (
              <button
                onClick={toggleFavorite}
                className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all duration-300 shadow-sm z-10 ${
                  isFavorite 
                  ? "bg-orange-600 text-white" 
                  : "bg-white/70 text-slate-400 hover:text-orange-600 hover:bg-white"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isFavorite ? "fill-white" : ""}`} />
              </button>
            )}
          </div>
        </CardContent>

        {/* Content Section */}
        <div className={`pt-1.5 pb-1 px-0.5 flex flex-col flex-1 ${isSold ? "opacity-60" : ""}`}>
          <div className="flex flex-col gap-1 mb-1.5 md:mb-2">
            {/* Category */}
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-wider text-indigo-600 leading-none">
              {category}
            </p>
            {/* Product Average Rating + User Interactive Rating */}
            <div className="flex items-center gap-1.5">
              {rating && rating.totalRatings > 0 && (
                <div className="flex items-center gap-1 bg-orange-50 px-1.5 py-0.5 rounded-full">
                  <Star className="w-2.5 h-2.5 fill-orange-500 text-orange-500" />
                  <span className="text-[9px] font-bold text-orange-700">{rating.averageRating}</span>
                  <span className="text-[8px] text-orange-400">({rating.totalRatings})</span>
                </div>
              )}
              {!isSold && (
                <StarRating
                  rating={userRating}
                  onRatingChange={handleRate}
                  size={12}
                  readonly={userRating > 0}
                />
              )}
            </div>
          </div>

          {/* Product Name */}
          <Link href={`/products/${slug}`}>
            <h3 className="font-bold text-[11px] md:text-base text-slate-800 line-clamp-1 leading-tight mb-1 md:mb-1.5 group-hover:text-orange-600 transition-colors">
              {name}
            </h3>
          </Link>


          {/* Price */}
          <div className="text-[12px] md:text-lg font-black text-slate-900 tracking-tighter leading-none mb-3">
            {priceLabel}
          </div>
        </div>

        {/* Action Button or custom actions */}
        <div className="px-0 pb-0 mt-auto">
          {showAddToCart && (
            <Button
              variant={isSold ? "secondary" : "outline"}
              onClick={handleAddToCart}
              disabled={isSold}
              className={`w-full rounded-full font-bold h-9 md:h-10 transition-colors flex items-center justify-center gap-1 text-[9px] md:text-xs px-0 ${
                isSold 
                ? "bg-slate-100 text-slate-400 border-transparent cursor-not-allowed" 
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {!isSold && <ShoppingCart className="w-2.5 md:w-3.5 h-2.5 md:h-3.5 text-slate-400" />}
              {addToCartLabel}
            </Button>
          )}
          {actions && (
            <div className="w-full">
              {actions}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

