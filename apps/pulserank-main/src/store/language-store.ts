import { create } from "zustand";
import { persist } from "zustand/middleware";
import { baseToCountryCode } from "@/lib/utils/flag-utils";

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

// All available SERP bases from Prisma schema
export const ALL_SERP_BASES = [
  "fr_fr",
  "com_en",
  "co_uk_fr",
  "ca_en",
  "ca_fr",
  "de_de",
  "es_es",
  "it_it",
  "ch_fr",
  "ch_de",
  "be_fr",
  "be_nl",
  "com_mx_s",
  "com_br_pt",
  "com_ar_s",
  "com_tr_tr",
  "co_ma_fr",
  "se_sv",
  "com_au_fr",
  "co_il_iw",
  "pl_pl",
  "cl_e",
  "nl_nl",
  "lu_de",
  "lu_fr",
  "sn_fr",
  "cm_en",
  "co_jp_ja",
  "ru_ru",
  "co_za_fr",
  "at_de",
  "com_co_es",
  "gr_el",
  "co_nz_fr",
  "co_in_fr",
  "com_hk_zh",
  "ie_fr",
  "com_sg_fr",
  "cz_cs",
  "sk_sk",
  "lt_lt",
  "pt_pt",
  "com_my_ms",
  "dk_da",
  "co_kr_ko",
  "fi_fi",
  "ge_ka",
  "co_id_id",
  "no_no",
  "ro_ro",
  "custom",
] as const;

// Map base to language code (extracted from BASE_DATA)
const baseToLocale: Record<string, string> = {
  fr_fr: "fr",
  com_en: "en",
  co_uk_fr: "en",
  ca_en: "en",
  ca_fr: "fr",
  de_de: "de",
  es_es: "es",
  it_it: "it",
  ch_fr: "fr",
  ch_de: "de",
  be_fr: "fr",
  be_nl: "nl",
  com_mx_s: "es",
  com_br_pt: "pt",
  com_ar_s: "es",
  com_tr_tr: "tr",
  co_ma_fr: "fr",
  se_sv: "sv",
  com_au_fr: "en",
  co_il_iw: "iw",
  pl_pl: "pl",
  cl_e: "en",
  nl_nl: "nl",
  lu_de: "de",
  lu_fr: "fr",
  sn_fr: "fr",
  cm_en: "en",
  co_jp_ja: "ja",
  ru_ru: "ru",
  co_za_fr: "fr",
  at_de: "de",
  com_co_es: "es",
  gr_el: "el",
  co_nz_fr: "en",
  co_in_fr: "en",
  com_hk_zh: "zh",
  ie_fr: "en",
  com_sg_fr: "en",
  cz_cs: "cs",
  sk_sk: "sk",
  lt_lt: "lt",
  pt_pt: "pt",
  com_my_ms: "ms",
  dk_da: "da",
  co_kr_ko: "ko",
  fi_fi: "fi",
  ge_ka: "ka",
  co_id_id: "id",
  no_no: "no",
  ro_ro: "ro",
  custom: "en",
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      ...initialState,

      // Decoupled: update only UI locale preference without changing SERP base
      setLocale: (currentLocale: string) => {
        set({ currentLocale });
      },

      // Decoupled: update only SERP base selection without changing UI locale
      setBase: (currentBase: string) => {
        set({ currentBase });
      },
    }),
    {
      name: "language-storage",
    }
  )
);

// Helper function to get base display name
export function getBaseDisplayName(base: string): string {
  const countryCode = baseToCountryCode[base];
  if (!countryCode) return base;

  const countryNames: Record<string, string> = {
    FR: "France",
    US: "United States",
    GB: "United Kingdom",
    CA: "Canada",
    DE: "Germany",
    ES: "Spain",
    IT: "Italy",
    CH: "Switzerland",
    BE: "Belgium",
    MX: "Mexico",
    BR: "Brazil",
    AR: "Argentina",
    TR: "Turkey",
    MA: "Morocco",
    SE: "Sweden",
    AU: "Australia",
    IL: "Israel",
    PL: "Poland",
    CL: "Chile",
    NL: "Netherlands",
    LU: "Luxembourg",
    SN: "Senegal",
    CM: "Cameroon",
    JP: "Japan",
    RU: "Russia",
    ZA: "South Africa",
    AT: "Austria",
    CO: "Colombia",
    GR: "Greece",
    NZ: "New Zealand",
    IN: "India",
    HK: "Hong Kong",
    IE: "Ireland",
    SG: "Singapore",
    CZ: "Czech Republic",
    SK: "Slovakia",
    LT: "Lithuania",
    PT: "Portugal",
    MY: "Malaysia",
    DK: "Denmark",
    KR: "South Korea",
    FI: "Finland",
    GE: "Georgia",
    ID: "Indonesia",
    NO: "Norway",
    RO: "Romania",
  };

  return countryNames[countryCode] || base;
}

// Helper function to get language name for base
export function getLanguageNameForBase(base: string): string {
  const locale = baseToLocale[base];
  const languageNames: Record<string, string> = {
    en: "English",
    fr: "French",
    de: "German",
    es: "Spanish",
    it: "Italian",
    pt: "Portuguese",
    nl: "Dutch",
    sv: "Swedish",
    da: "Danish",
    fi: "Finnish",
    no: "Norwegian",
    pl: "Polish",
    cs: "Czech",
    sk: "Slovak",
    lt: "Lithuanian",
    ru: "Russian",
    tr: "Turkish",
    ja: "Japanese",
    ko: "Korean",
    zh: "Chinese",
    el: "Greek",
    ka: "Georgian",
    iw: "Hebrew",
    ms: "Malay",
    id: "Indonesian",
    ro: "Romanian",
  };

  return languageNames[locale] || locale;
}
