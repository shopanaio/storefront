'use client';

import type { ReactNode } from 'react';
import {
  AuthUIProvider,
  DefaultLegal,
  useAuthUI,
  type AuthFlowProps,
  type AuthUIComponents,
} from '@shopana/storefront-auth/ui';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { useSaveCheckoutInput } from '#checkout/hooks/useCheckoutAuth';
import { AuthConsent } from '#checkout/components/notices/AuthConsent';

/** What the checkout changes in the sign-in: its consent, linked like its own notice. */
const CHECKOUT_AUTH_COMPONENTS: Partial<AuthUIComponents> = {
  Legal: AuthConsent,
};

/**
 * The sign-in screens of the checkout. The consent under the field is the checkout's own
 * (`AuthConsent`): its policy opens over the checkout. A host that set a `Legal` of its own in
 * an `AuthUIProvider` above the checkout keeps it: the checkout changes only the default one.
 */
export const CheckoutAuthUI = ({ children }: { children: ReactNode }) => {
  const { components } = useAuthUI();
  if (components.Legal !== DefaultLegal) return children;
  return (
    <AuthUIProvider components={CHECKOUT_AUTH_COMPONENTS}>
      {children}
    </AuthUIProvider>
  );
};

/**
 * What every sign-in of the checkout starts from: the email or phone of the contact, and the
 * typed input saved before the buyer leaves for a social provider.
 */
export function useCheckoutAuthFlowProps(): Pick<
  AuthFlowProps,
  'defaultIdentifier' | 'beforeSocial'
> {
  const { checkout } = useCheckoutData();
  const beforeSocial = useSaveCheckoutInput();
  const identity = checkout?.customerIdentity;
  return {
    defaultIdentifier: { email: identity?.email, phone: identity?.phone },
    beforeSocial,
  };
}
