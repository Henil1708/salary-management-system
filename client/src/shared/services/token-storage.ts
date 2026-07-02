// Tokens live in web storage — a documented trade-off for the cross-origin
// Vercel/Render split (docs/TRADEOFFS.md §4), not an oversight.
// "Remember me" picks the store: localStorage persists across browser
// restarts; sessionStorage ends with the tab session.
const ACCESS_TOKEN_KEY = 'salary.accessToken';
const REFRESH_TOKEN_KEY = 'salary.refreshToken';

const stores = [localStorage, sessionStorage];

const read = (key: string): string | null =>
  stores.map((store) => store.getItem(key)).find((value) => value !== null) ?? null;

export const tokenStorage = {
  getAccessToken: (): string | null => read(ACCESS_TOKEN_KEY),
  getRefreshToken: (): string | null => read(REFRESH_TOKEN_KEY),
  setTokens: (accessToken: string, refreshToken: string, remember?: boolean): void => {
    // refresh keeps the tokens wherever they already live; login sets anew
    const target =
      remember === undefined
        ? sessionStorage.getItem(REFRESH_TOKEN_KEY) !== null
          ? sessionStorage
          : localStorage
        : remember
          ? localStorage
          : sessionStorage;
    tokenStorage.clear();
    target.setItem(ACCESS_TOKEN_KEY, accessToken);
    target.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear: (): void => {
    for (const store of stores) {
      store.removeItem(ACCESS_TOKEN_KEY);
      store.removeItem(REFRESH_TOKEN_KEY);
    }
  },
  hasTokens: (): boolean =>
    Boolean(read(ACCESS_TOKEN_KEY) && read(REFRESH_TOKEN_KEY)),
};
