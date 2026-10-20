'use client';

import { useCheckoutTheme } from '#checkout/theme';
import { useCheckoutAuth } from '#checkout/hooks/useCheckoutAuth';

export interface CheckoutAuthProps {
  /** Optional className applied to the theme's sign-in control */
  className?: string;
}

/**
 * Renders the theme's sign-in control next to the contact section: "Log in" for a guest,
 * "Signed in as" with "Log out" for a signed-in buyer.
 */
export const CheckoutAuth = ({ className }: CheckoutAuthProps) => {
  const { Auth } = useCheckoutTheme();
  const auth = useCheckoutAuth();
  return <Auth className={className} {...auth} />;
};

export default CheckoutAuth;
