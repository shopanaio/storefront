'use client';

import type { ReactNode } from 'react';
import { InlineLink } from '@shopana/storefront-ui';
import type { PolicyModalPolicy } from './PolicyModal';

/**
 * A policy within a sentence: a link that opens the policy over the checkout. The link keeps
 * the policy page as its address, for a new tab. The notices of the checkout and the consent
 * of its sign-in use it.
 */
export const PolicyLink = ({
  policy,
  onOpen,
  children,
}: {
  policy: PolicyModalPolicy;
  onOpen: (policy: PolicyModalPolicy) => void;
  children: ReactNode;
}) => (
  <InlineLink
    color="default"
    underline
    href={policy.path}
    onClick={(event) => {
      // Inside the checkbox label a click on the link must not tick the box.
      event.preventDefault();
      event.stopPropagation();
      onOpen(policy);
    }}
  >
    {children}
  </InlineLink>
);
