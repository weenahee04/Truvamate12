
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '../constants/translations';

type Language = 'TH' | 'EN' | 'ES' | 'FR' | 'DE' | 'IT' | 'PT' | 'RU' | 'JA' | 'KO' | 'ZH' | 'AR' | 'HI' | 'ID' | 'VI' | 'MS' | 'TR';

export const LANGUAGES = [
  { code: 'TH' as const, name: 'ไทย', flag: '🇹🇭' },
  { code: 'EN' as const, name: 'English', flag: '🇺🇸' },
  { code: 'ES' as const, name: 'Español', flag: '🇪🇸' },
  { code: 'FR' as const, name: 'Français', flag: '🇫🇷' },
  { code: 'DE' as const, name: 'Deutsch', flag: '🇩🇪' },
  { code: 'IT' as const, name: 'Italiano', flag: '🇮🇹' },
  { code: 'PT' as const, name: 'Português', flag: '🇵🇹' },
  { code: 'RU' as const, name: 'Русский', flag: '🇷🇺' },
  { code: 'JA' as const, name: '日本語', flag: '🇯🇵' },
  { code: 'KO' as const, name: '한국어', flag: '🇰🇷' },
  { code: 'ZH' as const, name: '中文', flag: '🇨🇳' },
  { code: 'AR' as const, name: 'العربية', flag: '🇸🇦' },
  { code: 'HI' as const, name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ID' as const, name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'VI' as const, name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'MS' as const, name: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'TR' as const, name: 'Türkçe', flag: '🇹🇷' }
];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'truvamate_language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved as Language) || 'TH';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const t = (path: string): string => {
    const keys = path.split('.');
    let current: any = translations[language];
    
    for (const key of keys) {
      if (current[key] === undefined) {
        console.warn(`Translation missing for key: ${path} in language: ${language}`);
        return path;
      }
      current = current[key];
    }
    
    return current as string;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
