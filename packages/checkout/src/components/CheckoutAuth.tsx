'use client';

import { useEffect } from 'react';
import { AuthDialog, AuthUIProvider } from '@shopana/storefront-auth/ui';
import { useAuthResult } from '@shopana/storefront-sdk/modules/session/react';
import { useCheckoutTheme } from '#checkout/theme';
import {
  useCheckoutAuth,
  useSaveCheckoutInput,
} from '#checkout/hooks/useCheckoutAuth';
import { useAuthDialogStore } from '#checkout/state/authDialogStore';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { CHECKOUT_AUTH_COMPONENTS } from '#checkout/components/notices/AuthConsent';

export interface CheckoutAuthProps {
  /** Optional className applied to the theme's sign-in control */
  className?: string;
}

/**
 * Renders the theme's sign-in control next to the contact section: "Log in" for a guest,
 * "Signed in as" with "Log out" for a signed-in buyer. "Log in" opens the sign-in drawer.
 */
export const CheckoutAuth = ({ className }: CheckoutAuthProps) => {
  const { Auth } = useCheckoutTheme();
  const auth = useCheckoutAuth();
  return (
    <>
      <Auth className={className} {...auth} />
      <CheckoutAuthDialog />
    </>
  );
};

/**
 * Sign-in of the guest checkout (G1–G3): a drawer on the right, a bottom sheet on a phone. It
 * starts from the email or phone of the contact and closes once signed in (G4).
 */
export const CheckoutAuthDialog = () => {
  const open = useAuthDialogStore((state) => state.open);
  const setOpen = useAuthDialogStore((state) => state.setOpen);
  const { checkout } = useCheckoutData();
  const saveInput = useSaveCheckoutInput();
  const identity = checkout?.customerIdentity;
  // Back from a social provider without a session, the drawer opens to say why.
  const { result } = useAuthResult();
  useEffect(() => {
    if (result) setOpen(true);
  }, [result, setOpen]);
  return (
    // The consent under the field is the checkout's own: its policy opens over the checkout,
    // as in the notice under the submit button.
    <AuthUIProvider components={CHECKOUT_AUTH_COMPONENTS}>
      <AuthDialog
        context="checkoutGuest"
        open={open}
        onClose={() => setOpen(false)}
        defaultIdentifier={{ email: identity?.email, phone: identity?.phone }}
        beforeSocial={saveInput}
      />
    </AuthUIProvider>
  );
};

export default CheckoutAuth;
