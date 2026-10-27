'use client';

import {
  usePathname as useNextPathname,
  useRouter as useNextRouter,
} from 'next/navigation';
import { useMemo } from 'react';
import { useLocalization } from '@shopana/storefront-sdk/modules/localization/react';
import type { HrefTarget } from '@shopana/storefront-sdk/routing';
import {
  createNavigationTarget,
  useNavigationScope,
} from './navigation-scope';

type NextRouter = ReturnType<typeof useNextRouter>;
type NavigateOptions = Parameters<NextRouter['push']>[1];
type PrefetchOptions = Parameters<NextRouter['prefetch']>[1];

export interface StorefrontRouter extends Omit<NextRouter, 'push' | 'replace' | 'prefetch'> {
  push(href: HrefTarget, options?: NavigateOptions): void;
  replace(href: HrefTarget, options?: NavigateOptions): void;
  prefetch(href: HrefTarget, options?: PrefetchOptions): void;
}

/**
 * Router whose navigations keep the active locale in storefront paths. Inside a
 * NavigationScope, push and replace go to the scope first and prefetching is off.
 */
export function useRouter(): StorefrontRouter {
  const router = useNextRouter();
  const { buildHref, stripLocale } = useLocalization();
  const onNavigate = useNavigationScope();

  return useMemo(() => {
    const takenByScope = (href: string, replace: boolean) => {
      if (!onNavigate) return false;
      const target = createNavigationTarget(href, stripLocale, {
        replace,
        source: 'router',
      });
      return target !== null && onNavigate(target);
    };

    return {
      ...router,
      push: (href, options) => {
        const localizedHref = buildHref(href);
        if (!takenByScope(localizedHref, false)) {
          router.push(localizedHref, options);
        }
      },
      replace: (href, options) => {
        const localizedHref = buildHref(href);
        if (!takenByScope(localizedHref, true)) {
          router.replace(localizedHref, options);
        }
      },
      prefetch: (href, options) => {
        if (!onNavigate) router.prefetch(buildHref(href), options);
      },
    };
  }, [buildHref, onNavigate, router, stripLocale]);
}

/** Current pathname without the locale segment. */
export function usePathname(): string {
  const pathname = useNextPathname();
  const { stripLocale } = useLocalization();
  return stripLocale(pathname);
}
