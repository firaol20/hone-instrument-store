"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useCartStore } from "@/lib/cart-store";
import { ShoppingCart, AlignRight, LayoutDashboard, Box, ArrowRightLeft, Heart, LogIn, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import LanguageSwitcher from "./LanguageSwitcher";
import { usePathname } from "next/navigation"; // ✅ added

export function Header() {
  const [mounted, setMounted] = useState(false);
  const { items } = useCartStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-200/30 bg-cyan-50/60 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-8">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 shadow-2xl group-hover:scale-105 transition-transform border border-white/10 overflow-hidden">
                <Image src="https://res.cloudinary.com/dglvpzqcl/image/upload/v1778093864/hone_store/website.jpg" alt="logo" fill className="object-cover brightness-110" unoptimized />
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900 uppercase notranslate">
                HONE<span className="text-orange-600">.</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-10">
              <Link href="/products" className="text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors">
                Instruments
              </Link>
              <Link href="/compare" className="text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors">
                Compare
              </Link>
              <Link href="/favorite" className="text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors">
                Favorite
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitcher />

            {isAuthenticated && user?.role === "admin" && (
              <Link
                href="/admin"
                className="p-2 text-slate-600 hover:text-orange-600 transition-colors"
              >
                <LayoutDashboard className="w-5 h-5" />
              </Link>
            )}

            <Link
              href="/cart"
              className="hidden sm:flex p-2 text-slate-600 hover:text-orange-600 transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {mounted && items.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 text-white text-[10px] flex items-center justify-center rounded-full font-black border-2 border-white">
                  {items.length}
                </span>
              )}
            </Link>

            <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

            <div className="flex items-center gap-3">
              {mounted && !isAuthenticated ? (
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center gap-2 h-9 px-3 rounded-md text-sm font-medium text-slate-700 hover:text-orange-700 hover:bg-slate-100 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              ) : null}

              {mounted && isAuthenticated ? (
                <Link
                  href="/account"
                  className="hidden sm:flex h-10 w-10 rounded-full bg-orange-600 hover:bg-orange-700 items-center justify-center text-white text-xs font-bold transition-all shadow-md active:scale-95 ring-2 ring-white"
                >
                  {user?.email?.[0]?.toUpperCase()}
                </Link>
              ) : null}

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <AlignRight className="h-6 w-6 stroke-[2.5px]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] shadow-2xl border-r border-white/5 p-6 flex flex-col z-50 h-screen bg-slate-950"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-black tracking-tighter text-white uppercase notranslate">
                  HONE<span className="text-orange-600">.</span>
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5 stroke-[1.5]" />
                </button>
              </div>

              <nav className="flex flex-col gap-2 flex-1 mt-6">
                <Link
                  href="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all ${pathname === "/products"
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-950/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                >
                  <Box className={`w-5 h-5 ${pathname === "/products" ? "text-white" : "text-slate-500"}`} />
                  <span className="text-sm tracking-tight">Instruments</span>
                </Link>

                <Link
                  href="/compare"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all ${pathname === "/compare"
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-950/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                >
                  <ArrowRightLeft className={`w-5 h-5 ${pathname === "/compare" ? "text-white" : "text-slate-500"}`} />
                  <span className="text-sm tracking-tight">Compare</span>
                </Link>

                <Link
                  href="/favorite"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all ${pathname === "/favorite"
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-950/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                >
                  <Heart className={`w-5 h-5 ${pathname === "/favorite" ? "text-white" : "text-slate-500"}`} />
                  <span className="text-sm tracking-tight">Favorite</span>
                </Link>
              </nav>

              <div className="mt-auto flex flex-col gap-2 pt-6 pb-12">
                <Link
                  href="/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-5 py-3.5 text-slate-400 hover:text-white font-bold hover:bg-white/5 rounded-2xl transition-all"
                >
                  <div className="relative">
                    <ShoppingCart className="w-5 h-5 text-slate-500" />
                    {items.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-600 text-white text-[9px] flex items-center justify-center rounded-full font-black">
                        {items.length}
                      </span>
                    )}
                  </div>
                  <span className="text-sm tracking-tight">My Cart</span>
                </Link>

                 {!isAuthenticated ? (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-5 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-orange-950/20"
                  >
                    <LogIn className="w-5 h-5" />
                    <span className="text-sm tracking-tight">Sign In</span>
                  </Link>
                ) : (
                  <Link
                    href="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 w-full p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5"
                  >
                    <div className="h-10 w-10 min-w-[40px] rounded-full bg-orange-600 flex items-center justify-center text-white text-base font-black shadow-md">
                      {user?.email?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[11px] font-bold text-white truncate">
                        {user?.email}
                      </span>
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mt-0.5">
                        View Profile
                      </span>
                    </div>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}