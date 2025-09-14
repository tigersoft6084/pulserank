import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LanguageState {
  currentLocale: string;
  currentBase: string;
  setLocale: (locale: string) => void;
  setBase: (base: string) => void;
}

const initialState = {
  currentLocale: "en",
  currentBase: "com_en",
};

// Map locale to base
const localeToBase: Record<string, string> = {
  en: "com_en",
  fr: "fr_fr",
};

// Map base to locale
const baseToLocale: Record<string, string> = {
  com_en: "en",
  fr_fr: "fr",
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      ...initialState,

      setLocale: (currentLocale: string) => {
        const currentBase = localeToBase[currentLocale] || "com_en";
        set({ currentLocale, currentBase });
      },

      setBase: (currentBase: string) => {
        const currentLocale = baseToLocale[currentBase] || "en";
        set({ currentLocale, currentBase });
      },
    }),
    {
      name: "language-storage",
    },
  ),
);
