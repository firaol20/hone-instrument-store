'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      href: 'https://wa.me/251982616263',
      color: 'bg-[#25D366]',
      label: 'Chat on WhatsApp'
    },
    {
      name: 'Telegram',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0C5.346 0 0 5.346 0 11.944s5.346 11.944 11.944 11.944 11.944-5.346 11.944-11.944S18.542 0 11.944 0zm5.862 7.533c-.183 1.923-1.025 7.155-1.45 9.444-.18.966-.537 1.289-.882 1.32-.759.07-1.334-.5-2.07-.983-1.152-.754-1.802-1.221-2.918-1.957-1.289-.85-.453-1.317.281-2.08.192-.2.3.51-1.336-3.532-1.874-2.523-2.28-2.62-2.613-2.627-.723-.014-1.24.484-1.24 1.114 0 .47.185.892.368 1.289.37.798 4.606 7.643 4.606 7.643s.517.863 1.24.863c.723 0 1.24-.863 1.24-.863s.185-.347.368-.892c.183-.545 1.025-4.606 1.025-4.606s.183-1.74-.882-1.74c-1.065 0-2.28 1.025-2.28 1.025s-.517.517-.517 1.24c0 .723.517 1.24.517 1.24s.183.183.368.517c.185.334.185.723 0 1.065-.185.342-.517.684-1.24.684-.723 0-1.24-.342-1.24-.342s-1.417-.863-1.417-2.62c0-1.757 1.597-3.532 3.868-3.532 2.271 0 3.868 1.775 3.868 3.532z" />
        </svg>
      ),
      href: 'https://t.me/@honemusic1',
      color: 'bg-[#0088cc]',
      label: 'Chat on Telegram'
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="flex flex-col gap-3"
          >
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <span className="bg-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                  {link.label}
                </span>
                <div className={`${link.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform active:scale-95`}>
                  {link.icon}
                </div>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${isOpen ? 'bg-slate-900 rotate-90' : 'bg-orange-600 hover:bg-orange-700'
          }`}
      >
        <motion.div
          animate={{ scale: isOpen ? 1 : [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
        </motion.div>

        {!isOpen && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping" />
        )}
      </button>
    </div>
  );
};

export default FloatingChat;
