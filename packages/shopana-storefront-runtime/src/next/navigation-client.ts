'use client';

import {
  usePathname as useNextPathname,
  useRouter as useNextRouter,
} from 'next/navigation';
import { useMemo } from 'react';
import { useLocalization } from '@shopana/storefront-sdk/modules/localization/react';
import type { HrefTarget } from '@shopana/storefront-sdk/routing';

type NextRouter = ReturnType<typeof useNextRouter>;
type NavigateOptions = Parameters<NextRouter['push']>[1];
type PrefetchOptions = Parameters<NextRouter['prefetch']>[1];

export interface StorefrontRouter extends Omit<NextRouter, 'push' | 'replace' | 'prefetch'> {
  push(href: HrefTarget, options?: NavigateOptions): void;
  replace(href: HrefTarget, options?: NavigateOptions): void;
  prefetch(href: HrefTarget, options?: PrefetchOptions): void;
}

/** Router whose navigations keep the active locale in storefront paths. */
export function useRouter(): StorefrontRouter {
  const router = useNextRouter();
  const { buildHref } = useLocalization();
  return useMemo(
    () => ({
      ...router,
      push: (href, options) => router.push(buildHref(href), options),
      replace: (href, options) => router.replace(buildHref(href), options),
      prefetch: (href, options) => router.prefetch(buildHref(href), options),
    }),
    [buildHref, router]
  );
}

/** Current pathname without the locale segment. */
export function usePathname(): string {
  const pathname = useNextPathname();
  const { stripLocale } = useLocalization();
  return stripLocale(pathname);
}
