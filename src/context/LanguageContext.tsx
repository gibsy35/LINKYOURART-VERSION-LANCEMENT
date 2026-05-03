
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import en from '../locales/en.json';
import fr from '../locales/fr.json';

type Language = 'EN' | 'FR';

const dictionaries = {
  EN: en,
  FR: fr,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyOrEn: string, fr?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get from localStorage or browser language
    const saved = localStorage.getItem('lya_language') as Language;
    if (saved && (saved === 'EN' || saved === 'FR')) return saved;
    
    const browserLang = navigator.language.split('-')[0].toUpperCase();
    return browserLang === 'FR' ? 'FR' : 'EN';
  });

  useEffect(() => {
    localStorage.setItem('lya_language', language);
    document.documentElement.lang = language.toLowerCase();
  }, [language]);

  const t = (keyOrEn: string, frText?: string) => {
    // 1. Check if it's a key in the dictionary (e.g., "common.dashboard")
    const keys = keyOrEn.split('.');
    let translation: any = dictionaries[language];
    
    for (const key of keys) {
      if (translation && translation[key]) {
        translation = translation[key];
      } else {
        translation = null;
        break;
      }
    }

    if (typeof translation === 'string') return translation;

    // 2. Fallback to the manual strings if provided
    if (frText !== undefined) {
      return language === 'EN' ? keyOrEn : frText;
    }

    // 3. Last resort: return the key itself
    return keyOrEn;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
