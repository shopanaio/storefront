'use client';

import NextLink from 'next/link';
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type MouseEvent,
} from 'react';
import { useLocalization } from '@shopana/storefront-sdk/modules/localization/react';
import type { HrefTarget } from '@shopana/storefront-sdk/routing';
import {
  createNavigationTarget,
  useNavigationScope,
} from './navigation-scope';

export type LinkProps = Omit<ComponentPropsWithoutRef<typeof NextLink>, 'href'> & {
  /**
   * A pathname without the locale segment, a named route (`{ route, params, query }`) or an
   * absolute URL. Storefront paths get the locale segment of the active locale.
   */
  href: HrefTarget;
};

/** A click the browser should handle itself: new tab or window, download, other button. */
const isOwnClick = (
  event: MouseEvent<HTMLAnchorElement>,
  target: string | undefined,
  download: unknown
) =>
  event.button !== 0 ||
  event.metaKey ||
  event.ctrlKey ||
  event.shiftKey ||
  event.altKey ||
  (target !== undefined && target !== '_self') ||
  download !== undefined;

/**
 * `next/link` that keeps the active locale in storefront paths. Inside a NavigationScope a
 * plain click goes to the scope first; the anchor keeps its real href for crawlers, new
 * tabs and long-press menus, and is not prefetched since the scope loads pages itself.
 */
const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, onClick, prefetch, replace, target, download, ...props },
  ref
) {
  const { buildHref, stripLocale } = useLocalization();
  const onNavigate = useNavigationScope();
  const localizedHref = buildHref(href);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (!onNavigate || event.defaultPrevented) return;
    if (isOwnClick(event, target, download)) return;

    const navigationTarget = createNavigationTarget(localizedHref, stripLocale, {
      replace: Boolean(replace),
      source: 'link',
    });
    // Next's own click handler skips a prevented click.
    if (navigationTarget && onNavigate(navigationTarget)) event.preventDefault();
  };

  return (
    <NextLink
      ref={ref}
      href={localizedHref}
      onClick={handleClick}
      prefetch={onNavigate ? false : prefetch}
      replace={replace}
      target={target}
      download={download}
      {...props}
    />
  );
});

export default Link;
export { Link };
