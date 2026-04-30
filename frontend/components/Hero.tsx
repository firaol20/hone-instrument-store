"use client";

import React from "react";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Icon } from "@iconify/react";
import Link from "next/link";

export const Hero: React.FC = () => {
  const titleText = "FIND YOUR RHYTHM";
  const titlePunctuation = ".";
  const socialProof = "20k+ Musicians Trust Us";

  return (
    <div
      className="relative h-[calc(100vh-80px)] min-h-[600px] overflow-hidden bg-slate-950 flex items-center"
      style={{
        clipPath: "polygon(0 0, 100% 0, 100% 90%, 0% 100%)",
      }}
    >
      {/* Background Layer with enhanced depth */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=2070"
          alt="Musical Instruments Background"
          fill
          className="object-cover opacity-30 scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid lg:grid-cols-2 items-center gap-12">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-orange-600/10 border border-orange-600/20 rounded-full text-orange-500 text-[11px] font-black uppercase tracking-[0.2em] w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            New Arrivals 2026
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tighter leading-[0.85] uppercase">
            {titleText}
            {titlePunctuation && <span className="text-orange-600">{titlePunctuation}</span>}
          </h1>

          <p className="text-sm md:text-base text-slate-400 max-w-lg leading-relaxed font-medium">
            Discover the world&apos;s finest traditional and modern musical instruments.
          </p>

          <div className="flex gap-2 sm:gap-4 pt-4 w-full">
            <Link href="/products" className="flex-1">
              <button className="w-full justify-center flex items-center gap-1 sm:gap-3 px-2 sm:px-8 py-3 sm:py-4 bg-orange-600 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-xs font-black hover:bg-orange-700 transition-all group shadow-2xl shadow-orange-600/20 active:scale-95 uppercase tracking-wider text-center">
                <span>Shop Collection</span>
                <ArrowRight className="w-3 h-3 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </button>
            </Link>

            <Link href="/compare" className="flex-1">
              <button className="w-full justify-center flex items-center gap-1 sm:gap-3 px-2 sm:px-8 py-3 sm:py-4 bg-white/5 backdrop-blur-xl text-white border border-white/10 rounded-xl sm:rounded-2xl text-[10px] sm:text-sm font-black hover:bg-white/10 transition-all active:scale-95 uppercase tracking-wider text-center">
                <div className="hidden sm:flex w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/10 items-center justify-center flex-shrink-0">
                  <Play className="w-2 h-2 sm:w-3 sm:h-3 fill-white" />
                </div>
                <span>Compare Models</span>
              </button>
            </Link>
          </div>

          {/* Social Proof for Mobile */}
          <div className="lg:hidden mt-12">
            <SocialProofBox socialProof={socialProof} />
          </div>
        </motion.div>

        {/* Right Side - Visual Element (Hidden on mobile) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="hidden lg:flex justify-end relative"
        >
          {/* Decorative Floating Instrument Card */}
          <div className="relative w-80 h-96 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-4 rotate-3 hover:rotate-0 transition-transform duration-700">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-600 rounded-full blur-[80px] opacity-50" />
            <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative">
              <Image
                src="https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&q=80&w=800"
                alt="Featured Instrument"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white font-black text-xl uppercase tracking-tighter">Free Delivery</p>
                <p className="text-orange-500 font-bold text-xs uppercase tracking-widest">Order Now</p>
              </div>
            </div>
          </div>

          {/* Bottom Right Social Proof for Desktop */}
          <div className="absolute -bottom-10 -left-10 z-20">
            <SocialProofBox socialProof={socialProof} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const SocialProofBox = ({ socialProof }: { socialProof: string }) => (
  <div className="flex items-center gap-5 bg-slate-900/40 backdrop-blur-2xl px-6 py-4 rounded-[2rem] border border-white/5 w-fit shadow-2xl">
    <div className="flex -space-x-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-slate-950 overflow-hidden relative shadow-2xl transition-transform hover:-translate-y-1">
          <Image src={`https://picsum.photos/seed/musician${i}/100/100`} alt="User avatar" fill className="object-cover" />
        </div>
      ))}
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-slate-950 bg-orange-600 flex items-center justify-center text-white text-[10px] font-black z-10">
        +20K
      </div>
    </div>
    <div className="text-white">
      <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.15em] text-slate-200">
        {socialProof}
      </p>
      <div className="flex gap-4 mt-2 text-slate-500">
        <Icon icon="simple-icons:tiktok" className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
        <Icon icon="akar-icons:instagram-fill" className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
        <Icon icon="simple-icons:youtube" className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
        <Icon icon="simple-icons:x" className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
      </div>
    </div>
  </div>
);