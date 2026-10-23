'use client';

import { AuthDialog } from '@shopana/storefront-auth/ui';
import { useAuthResult } from '@shopana/storefront-sdk/modules/session/react';
import { useCheckoutTheme } from '#checkout/theme';
import { useCheckoutAuth } from '#checkout/hooks/useCheckoutAuth';
import { CheckoutAuthUI, useCheckoutAuthFlowProps } from './CheckoutAuthUI';

interface CheckoutAuthControlProps {
  /** Optional className applied to the theme's sign-in control */
  className?: string;
}

/**
 * Renders the theme's sign-in control next to the contact section: "Log in" for a guest,
 * "Signed in as" with "Log out" for a signed-in buyer. "Log in" opens the sign-in of the page
 * (`CheckoutSignInProvider`).
 */
export const CheckoutAuth = ({ className }: CheckoutAuthControlProps) => {
  const { Auth } = useCheckoutTheme();
  const auth = useCheckoutAuth();
  return <Auth className={className} {...auth} />;
};

/**
 * Sign-in of the guest checkout (G1–G3): a drawer on the right, a bottom sheet on a phone. It
 * starts from the email or phone of the contact and closes once signed in (G4). Back from a
 * social provider without a session, it is open to say why until closed.
 */
export const CheckoutAuthDialog = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const flowProps = useCheckoutAuthFlowProps();
  const { result, clear } = useAuthResult();
  return (
    <CheckoutAuthUI>
      <AuthDialog
        presentation="drawer"
        context="checkoutGuest"
        open={open || Boolean(result)}
        onClose={() => {
          clear();
          onClose();
        }}
        {...flowProps}
      />
    </CheckoutAuthUI>
  );
};
