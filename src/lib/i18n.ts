import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import fr from "../locales/fr/common.json";
import en from "../locales/en/common.json";

i18next
  .use(LanguageDetector)
  .init({
    fallbackLng: "fr",
    supportedLngs: ["fr", "en"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
  });

export default i18next;