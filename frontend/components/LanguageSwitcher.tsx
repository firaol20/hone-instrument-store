"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from './TranslationProvider';

const languages = [
  { code: 'en', name: 'English', shortName: 'EN', flag: '🇬🇧' },
  { code: 'am', name: 'አማርኛ', shortName: 'AMH', flag: '🇪🇹' },
  { code: 'om', name: 'Oromoo', shortName: 'ORO', flag: '🇪🇹' },
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useTranslation();

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 md:gap-2 px-2.5 py-2 md:px-4 md:py-2 bg-slate-900/10 backdrop-blur-md border border-slate-900/20 rounded-full text-slate-900 md:text-orange-600 hover:bg-slate-900/20 transition-all group shadow-sm"
      >
        <Globe size={16} className="text-orange-600 group-hover:rotate-12 transition-transform" />
        <span className="text-[10px] font-black tracking-widest md:hidden mt-[1px]">
          {currentLang.shortName}
        </span>
        <span className="text-xs font-black uppercase tracking-widest hidden md:inline-block">
          {currentLang.name}
        </span>
        <ChevronDown size={14} className={`hidden md:block transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-48 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${language === lang.code
                        ? 'bg-orange-600 text-white'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-xs font-black uppercase tracking-widest">{lang.name}</span>
                    </div>
                    {language === lang.code && <Check size={14} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
