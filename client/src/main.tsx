import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRouter } from '@/app/router';
import { Providers } from '@/app/providers';
import { store } from '@/app/store/store';
import { logout, restoreSession } from '@/features/auth';
import { setSessionExpiredHandler } from '@/shared/services/api-client';
import '@/styles/globals.css';

// a failed silent refresh anywhere in the app ends the session
setSessionExpiredHandler(() => store.dispatch(logout()));
// tokens in storage → validate them against /auth/me before rendering guards
void store.dispatch(restoreSession());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <AppRouter />
    </Providers>
  </StrictMode>
);
