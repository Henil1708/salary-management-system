// Typed, fail-fast access to Vite env — a missing variable should break the
// build/boot loudly, not surface as undefined-URL fetches at runtime.
const required = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const env = {
  API_URL: required('VITE_API_URL', import.meta.env['VITE_API_URL'] as string | undefined),
} as const;
