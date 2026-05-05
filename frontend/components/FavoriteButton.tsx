"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

interface FavoriteItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
}

export function FavoriteButton() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    // Migration logic
    const oldSaved = localStorage.getItem("hone_wishlist");
    const newSaved = localStorage.getItem("hone_favorites");
    
    if (oldSaved && !newSaved) {
      localStorage.setItem("hone_favorites", oldSaved);
      localStorage.removeItem("hone_wishlist");
      setFavorites(JSON.parse(oldSaved));
    } else if (newSaved) {
      setFavorites(JSON.parse(newSaved));
    }
    
    // Listen for storage changes
    const handleStorage = () => {
      const saved = localStorage.getItem("hone_favorites");
      if (saved) setFavorites(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <Link
      href="/favorite"
      className="relative p-2 text-slate-600 hover:text-orange-600 transition-colors"
    >
      <Heart className="w-5 h-5" />
      {favorites.length > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 text-white text-[10px] flex items-center justify-center rounded-full font-black">
          {favorites.length}
        </span>
      )}
    </Link>
  );
}

export function addToFavorites(item: FavoriteItem) {
  const saved = localStorage.getItem("hone_favorites");
  const current: FavoriteItem[] = saved ? JSON.parse(saved) : [];
  
  if (!current.find(i => i._id === item._id)) {
    const updated = [item, ...current];
    localStorage.setItem("hone_favorites", JSON.stringify(updated));
    // Trigger storage event for same-tab sync
    window.dispatchEvent(new Event('storage'));
    return true;
  }
  return false;
}

export function removeFromFavoritesById(id: string) {
  const saved = localStorage.getItem("hone_favorites");
  if (!saved) return;
  
  const current: FavoriteItem[] = JSON.parse(saved);
  const updated = current.filter(item => item._id !== id);
  localStorage.setItem("hone_favorites", JSON.stringify(updated));
  window.dispatchEvent(new Event('storage'));
}

export function isInFavorites(id: string): boolean {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem("hone_favorites");
  if (!saved) return false;
  
  const current: FavoriteItem[] = JSON.parse(saved);
  return current.some(item => item._id === id);
}
