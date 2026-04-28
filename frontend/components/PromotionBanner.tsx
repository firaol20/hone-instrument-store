'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { publicAPI } from '@/lib/api';

export const PromotionBanner = () => {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const response = await publicAPI.getActivePromotions();
        const promotionsData = response.data?.success ? response.data.data || [] : [];
        setPromotions(promotionsData);
      } catch (error) {
        console.error('Failed to fetch promotions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPromotion();
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    if (promotions.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [promotions]);

  // Countdown timer
  useEffect(() => {
    const currentPromo = promotions[currentIndex];
    if (!currentPromo?.expiryDate) { setTimeLeft(""); return; }
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(currentPromo.expiryDate).getTime();
      const distance = expiry - now;
      if (distance <= 0) {
        setPromotions(prev => prev.filter(p => p._id !== currentPromo._id));
        return;
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [promotions, currentIndex]);

  if (isLoading || promotions.length === 0) return null;

  const current = promotions[currentIndex];
  const hasBanner = !!current.bannerImage;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8"
    >
      <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-white/5 shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/*
              Both modes use identical padding (px-6 py-8 / sm:px-12 sm:py-12)
              so the card height is always the same regardless of image presence.
            */}

            {/* Background layer — image or gradient */}
            {hasBanner ? (
              <>
                <motion.img
                  src={current.bannerImage}
                  alt=""
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.2 }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-orange-900/30" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 blur-[100px] rounded-full" />
              </>
            )}

            {/* Content — identical structure & padding for both modes */}
            <div className="relative z-10 px-6 py-8 sm:px-12 sm:py-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex flex-col items-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-600 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
                    <Sparkles size={10} />
                    {current.type || 'Limited Deal'}
                  </span>
                  {timeLeft && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[9px] font-bold text-orange-600">
                      <Clock size={9} /> {timeLeft}
                    </span>
                  )}
                </div>

                <div className="max-w-2xl">
                  <h2 className="text-2xl md:text-3xl font-black text-indigo-600 leading-none tracking-tight uppercase italic">
                    {current.title}
                  </h2>
                  {current.description && (
                    <p className="mt-2 text-sm md:text-base text-white font-medium leading-relaxed line-clamp-2">
                      {current.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end items-end self-end sm:self-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href={current.link || "/products"}
                    className="group relative flex items-center gap-3 px-8 py-3 bg-white text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all duration-300 shadow-lg"
                  >
                    {hasBanner ? 'Shop Now' : 'Explore Now'}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      {promotions.length > 1 && (
        <div className="flex justify-center items-center gap-2.5 mt-5">
          {promotions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className="group relative flex items-center justify-center p-2"
            >
              <div
                className={`transition-all duration-500 rounded-full ${idx === currentIndex
                  ? "w-8 h-1.5 bg-orange-600"
                  : "w-1.5 h-1.5 bg-slate-300 group-hover:bg-slate-500"
                  }`}
              />
            </button>
          ))}
        </div>
      )}
    </motion.section>
  );
};
