"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategoryScroll } from "@/components/CategoryScroll";
import { Services } from "@/components/Services";
import { ProductCard } from "@/components/ProductCard";
import { useLangStore } from "@/lib/lang-store";
import { productsAPI } from "@/lib/api";
import { Instagram, Send, Facebook, MessageCircle, MapIcon, MapPin, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PromotionBanner } from "@/components/PromotionBanner";
import { HONE_SHOWROOM } from "@/lib/store-location";



// Custom TikTok Icon for consistency
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export default function Home() {
  const { currentLang } = useLangStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Fetch a larger set of products to allow for randomization on the frontend
        const params: any = { limit: 20 };
        if (selectedCategory !== "all") {
          params.category = selectedCategory;
        }
        const response = await productsAPI.getAll(params);
        if (isMounted && response.data && response.data.data) {
          // Randomly shuffle the pool and take the first 8 items
          const shuffled = [...response.data.data].sort(() => Math.random() - 0.5);
          setProducts(shuffled.slice(0, 8));
        }
      } catch (error) {
        console.error("Failed to fetch products for home page:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => { isMounted = false };
  }, [selectedCategory]);

  const links = {
    facebook: "https://www.facebook.com/profile.php?id=100064707545307",
    whatsapp: "https://api.whatsapp.com/send?phone=%2B251982616263&token=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyNSJ9.eyJleHAiOjE3NzU0Nzc5NTMsInBob25lIjoiKzI1MTk4MjYxNjI2MyIsImNvbnRleHQiOiJBZmk5dXp1aVpuaU5pTWh1T0ZUZjRoT3k5NWJKX2V3T0dLZGFGVFpmSlJyOV9RdXZfbDZSYVR4b25JSVJVc0hPUjQ1TUpKcnhDalR4Tm5MY1JKR0lZTWF0TVBCT1BrV01TMWc1eHBwX0dHYjc2V0FZeHoxM3ExRDgteGNYYkdGUzdjNFRjTkdGVTF3Vll1WG43aEZpTXFRdzZRIiwic291cmNlIjoiRkJfUGFnZSIsImFwcCI6ImZhY2Vib29rIiwiZW50cnlfcG9pbnQiOiJwYWdlX2N0YSJ9.stO9FFXDYIkKPp9ng_btDkG6lh-g-_ylyLe_zpryLRUeTEreZPUoJKVUxDBxjKEXOJrfuNjn4zgkhl5Zd15UdQ&fbclid=IwY2xjawQ_MsJleHRuA2FlbQIxMABicmlkETB3MHpjM1NKUHRvRU5TMmI3c3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHjhCY8sTvoYwVQexb0UOj9WAWEqcAQCDldMbmd4BqTyj5qOA27YfZgZzLiRG_aem_tXVQFBTd8F7hQmWWeNmUmw",
    telegram: "https://t.me/honemusicinstruments",
    tiktok: "https://www.tiktok.com/@honemusicinstruments"
  };

  const content = {
    ENG: {
      ctaTitlePrefix: "Join Our",
      ctaTitleAccent: "Social Community",
      ctaDescription: "Follow us for the latest gear, musician highlights, and exclusive offers.",
      footerBlurb: "The premier marketplace for Modern and Traditional musical instruments in Ethiopia. Crafting sound, delivering excellence.",
      shop: "Shop",
      allInstruments: "All Instruments",
      guitars: "Guitars",
      keyboards: "Keyboards",
      company: "Company",
      story: "Our Story",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      support: "Support",
      contact: "Contact Us",
      helpCenter: "Help Center",
      copyright: "Hone Instrumental Store. All rights reserved.",
    },
    AMH: {
      ctaTitlePrefix: "ማህበራዊ ገጾቻችንን",
      ctaTitleAccent: "ይቀላቀሉ",
      ctaDescription: "አዳዲስ መሣሪያዎችን እና ልዩ ቅናሾችን ለማግኘት በማህበራዊ ሚዲያዎቻችን ይከተሉን።",
      footerBlurb: "በኢትዮጵያ ያሉ የሙዚቃ መሣሪያዎች መሪ ገበያ። ድምፅ እንቀርጻለን፤ ልቀት እናቀርባለን።",
      shop: "ግዢ",
      allInstruments: "ሁሉም መሣሪያዎች",
      guitars: "ጂታሮች",
      keyboards: "ኪቦርዶች",
      company: "ድርጅት",
      story: "ታሪካችን",
      terms: "የአገልግሎት ሕጎች",
      privacy: "የግላዊነት ፖሊሲ",
      support: "ድጋፍ",
      contact: "ያግኙን",
      helpCenter: "የእርዳታ ማዕከል",
      copyright: "ሁሉ መብቶች የተጠበቁ ናቸው።",
    },
    ORO: {
      ctaTitlePrefix: "Miidiyaa Hawaasaa",
      ctaTitleAccent: "Keenyaatti Dabalami",
      ctaDescription: "Meeshaalee haaraa fi kaffaltii addaa argachuuf miidiyaa hawaasaa keenya hordofaa.",
      footerBlurb: "Itiyoophiyaa keessatti gabaa guddaa meeshaalee muuziqaatiif. Sagalee ijaarra, qulqullina geessina.",
      shop: "Bittaa",
      allInstruments: "Meeshaalee Hunda",
      guitars: "Giitaarota",
      keyboards: "Kiiboodota",
      company: "Dhaabbata",
      story: "Seenaa Keenya",
      terms: "Heera Tajaajilaa",
      privacy: "Imaammata Dhuunfaa",
      support: "Deeggarsa",
      contact: "Nu qunnamaa",
      helpCenter: "Wiirtuu Gargaarsaa",
      copyright: "Mirgi hundi seeraan eegameera.",
    },
  }[currentLang];

  const socialLinks = [
    { icon: <Facebook className="w-6 h-6 md:w-8 md:h-8" />, href: links.facebook, label: "Facebook" },
    { icon: <TikTokIcon className="w-6 h-6 md:w-8 md:h-8" />, href: links.tiktok, label: "TikTok" },
    { icon: <MessageCircle className="w-6 h-6 md:w-8 md:h-8" />, href: links.whatsapp, label: "WhatsApp" },
    { icon: <Send className="w-6 h-6 md:w-8 md:h-8" />, href: links.telegram, label: "Telegram" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main>
        <Hero />


        <CategoryScroll onSelect={(slug) => setSelectedCategory(slug)} />

        {/* PRODUCT SECTION */}
        <section className="pt-2 pb-12 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
              </motion.div>
              <Link
                href={selectedCategory === "all" ? "/products" : `/products?category=${selectedCategory}`}
                className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-orange-600 transition-colors"
              >
                See All
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-10 min-h-[400px]">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={`skel-${i}`} className="animate-pulse">
                    <div className="bg-slate-100 aspect-square rounded-2xl mb-4" />
                    <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                  </div>
                ))
                : products.length === 0 ? (
                  <div className="col-span-2 lg:col-span-4 py-20 text-center text-slate-400 font-medium">
                    No products found.
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {products.map((product) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ProductCard
                          id={product._id}
                          name={product.name}
                          slug={product.slug}
                          price={product.price}
                          image={product.images?.[0] || "/placeholder.jpg"}
                          category={product.categoryId?.name || "Instrument"}
                          rating={product.rating}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
            </div>
          </div>
        </section>

        <PromotionBanner />

        <Services />


        {/* SOCIAL MEDIA CTA SECTION - Reduced Desktop Size Only */}
        <section className="px-4 pt-12 pb-24 md:pt-16 md:pb-28">
          <div className="max-w-7xl mx-auto rounded-[3rem] md:rounded-[2.5rem] bg-slate-950 p-10 md:p-20 overflow-hidden relative border border-white/5">

            {/* Animated Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />

            <div className="relative z-10 text-center max-w-3xl md:max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >

                {/* Slightly larger desktop title */}
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                  {content.ctaTitlePrefix}{" "}
                  <span className="text-orange-600">
                    {content.ctaTitleAccent}
                  </span>
                </h2>

                {/* Slightly larger desktop paragraph */}
                <p className="text-slate-400 text-base md:text-lg mb-14 font-medium leading-relaxed">
                  {content.ctaDescription}
                </p>

              </motion.div>

              {/* Social Icons */}
              <div className="flex flex-nowrap justify-start md:justify-center gap-5 overflow-x-auto pb-4 scrollbar-hide">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}


                    className="w-14 h-14 md:w-[72px] md:h-[72px] flex-shrink-0 rounded-[1.5rem] bg-white/[0.03] backdrop-blur-xl flex items-center justify-center text-white border border-white/10 hover:border-orange-500/50 hover:bg-orange-600 transition-all duration-300 shadow-2xl shadow-black"

                    aria-label={social.label}
                  >
                    <div className="scale-110 md:scale-125">
                      {social.icon}
                    </div>
                  </motion.a>
                ))}
              </div>

              {/* Mobile scroll hint */}
              <div className="md:hidden mt-4 flex justify-center">
                <div className="w-12 h-1 bg-white/10 rounded-full">
                  <motion.div
                    animate={{ x: [0, 20, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-4 h-full bg-orange-600 rounded-full"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-cyan-50/40 backdrop-blur-md border-t border-cyan-100/50 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
            {/* Brand Column */}
            <div className="md:col-span-4 space-y-6">
              <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
                HONE<span className="text-orange-600">.</span>
              </span>
              <p className="text-slate-500 text-xs leading-relaxed max-w-sm font-medium">
                {content.footerBlurb}
              </p>

              {/* NEW: Quick Directions Button */}
              <div>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-orange-600 transition-all group"
                >
                  <MapPin className="w-4 h-4 text-orange-600 group-hover:text-white" />
                  {HONE_SHOWROOM.name}
                </Link>
                <p className="mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-tight ml-1">
                  {HONE_SHOWROOM.street}
                </p>
              </div>
            </div>

            {/* Links Columns */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12">
              <div>
                <h4 className="font-bold text-slate-900 mb-6 uppercase text-[10px] tracking-widest">
                  {content.shop}
                </h4>
                <ul className="space-y-3 text-xs font-medium text-slate-500">
                  <li>
                    <Link href="/products" className="hover:text-orange-600 transition-colors">
                      {content.allInstruments}
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?cat=guitars" className="hover:text-orange-600 transition-colors">
                      {content.guitars}
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?cat=keys" className="hover:text-orange-600 transition-colors">
                      {content.keyboards}
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-6 uppercase text-[10px] tracking-widest">
                  {content.company}
                </h4>
                <ul className="space-y-3 text-xs font-medium text-slate-500">
                  <li>
                    <Link href="/" className="hover:text-orange-600 transition-colors">
                      {content.story}
                    </Link>
                  </li>
                  <li>
                    <Link href="/" className="hover:text-orange-600 transition-colors">
                      {content.terms}
                    </Link>
                  </li>
                  <li>
                    <Link href="/" className="hover:text-orange-600 transition-colors">
                      {content.privacy}
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-6 uppercase text-[10px] tracking-widest">
                  {content.support}
                </h4>
                <ul className="space-y-3 text-xs font-medium text-slate-500">
                  <li>
                    <Link href="/contact" className="hover:text-orange-600 transition-colors">
                      {content.contact}
                    </Link>
                  </li>
                  {/* NEW: Map/Directions Link */}
                  <li>
                    <Link href="/contact#map" className="hover:text-orange-600 transition-colors flex items-center gap-2">
                      Find Us on Map
                    </Link>
                  </li>
                  <li>
                    <Link href="/" className="hover:text-orange-600 transition-colors">
                      {content.helpCenter}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} {content.copyright}
            </p>
            <div className="flex gap-8">
              <span className="text-[10px] font-black text-orange-600 tracking-tighter">ETHIOPIA</span>
              <span className="text-[10px] font-black text-slate-300 tracking-tighter">USA</span>
              <span className="text-[10px] font-black text-slate-300 tracking-tighter">UK</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}