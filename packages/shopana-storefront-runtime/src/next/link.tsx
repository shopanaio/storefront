'use client';

import NextLink from 'next/link';
import { forwardRef, type MouseEvent } from 'react';
import { useLocalization } from '@shopana/storefront-sdk/modules/localization/react';
import type { LinkComponent, LinkProps } from '../core/facade-types';
import { isOwnClick } from '../core/link-click';
import {
  createNavigationTarget,
  useNavigationScope,
} from '../core/navigation-scope';

export type { LinkProps };

/**
 * `next/link` that keeps the active locale in storefront paths. Inside a NavigationScope it is
 * a plain anchor with no Next router behind it (no prefetch, no router click handling): a
 * plain click goes to the scope, and the real href stays for crawlers, new tabs and long-press
 * menus. A click the scope does not take is followed by the browser.
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
        <NextLink
          ref={ref}
          href={localizedHref}
          onClick={onClick}
          replace={replace}
          target={target}
          download={download}
          prefetch={prefetch}
          scroll={scroll}
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
