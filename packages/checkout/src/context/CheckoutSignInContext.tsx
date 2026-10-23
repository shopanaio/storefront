'use client';

import { createContext, useContext } from 'react';
import type { RefObject } from 'react';
import type { AuthInlineHandle } from '@shopana/storefront-auth/ui';

/** The sign-in of the checkout page, as `CheckoutSignInProvider` mounts it. */
export interface CheckoutSignInValue {
  /**
   * The sign-in stands in place of the contact and the other sections (A1–A2, S6;
   * `useSignInRequired`); otherwise it is a drawer over the page.
   */
  required: boolean;
  /**
   * Leads the buyer to the sign-in from anywhere on the page ("Log in", the points the order
   * earns, a loyalty banner): opens the drawer, or brings the inline form into view and focuses
   * its field. Nothing without customer accounts.
   */
  requestSignIn: () => void;
  /** Handle of the inline sign-in; `CheckoutSignInRequired` sets it. */
  inlineRef: RefObject<AuthInlineHandle | null>;
}

export const CheckoutSignInContext = createContext<CheckoutSignInValue>({
  required: false,
  requestSignIn: () => undefined,
  inlineRef: { current: null },
});

/** The sign-in of the checkout page; outside a checkout page there is none to lead to. */
export function useCheckoutSignIn(): CheckoutSignInValue {
  return useContext(CheckoutSignInContext);
}
