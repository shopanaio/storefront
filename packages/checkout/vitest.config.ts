import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '#checkout': path.join(packageDir, 'src'),
      // The shared primitives and the sign-in screens are tested from their sources.
      '@shopana/storefront-ui': path.join(packageDir, '../storefront-ui/src/index.ts'),
      '@shopana/storefront-auth/ui': path.join(packageDir, '../storefront-auth/src/ui/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
