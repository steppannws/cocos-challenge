import 'i18next';
import type es from './locales/es.json';

// A missing key is a type error, in every locale (en must mirror es).
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof es };
  }
}
