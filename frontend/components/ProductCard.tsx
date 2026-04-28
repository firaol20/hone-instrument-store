"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { useLangStore } from "@/lib/lang-store";
import { useCartStore } from "@/lib/cart-store";
import { toast } from "sonner";

import { Star } from "lucide-react";
import StarRating from "@/components/StarRating";
import { useRatingStore } from "@/lib/rating-store";
import { useAuthStore } from "@/lib/auth-store";

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
  actions,
  className = "",
}: ProductCardProps) {
  const { currentLang } = useLangStore();
  const router = useRouter();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { userRatings, setRating } = useRatingStore();

  const userRating = userRatings[id] || 0;

  const handleRate = async (val: number) => {
    if (!isAuthenticated) {
      toast.error('Please log in to rate this product', { description: 'Sign in to save your instrument ratings.' });
      return;
    }
    try {
      await setRating(id, val);
      toast.success('Rating saved!');
    } catch {
      toast.error('Failed to save rating');
    }
  };

  // Price display: 0 means "Call Us" (price not listed)
  const priceLabel = price === 0
    ? "🤙 Call Us"
    : `ETB ${price.toLocaleString()}`;

  const addToCart = {
    ENG: "Add to cart",
    AMH: "\u12c8\u12f0 \u1245\u122d\u132b\u1275 \u1328\u121d\u122d",
    ORO: "Gara cartitti dabali",
  }[currentLang];

  const labels = {
    ENG: { added: "added to cart", view: "View Cart" },
    AMH: { added: "ወደ ቅርጫት ተጨምሯል", view: "ቅርጫቱን ይመልከቱ" },
    ORO: { added: "gara kaartitti dabalameera", view: "Kaartii Ilaali" },
  }[currentLang];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: id,
      name,
      slug,
      price,
      image,
      quantity: 1,
      category,
      sku: "",
    });
    toast.success(`${name} ${labels.added}`, {
      action: {
        label: labels.view,
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
      <Card className="group border-slate-100 bg-white shadow-sm transition-all duration-300 flex flex-col h-full rounded-[0.75rem] md:rounded-[1.5rem] p-1.5 md:p-4 hover:border-slate-300">
        {/* Image Section */}
        <CardContent className="p-0">
          <Link
            href={`/products/${slug}`}
            className="relative block w-full aspect-square overflow-hidden rounded-[0.5rem] md:rounded-[1rem] bg-slate-50 border border-slate-50 group-hover:border-slate-100 transition-colors"
          >
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
        </CardContent>

        {/* Content Section */}
        <div className="pt-2 pb-1.5 px-0.5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-0.5 md:mb-1">
            {/* Category */}
            <p className="text-[7px] md:text-[10px] font-black uppercase tracking-wider text-indigo-600 leading-none">
              {category}
            </p>
            {/* Product Average Rating + User Interactive Rating */}
            <div className="flex items-center gap-2 scale-75 md:scale-90 origin-right">
              {rating && rating.totalRatings > 0 && (
                <div className="flex items-center gap-1 bg-orange-50 px-1.5 py-0.5 rounded-full">
                  <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                  <span className="text-[10px] font-bold text-orange-700">{rating.averageRating}</span>
                  <span className="text-[8px] text-orange-400">({rating.totalRatings})</span>
                </div>
              )}
              <StarRating
                rating={userRating}
                onRatingChange={handleRate}
                size={14}
              />
            </div>
          </div>

          {/* Product Name */}
          <Link href={`/products/${slug}`}>
            <h3 className="font-bold text-[9px] md:text-base text-slate-800 line-clamp-1 leading-tight mb-0.5 md:mb-1 group-hover:text-orange-600 transition-colors">
              {name}
            </h3>
          </Link>


          {/* Price */}
          <div className="text-[10px] md:text-lg font-black text-slate-900 tracking-tighter leading-none mb-2">
            {priceLabel}
          </div>
        </div>

        {/* Action Button or custom actions */}
        <div className="px-0 pb-0 mt-auto">
          {showAddToCart && (
            <Button
              variant="outline"
              onClick={handleAddToCart}
              className="w-full rounded-full border-slate-200 text-slate-500 font-bold h-6 md:h-10 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 text-[8px] md:text-xs px-0"
            >
              <ShoppingCart className="w-2 md:w-3.5 h-2 md:h-3.5 text-slate-400" />
              {addToCart}
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

