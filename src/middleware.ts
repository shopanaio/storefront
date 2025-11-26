import createMiddleware from 'next-intl/middleware';
import { createSDKMiddleware } from '@shopana/storefront-sdk/next/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default createSDKMiddleware({
  middleware: intlMiddleware,
});

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|embed|demo-framework|.*\\..*).*)',
};
