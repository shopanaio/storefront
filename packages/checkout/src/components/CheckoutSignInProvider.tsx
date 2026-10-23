'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthInlineHandle } from '@shopana/storefront-auth/ui';
import { CheckoutSignInContext } from '#checkout/context/CheckoutSignInContext';
import type { CheckoutSignInValue } from '#checkout/context/CheckoutSignInContext';
import { useCheckoutTheme } from '#checkout/theme';
import { CheckoutAuthDialog } from './CheckoutAuth';

export interface CheckoutSignInProviderProps {
  /** The sign-in stands in place of the contact (`useSignInRequired`). */
  required: boolean;
  /** The drawer is open from the start (a story of it). */
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * The one sign-in of the checkout page and `requestSignIn()` for everything that leads to it.
 * While the sign-in is required it is the inline form in place of the contact; otherwise, with
 * customer accounts (`theme.customerAccountsEnabled`), the sign-in drawer mounted here.
 */
export const CheckoutSignInProvider = ({
  required,
  defaultOpen = false,
  children,
}: CheckoutSignInProviderProps) => {
  const { customerAccountsEnabled } = useCheckoutTheme();
  const inlineRef = useRef<AuthInlineHandle>(null);
  const [open, setOpen] = useState(defaultOpen);
  const drawer = customerAccountsEnabled && !required;

  const requestSignIn = useCallback(() => {
    if (required) {
      const inline = inlineRef.current;
      inline?.element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      inline?.focus({ preventScroll: true });
    } else if (drawer) {
      setOpen(true);
    }
  }, [required, drawer]);
  const close = useCallback(() => setOpen(false), []);

  const value = useMemo<CheckoutSignInValue>(
    () => ({ required, requestSignIn, inlineRef }),
    [required, requestSignIn]
  );
  return (
    <CheckoutSignInContext.Provider value={value}>
      {children}
      {drawer ? <CheckoutAuthDialog open={open} onClose={close} /> : null}
    </CheckoutSignInContext.Provider>
  );
};
