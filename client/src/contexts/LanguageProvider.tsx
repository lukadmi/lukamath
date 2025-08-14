import { useState, useEffect, ReactNode } from "react";
import { LanguageContext, type Language, translations } from "@/hooks/useLanguage";

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get saved language from localStorage
    try {
      const saved = localStorage.getItem('preferred-language');
      if (saved && (saved === 'en' || saved === 'hr')) {
        return saved as Language;
      }
    } catch (error) {
      console.warn('Failed to get language from localStorage:', error);
    }
    return 'en';
  });

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('preferred-language', language);
  }, [language]);

  const t = (key: string): string => {
    const langTranslations = translations[language] as Record<string, string>;
    return langTranslations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
