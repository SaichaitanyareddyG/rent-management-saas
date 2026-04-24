/**
 * i18n Configuration
 * Multi-language support with auto-detection and persistence
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import en from './locales/en.json';
import hi from './locales/hi.json';
import te from './locales/te.json';
import ta from './locales/ta.json';
import kn from './locales/kn.json';
import mr from './locales/mr.json';

// Available languages
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
];

// Initialize i18n
i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next)  // Pass i18n down to react-i18next
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      te: { translation: te },
      ta: { translation: ta },
      kn: { translation: kn },
      mr: { translation: mr },
    },
    
    // Fallback language
    fallbackLng: 'en',
    
    // Default language
    lng: localStorage.getItem('language') || 'en',
    
    // Debug mode (set to false in production)
    debug: false,
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'language',
    },
    
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    // Allow missing keys to show the key name
    saveMissing: false,
    missingKeyHandler: (lngs, ns, key) => {
      console.warn(`Missing translation key: ${key}`);
    },
  });

// Save language changes to localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
  document.documentElement.lang = lng;
});

export default i18n;
