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
    try {
      const langTranslations = translations[language] as Record<string, string>;
      const translation = langTranslations[key];

      if (translation) {
        return translation;
      }

      // Fallback to English if current language doesn't have the key
      const enTranslations = translations['en'] as Record<string, string>;
      const enTranslation = enTranslations[key];

      if (enTranslation) {
        console.warn(`Translation missing for key "${key}" in language "${language}", using English fallback`);
        return enTranslation;
      }

      // Last resort: return a more user-friendly version of the key
      console.warn(`Translation missing for key "${key}" in both languages`);
      return key.replace('app.', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    } catch (error) {
      console.error('Translation error:', error);
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
