'use client';

import NextLink from 'next/link';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { useLocalization } from '@shopana/storefront-sdk/modules/localization/react';
import type { HrefTarget } from '@shopana/storefront-sdk/routing';

export type LinkProps = Omit<ComponentPropsWithoutRef<typeof NextLink>, 'href'> & {
  /**
   * A pathname without the locale segment, a named route (`{ route, params, query }`) or an
   * absolute URL. Storefront paths get the locale segment of the active locale.
   */
  href: HrefTarget;
};

/** `next/link` that keeps the active locale in storefront paths. */
const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, ...props },
  ref
) {
  const { buildHref } = useLocalization();
  return <NextLink ref={ref} href={buildHref(href)} {...props} />;
});

export default Link;
export { Link };
