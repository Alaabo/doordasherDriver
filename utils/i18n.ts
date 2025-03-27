import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from '../locales/en.json';
import ar from '../locales/ar.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: Localization.locale.startsWith('ar') ? 'ar' : 'en', // Set initial language
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;


export const switchLanguage = (lang: 'en' | 'ar') => {
    i18n.changeLanguage(lang);
  };

