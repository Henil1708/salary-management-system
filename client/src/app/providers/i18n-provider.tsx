import { ReactNode } from 'react';
import i18n from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { enLocale } from '@salary/shared';

// Resources come from @salary/shared — the same files the server's CSV-report
// translation reads. Adding a language later: import its file and register it
// here (docs/TRADEOFFS.md §5); no component changes.
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enLocale },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    // React already escapes; double-escaping would mangle text
    escapeValue: false,
  },
});

export const I18nProvider = ({ children }: { children: ReactNode }) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);

export default i18n;
