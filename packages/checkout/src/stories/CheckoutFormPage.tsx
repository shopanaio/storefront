import '#checkout/vendors/address-ua/register';
import '#checkout/vendors/liqpay/register';
import '#checkout/vendors/nova-poshta/register';
import { CheckoutView } from '#checkout/components/CheckoutView';
import { CheckoutSignInProvider } from '#checkout/components/CheckoutSignInProvider';

/**
 * The real checkout page against the mock API (`mockCheckout`) and the mock directory
 * (`withDirectory`): every section and the summary as the buyer sees them, nothing drawn for
 * the story. Placing the order is refused.
 */
export function CheckoutFormPage({
  signInRequired = false,
  signInOpen = false,
}: {
  /** The sign-in stands in place of the contact (`useSignInRequired`). */
  signInRequired?: boolean;
  /** The sign-in drawer is open from the start. */
  signInOpen?: boolean;
}) {
  return (
    <CheckoutSignInProvider required={signInRequired} defaultOpen={signInOpen}>
      <CheckoutView
        brand={<strong>Storefront</strong>}
        onSubmit={(event) => event.preventDefault()}
      />
    </CheckoutSignInProvider>
  );
}
