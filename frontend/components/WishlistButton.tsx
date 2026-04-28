"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
}

export function WishlistButton() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("hone_wishlist");
    if (saved) {
      setWishlist(JSON.parse(saved));
    }
  }, []);

  return (
    <Link
      href="/wishlist"
      className="relative p-2 text-slate-600 hover:text-orange-600 transition-colors"
    >
      <Heart className="w-5 h-5" />
      {wishlist.length > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 text-white text-[10px] flex items-center justify-center rounded-full font-black">
          {wishlist.length}
        </span>
      )}
    </Link>
  );
}

export function addToWishlist(item: WishlistItem) {
  const saved = localStorage.getItem("hone_wishlist");
  const current: WishlistItem[] = saved ? JSON.parse(saved) : [];
  
  if (!current.find(i => i._id === item._id)) {
    const updated = [item, ...current];
    localStorage.setItem("hone_wishlist", JSON.stringify(updated));
    return true;
  }
  return false;
}

export function removeFromWishlistById(id: string) {
  const saved = localStorage.getItem("hone_wishlist");
  if (!saved) return;
  
  const current: WishlistItem[] = JSON.parse(saved);
  const updated = current.filter(item => item._id !== id);
  localStorage.setItem("hone_wishlist", JSON.stringify(updated));
}

export function isInWishlist(id: string): boolean {
  const saved = localStorage.getItem("hone_wishlist");
  if (!saved) return false;
  
  const current: WishlistItem[] = JSON.parse(saved);
  return current.some(item => item._id === id);
}