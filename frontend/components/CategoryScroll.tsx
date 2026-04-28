"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLangStore } from "@/lib/lang-store";
import { categoriesAPI } from "@/lib/api";
import {
  Music,
  Guitar,
  Drum,
  Mic2,
  Piano,
  Speaker,
  Disc,
  Radio,
  CassetteTape,
  Headphones,
  Keyboard,
  AudioWaveform,
  Cable,
  Volume2,
  ZapIcon,
} from "lucide-react";

// Map category slugs/names to icons
function getCategoryIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("guitar")) return <Guitar className="w-4 h-4" />;
  if (n.includes("drum") || n.includes("kick")) return <Drum className="w-4 h-4" />;
  if (n.includes("keyboard") || n.includes("piano") || n.includes("midi")) return <Piano className="w-4 h-4" />;
  if (n.includes("mic") || n.includes("studio")) return <Mic2 className="w-4 h-4" />;
  if (n.includes("speaker") || n.includes("monitor") || n.includes("bluetooth")) return <Speaker className="w-4 h-4" />;
  if (n.includes("amplifier") || n.includes("amp")) return <Volume2 className="w-4 h-4" />;
  if (n.includes("headset") || n.includes("headphone")) return <Headphones className="w-4 h-4" />;
  if (n.includes("sound card")) return <AudioWaveform className="w-4 h-4" />;
  if (n.includes("cable")) return <Cable className="w-4 h-4" />;
  if (n.includes("violin") || n.includes("saxophone") || n.includes("kirar")) return <Music className="w-4 h-4" />;
  if (n.includes("stage box") || n.includes("digital")) return <Disc className="w-4 h-4" />;
  if (n.includes("stand")) return <ZapIcon className="w-4 h-4" />;
  if (n.includes("sound proof")) return <Radio className="w-4 h-4" />;
  return <Music className="w-4 h-4" />;
}

interface CategoryScrollProps {
  onSelect?: (slug: string) => void;
}

export const CategoryScroll = ({ onSelect }: CategoryScrollProps = {}) => {
  const [active, setActive] = React.useState("all");
  const [categories, setCategories] = useState<any[]>([]);
  const { currentLang } = useLangStore();
  const router = useRouter();

  const labels = {
    ENG: { browseBy: "Browse by", categoriesTitle: "Categories", all: "All Instruments" },
    AMH: { browseBy: "በምድብ ይፈልጉ", categoriesTitle: "ምድቦች", all: "ሁሎም መሳሪያዎች" },
    ORO: { browseBy: "Ramaddiin barbaadi", categoriesTitle: "Ramaddiiwwan", all: "Meeshaalee Hunda" },
  }[currentLang];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        const data = response.data?.data || response.data || [];
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (slug: string) => {
    setActive(slug);
    if (onSelect) {
      onSelect(slug);
    } else {
      if (slug === "all") {
        router.push("/products");
      } else {
        router.push(`/products?category=${slug}`);
      }
    }
  };

  const allItem = { _id: "all", name: labels.all, slug: "all" };
  const displayCategories = [allItem, ...categories];

  return (
    <div className="w-full bg-white border-b border-slate-100 z-30 pt-6 pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-600 mb-2">
              {labels.browseBy}
            </p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-950 uppercase">
              {labels.categoriesTitle}
              <span className="text-orange-600">.</span>
            </h2>
          </motion.div>
        </div>

        <div className="relative group">
          <div className="flex overflow-x-auto py-2 gap-4 no-scrollbar scroll-smooth snap-x items-center">
            {displayCategories.map((cat, index) => (
              <motion.button
                key={cat._id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`
                  relative flex items-center gap-3 px-8 py-4 rounded-2xl whitespace-nowrap text-xs font-bold
                  transition-all duration-300 snap-start border-2
                  ${active === cat.slug
                    ? "bg-slate-950 border-slate-950 text-white shadow-2xl shadow-slate-900/20 scale-105 z-10"
                    : "bg-white border-slate-100 text-slate-500 hover:border-orange-200 hover:text-slate-900"
                  }
                `}
              >
                {active === cat.slug && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute inset-0 rounded-2xl bg-orange-600/10 blur-xl -z-10"
                  />
                )}
                <span className={`${active === cat.slug ? "text-orange-500" : "text-slate-400"}`}>
                  {getCategoryIcon(cat.name)}
                </span>
                {cat.name}
              </motion.button>
            ))}
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-20" />
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none z-20 opacity-50" />
        </div>
      </div>
    </div>
  );
};
