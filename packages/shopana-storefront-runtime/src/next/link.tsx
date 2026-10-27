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
 * `next/link` that keeps the active locale in storefront paths. Inside a NavigationScope it
 * is a plain anchor with no Next router behind it (no prefetch, no router click handling):
 * a plain click goes to the scope, and the real href stays for crawlers, new tabs and
 * long-press menus. A click the scope does not take is followed by the browser.
 */
const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    href,
    onClick,
    replace,
    target,
    download,
    // Next router options: meaningless for a plain anchor.
    prefetch,
    scroll,
    shallow,
    passHref,
    legacyBehavior,
    locale,
    onNavigate: onNextNavigate,
    ...props
  },
  ref
) {
  const { buildHref, stripLocale } = useLocalization();
  const onNavigate = useNavigationScope();
  const localizedHref = buildHref(href);

  if (!onNavigate) {
    return (
      <NextLink
        ref={ref}
        href={localizedHref}
        onClick={onClick}
        replace={replace}
        target={target}
        download={download}
        prefetch={prefetch}
        scroll={scroll}
        shallow={shallow}
        passHref={passHref}
        legacyBehavior={legacyBehavior}
        locale={locale}
        onNavigate={onNextNavigate}
        {...props}
      />
    );
  }

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || isOwnClick(event, target, download)) return;

    const navigationTarget = createNavigationTarget(localizedHref, stripLocale, {
      replace: Boolean(replace),
      source: 'link',
    });
    if (navigationTarget && onNavigate(navigationTarget)) event.preventDefault();
  };

  return (
    <a
      ref={ref}
      href={localizedHref}
      onClick={handleClick}
      target={target}
      download={download}
      {...props}
    />
  );
});

export default Link;
export { Link };
