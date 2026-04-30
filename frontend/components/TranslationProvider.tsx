"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  isInitialized: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 1. Add Google Translate Script
    const addScript = () => {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    };

    // 2. Initialize Google Translate
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,am,om',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );
      setIsInitialized(true);
    };

    if (!window.google) {
      addScript();
    } else {
      setIsInitialized(true);
    }

    // Load saved language
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    setLanguage(savedLang);
  }, []);

  const changeLanguage = (langCode: string) => {
    setLanguage(langCode);
    localStorage.setItem('selectedLanguage', langCode);

    // Google Translate works by setting a cookie 'googtrans'
    // Format: /source_lang/target_lang
    const googleTransCookie = `/en/${langCode}`;
    document.cookie = `googtrans=${googleTransCookie}; path=/;`;
    document.cookie = `googtrans=${googleTransCookie}; path=/; domain=.${window.location.hostname};`;
    
    // Also trigger the internal widget if possible, or just reload
    // Reloading is the most reliable way to ensure all nodes are translated
    window.location.reload();
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage: changeLanguage, isInitialized }}>
      <div id="google_translate_element" style={{ display: 'none' }} />
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

// Add types for window to avoid TS errors with the Google Translate script
interface GoogleTranslateWindow extends Window {
  google: any;
  googleTranslateElementInit: () => void;
}

declare const window: GoogleTranslateWindow;
