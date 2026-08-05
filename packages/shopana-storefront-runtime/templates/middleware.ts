import runtimeMiddleware from '@src/runtime/middleware';
import type { NextRequest } from '@shopana/storefront/next/middleware';

export default function middleware(request: NextRequest) {
  return runtimeMiddleware(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|embed|demo-framework|.*\\..*).*)',
};
