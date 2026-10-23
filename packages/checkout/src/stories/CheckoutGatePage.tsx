import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { useSignInRequired } from '#checkout/hooks/useSignInRequired';
import { CheckoutFormPage } from './CheckoutFormPage';

/**
 * The checkout page with the sign-in gate of `Checkout` (`useSignInRequired`): a store that
 * takes orders from accounts only signs the buyer in in place of the contact first (A1–A2, S6).
 */
export function CheckoutGatePage({
  signInOpen = false,
}: {
  /** The sign-in drawer is open from the start. */
  signInOpen?: boolean;
}) {
  const { checkout } = useCheckoutData();
  const signInRequired = useSignInRequired(checkout?.id ?? null);
  return (
    <CheckoutFormPage signInRequired={signInRequired} signInOpen={signInOpen} />
  );
}
