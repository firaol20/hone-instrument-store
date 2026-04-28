"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { addToWishlist, removeFromWishlistById, isInWishlist } from "@/components/WishlistButton";
import { useCartStore } from "@/lib/cart-store";
import { useLangStore } from "@/lib/lang-store";
import { translations } from "@/lib/translations";
import { toast } from "sonner";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface WishlistItem {
    _id: string;
    name: string;
    price: number;
    image: string;
    slug: string;
}

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { addItem } = useCartStore();
    const { currentLang } = useLangStore();
    const t = translations[currentLang];

    useEffect(() => {
        const saved = localStorage.getItem("hone_wishlist");
        if (saved) {
            setWishlist(JSON.parse(saved));
        }
        setLoading(false);
    }, []);

    const handleRemove = (id: string) => {
        removeFromWishlistById(id);
        setWishlist(prev => prev.filter(item => item._id !== id));
        toast.success("Removed from wishlist");
    };

    const handleAddToCart = (item: WishlistItem) => {
        addItem({
            productId: item._id,
            name: item.name,
            slug: item.slug,
            price: item.price,
            quantity: 1,
            image: item.image,
            category: "Instrument",
            sku: "",
        });
        toast.success(`${item.name} added to cart`);
    };

    return (
        <div className="min-h-screen bg-slate-50/30">
            <Header />
            <main className="max-w-7xl mx-auto px-4 py-8 md:px-8 md:py-12">
                <div className="mb-8">
                    <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-slate-900">
                        {t.wishlistTitle || "Wishlist"}<span className="text-orange-600">.</span>
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-slate-200 aspect-square rounded-2xl mb-3" />
                                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-slate-200 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : wishlist.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <Heart className="w-10 h-10 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium mb-6">{t.wishlistEmpty || "Your wishlist is empty"}</p>
                        <Button asChild className="bg-orange-600 hover:bg-orange-700">
                            <Link href="/products">
                                {t.browseProducts || "Browse Products"} <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {wishlist.map((item) => (
                            <div
                                key={item._id}
                                className="bg-white rounded-2xl p-3 md:p-4 border border-slate-100 shadow-sm"
                            >
                                <div className="relative aspect-square mb-3 bg-slate-50 rounded-xl overflow-hidden">
                                    <Link href={`/products/${item.slug}`}>
                                        <Image
                                            src={item.image || "/placeholder.jpg"}
                                            alt={item.name}
                                            fill
                                            className="object-cover hover:scale-105 transition-transform"
                                        />
                                    </Link>
                                    <button
                                        onClick={() => handleRemove(item._id)}
                                        className="absolute top-2 right-2 p-2 bg-white/90 text-slate-400 hover:text-red-500 rounded-full shadow-md"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <Link href={`/products/${item.slug}`}>
                                    <h3 className="font-bold text-xs md:text-sm text-slate-800 line-clamp-1 mb-1 hover:text-orange-600 transition-colors">
                                        {item.name}
                                    </h3>
                                </Link>
                                <p className="text-orange-600 font-black text-sm mb-3">
                                    ETB {item.price.toLocaleString()}
                                </p>

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => handleAddToCart(item)}
                                        className="flex-1 h-9 bg-slate-950 hover:bg-orange-600 text-[10px]"
                                    >
                                        <ShoppingCart className="w-3 h-3 mr-1" />
                                        {t.addToCart || "Add to Cart"}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}