export const BASE_DATA = {
  fr_fr: {
    location_code: 2250,
    language_code: "fr",
  },
  com_en: {
    location_code: 2840,
    language_code: "en",
  },
  co_uk_fr: {
    location_code: 2826,
    language_code: "en",
  },
  ca_en: {
    location_code: 2124,
    language_code: "en",
  },
  ca_fr: {
    location_code: 2124,
    language_code: "fr",
  },
  de_de: {
    location_code: 2276,
    language_code: "de",
  },
  es_es: {
    location_code: 2724,
    language_code: "es",
  },
  it_it: {
    location_code: 2380,
    language_code: "it",
  },
  ch_fr: {
    location_code: 2756,
    language_code: "fr",
  },
  ch_de: {
    location_code: 2756,
    language_code: "de",
  },
  be_fr: {
    location_code: 2056,
    language_code: "fr",
  },
  be_nl: {
    location_code: 2056,
    language_code: "nl",
  },
  com_mx_s: {
    location_code: 2484,
    language_code: "es",
  },
  com_br_pt: {
    location_code: 2076,
    language_code: "pt",
  },
  com_ar_s: {
    location_code: 2032,
    language_code: "es",
  },
  com_tr_tr: {
    location_code: 2792,
    language_code: "tr",
  },
  co_ma_fr: {
    location_code: 2504,
    language_code: "fr",
  },
  se_sv: {
    location_code: 2752,
    language_code: "sv",
  },
  com_au_fr: {
    location_code: 2036,
    language_code: "en",
  },
  co_il_iw: {
    location_code: 2376,
    language_code: "iw",
  },
  pl_pl: {
    location_code: 2616,
    language_code: "pl",
  },
  cl_e: {
    location_code: 2152,
    language_code: "en",
  },
  nl_nl: {
    location_code: 2528,
    language_code: "nl",
  },
  lu_de: {
    location_code: 2442,
    language_code: "de",
  },
  lu_fr: {
    location_code: 2442,
    language_code: "fr",
  },
  sn_fr: {
    location_code: 2686,
    language_code: "fr",
  },
  cm_en: {
    location_code: 2120,
    language_code: "en",
  },
  co_jp_ja: {
    location_code: 2392,
    language_code: "ja",
  },
  ru_ru: {
    location_code: 2643,
    language_code: "ru",
  },
  co_za_fr: {
    location_code: 2710,
    language_code: "fr",
  },
  at_de: {
    location_code: 2040,
    language_code: "de",
  },
  com_co_es: {
    location_code: 2170,
    language_code: "es",
  },
  gr_el: {
    location_code: 2300,
    language_code: "el",
  },
  co_nz_fr: {
    location_code: 2554,
    language_code: "en",
  },
  co_in_fr: {
    location_code: 2356,
    language_code: "en",
  },
  com_hk_zh: {
    location_code: 2344,
    language_code: "zh",
  },
  ie_fr: {
    location_code: 2372,
    language_code: "en",
  },
  com_sg_fr: {
    location_code: 2702,
    language_code: "en",
  },
  cz_cs: {
    location_code: 2203,
    language_code: "cs",
  },
  sk_sk: {
    location_code: 2703,
    language_code: "sk",
  },
  lt_lt: {
    location_code: 2440,
    language_code: "lt",
  },
  pt_pt: {
    location_code: 2620,
    language_code: "pt",
  },
  com_my_ms: {
    location_code: 2458,
    language_code: "ms",
  },
  dk_da: {
    location_code: 2208,
    language_code: "da",
  },
  co_kr_ko: {
    location_code: 2410,
    language_code: "ko",
  },
  fi_fi: {
    location_code: 2246,
    language_code: "fi",
  },
  ge_ka: {
    location_code: 2268,
    language_code: "ka",
  },
  co_id_id: {
    location_code: 2360,
    language_code: "id",
  },
  no_no: {
    location_code: 2578,
    language_code: "no",
  },
  ro_ro: {
    location_code: 2642,
    language_code: "ro",
  },
  custom: {
    location_code: 2840,
    language_code: "en",
  },
};

export const RANK_RANGES = [
  { label: "1-3", min: 1, max: 3 },
  { label: "4-10", min: 4, max: 10 },
  { label: "11-20", min: 11, max: 20 },
  { label: "21-30", min: 21, max: 30 },
  { label: "31-50", min: 31, max: 50 },
  { label: ">50", min: 51, max: Infinity },
];

export function getRangeColor(idx: number) {
  if (idx === 0) return "#22C55E";
  if (idx === 1) return "#84CC16";
  if (idx === 2) return "#FACC15";
  if (idx === 3) return "#FB923C";
  if (idx === 4) return "#F97316";
  if (idx === 5) return "#EF4444";
  return "#D1FAE5";
}

export const TTF_COLOR_DATA = {
  Arts: "#FF6700",
  Business: "#C5C88E",
  Computers: "#FF3333",
  Games: "#557832",
  Health: "#000099",
  Home: "#DD9955",
  News: "#76D54B",
  Recreation: "#89C7CB",
  Reference: "#C84770",
  Science: "#6BD39A",
  Shopping: "#660000",
  Society: "#7A69CD",
  Sports: "#55355D",
  Regional: "#F582B9",
  Adult: "#333333",
  World: "#557777",
};
