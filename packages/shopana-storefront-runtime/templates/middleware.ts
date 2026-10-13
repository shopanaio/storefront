import runtimeMiddleware from '@src/runtime/middleware';
import type { NextRequest } from '@shopana/storefront/next/middleware';

export default function middleware(request: NextRequest) {
  return runtimeMiddleware(request);
}

export const config = {
  matcher:
    '/((?!api|trpc|_next|_vercel|embed|demo-framework|.*\\.(?:avif|css|gif|ico|jpeg|jpg|js|json|map|mjs|mp4|pdf|png|svg|txt|webmanifest|webp|woff|woff2|xml)$).*)',
};
