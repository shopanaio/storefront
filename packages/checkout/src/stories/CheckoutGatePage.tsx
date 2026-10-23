import { useIsAuthenticated } from '@shopana/storefront-sdk/modules/session/react';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { CheckoutFormPage } from './CheckoutFormPage';

/**
 * The checkout page with the sign-in gate of `Checkout`: a store that takes orders from
 * accounts only signs the buyer in in place of the contact first (A1–A2, S6).
 */
export function CheckoutGatePage() {
  const { checkout } = useCheckoutData();
  const authenticated = useIsAuthenticated();
  return (
    <CheckoutFormPage
      signInRequired={Boolean(
        checkout && !checkout.guestCheckoutAllowed && !authenticated
      )}
    />
  );
}
