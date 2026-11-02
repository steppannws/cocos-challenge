import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import en from './locales/en.json';
import es from './locales/es.json';

export const resources = { es: { translation: es }, en: { translation: en } } as const;
export type Language = keyof typeof resources;

const supported = Object.keys(resources) as Language[];
const isSupported = (code: string | undefined): code is Language =>
  code !== undefined && (supported as string[]).includes(code);

const deviceLanguage = getLocales()[0]?.languageCode;

void i18n.use(initReactI18next).init({
  resources,
  lng: isSupported(deviceLanguage) ? deviceLanguage : 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
});

export default i18n;
