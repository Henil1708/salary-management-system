import { useEffect, useState } from 'react';

// Delays a value so a fast-typing search box fires one request, not one
// per keystroke (used by the directory search).
export const useDebounce = <T>(value: T, delayMs = 350): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
};
