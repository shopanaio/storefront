'use client';

import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type MouseEvent,
} from 'react';
import { useLocalization } from '@shopana/storefront-sdk/modules/localization/react';
import {
  getStorefrontHistory,
  type HrefTarget,
} from '@shopana/storefront-sdk/routing';
import {
  createNavigationTarget,
  useNavigationScope,
} from './navigation-scope';
import { isServerOnlyPage } from './page-rendering';

export type LinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  /**
   * A pathname without the locale segment, a named route (`{ route, params, query }`) or an
   * absolute URL. Storefront paths get the locale segment of the active locale.
   */
  href: HrefTarget;
  /** The move replaces the current history entry instead of adding one. */
  replace?: boolean;
  /** False keeps the scroll position when the move opens another page. */
  scroll?: boolean;
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
 * An anchor that keeps the active locale in storefront paths, with no Next router behind it:
 * a plain click on a page of this site goes to the NavigationScope around it (the mobile
 * stack) or else to the storefront history, and the storefront page renders it on the client. The real
 * href stays for crawlers, new tabs and long-press menus; a click nothing takes is followed
 * by the browser.
 */
const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, onClick, replace, scroll, target, download, ...props },
  ref
) {
  const { buildHref, stripLocale } = useLocalization();
  const onNavigate = useNavigationScope();
  const localizedHref = buildHref(href);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || isOwnClick(event, target, download)) return;

    const navigationTarget = createNavigationTarget(localizedHref, stripLocale, {
      replace: Boolean(replace),
      source: 'link',
    });
    if (!navigationTarget) return;

    if (onNavigate) {
      if (onNavigate(navigationTarget)) event.preventDefault();
      return;
    }

    // A page only the server renders (a module page): the browser loads it.
    const history = getStorefrontHistory();
    if (!history || isServerOnlyPage(stripLocale(navigationTarget.url.pathname))) return;
    event.preventDefault();
    const state = scroll === false ? { scroll: false } : undefined;
    if (replace) history.replace(localizedHref, state);
    else history.push(localizedHref, state);
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
