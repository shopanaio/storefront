import { useIsAuthenticated, useSessionExpired } from '@shopana/storefront-sdk/modules/session/react';
import { CheckoutSignInRequired } from '#checkout/components/CheckoutSignInRequired';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { CheckoutFormPage } from './CheckoutFormPage';

/**
 * The checkout page with the sign-in gate of `Checkout`: a store that takes orders from
 * accounts only signs the buyer in on the page first (A1–A2, S6), then shows the checkout.
 */
export function CheckoutGatePage() {
  const { checkout } = useCheckoutData();
  const authenticated = useIsAuthenticated();
  const expired = useSessionExpired();
  if (checkout && !checkout.guestCheckoutAllowed && !authenticated) {
    return (
      <CheckoutSignInRequired
        brand={<strong>Storefront</strong>}
        reason={expired ? 'expired' : 'required'}
      />
    );
  }
  return <CheckoutFormPage />;
}
