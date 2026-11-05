import { useTranslation } from 'react-i18next';
import type { Locale } from '@/utils/format';

const locales: Record<string, Locale> = { es: 'es-AR', en: 'en-US' };

/** BCP 47 locale for Intl formatters, derived from the active UI language. */
export const useLocale = (): Locale => {
  const { i18n } = useTranslation();
  return locales[i18n.language] ?? 'es-AR';
};
