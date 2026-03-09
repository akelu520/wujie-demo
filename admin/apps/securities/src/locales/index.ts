import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './zh-CN';
import en from './en';
import zhTW from './zh-TW';

const savedLang = localStorage.getItem('admin-language') ?? 'zh-CN';

i18next.use(initReactI18next).init({
  resources: {
    'zh-CN': { translation: zhCN },
    en: { translation: en },
    'zh-TW': { translation: zhTW },
  },
  lng: savedLang,
  fallbackLng: 'zh-CN',
  interpolation: { escapeValue: false },
});

export default i18next;
