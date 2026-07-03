import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { I18nProvider } from './i18n-provider';
import { ReduxProvider } from './redux-provider';
import { ThemeProvider } from './theme-provider';

export const Providers = ({ children }: { children: ReactNode }) => (
  <ReduxProvider>
    <ThemeProvider>
      <I18nProvider>
        {children}
        <Toaster richColors position="top-right" />
      </I18nProvider>
    </ThemeProvider>
  </ReduxProvider>
);
