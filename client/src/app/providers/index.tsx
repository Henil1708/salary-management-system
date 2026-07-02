import { ReactNode } from 'react';
import { I18nProvider } from './i18n-provider';
import { ReduxProvider } from './redux-provider';
import { ThemeProvider } from './theme-provider';

export const Providers = ({ children }: { children: ReactNode }) => (
  <ReduxProvider>
    <ThemeProvider>
      <I18nProvider>{children}</I18nProvider>
    </ThemeProvider>
  </ReduxProvider>
);
