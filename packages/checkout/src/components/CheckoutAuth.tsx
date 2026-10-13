'use client';

import { useCheckoutTheme } from '#checkout/theme';

export interface CheckoutAuthProps {
  /** Optional className applied to the login button */
  className?: string;
}

/**
 * Renders a login button and mounts the authentication modal.
 * When the button is clicked, the modal becomes visible.
 */
export const CheckoutAuth = ({ className }: CheckoutAuthProps) => {
  const { Auth } = useCheckoutTheme();
  return <Auth className={className} />;
};

export default CheckoutAuth;
