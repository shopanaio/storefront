import { createRuntimeNotFound } from '@shopana/storefront/next/not-found';
import { environmentConfig } from '@src/config/environment.config';
import { runtimePages } from '@src/runtime/pages';

const { NotFound } = createRuntimeNotFound({
  environmentConfig,
  pages: runtimePages,
});

export default NotFound;
