import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Consume the shared workspace from source — Vite compiles the TS
      // directly, so client dev/build never depends on a prebuilt shared/dist
      // (the server still consumes the CJS dist)
      '@salary/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
});
