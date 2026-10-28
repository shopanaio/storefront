'use client';

import { forwardRef, type MouseEvent } from 'react';
import { Link as RouterLink } from 'react-router';
import { useLocalization } from '@shopana/storefront-sdk/modules/localization/react';
import type { LinkComponent, LinkProps } from '../core/facade-types';
import { isOwnClick } from '../core/link-click';
import {
  createNavigationTarget,
  useNavigationScope,
} from '../core/navigation-scope';

export type { LinkProps };

/**
 * React Router `Link` that keeps the active locale in storefront paths and prefetches the page
 * when the pointer rests on it; an absolute URL of another site is a plain anchor. Inside a NavigationScope it is a plain anchor with no
 * router behind it: a plain click goes to the scope, and the real href stays for crawlers, new
 * tabs and long-press menus. A click the scope does not take is followed by the browser.
 */
const Link: LinkComponent = forwardRef<HTMLAnchorElement, LinkProps>(
  function Link(
    { href, onClick, replace, target, download, prefetch, scroll, ...props },
    ref
  ) {
    const { buildHref, stripLocale } = useLocalization();
    const onNavigate = useNavigationScope();
    const localizedHref = buildHref(href);

    if (!onNavigate) {
      return (
        <RouterLink
          ref={ref}
          to={localizedHref}
          onClick={onClick}
          replace={replace}
          target={target}
          download={download}
          prefetch={prefetch === false ? 'none' : 'intent'}
          preventScrollReset={scroll === false}
          {...props}
        />
      );
    }

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || isOwnClick(event, target, download)) return;

      const navigationTarget = createNavigationTarget(
        localizedHref,
        stripLocale,
        { replace: Boolean(replace), source: 'link' }
      );
      if (navigationTarget && onNavigate(navigationTarget)) {
        event.preventDefault();
      }
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
  }
);

export default Link;
export { Link };
