import { fileURLToPath } from 'node:url';
import { createRuntimeViteConfig } from '@shopana/storefront/react-router/vite';

export default createRuntimeViteConfig({
  runtimeDir: fileURLToPath(new URL('.', import.meta.url)),
});
