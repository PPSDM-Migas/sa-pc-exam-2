import { createI18n } from 'vue-i18n';
import id from './id.json'
import en from './en.json'

const i18n = createI18n({
  locale: localStorage.getItem('lang') || 'id',
  fallbackLocale: 'id',
  legacy: false,
  messages: {
    id: id,
    en: en,
  },
});

export default i18n;
