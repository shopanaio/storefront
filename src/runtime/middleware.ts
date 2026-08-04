import createMiddleware from 'next-intl/middleware';
import { createRuntimeMiddleware } from '@shopana/storefront-runtime/next/middleware';
import { routing } from '../i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default createRuntimeMiddleware({
  middleware: intlMiddleware,
});
