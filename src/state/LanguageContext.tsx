import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations, type Language } from "../i18n/translations";

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const LANGUAGE_KEY = "app_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("nl");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (stored === "nl" || stored === "en") {
          setLanguage(stored);
        }
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const changeLanguage = async (lang: Language) => {
    setLanguage(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  };

  const value = useMemo(
    () => ({ language, setLanguage: changeLanguage }),
    [language]
  );

  if (!loaded) return null;

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

/**
 * t("home.play") -> string
 */
export function useT() {
  const { language } = useLanguage();

  const t = (key: string) => {
    const parts = key.split(".");
    let obj: any = translations[language];
    for (const p of parts) obj = obj?.[p];
    return typeof obj === "string" ? obj : key; // fallback = key
  };

  return { t, language };
}
