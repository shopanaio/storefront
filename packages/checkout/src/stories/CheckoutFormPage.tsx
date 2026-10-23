import '#checkout/vendors/address-ua/register';
import '#checkout/vendors/liqpay/register';
import '#checkout/vendors/nova-poshta/register';
import { useTranslations } from 'next-intl';
import { CheckoutView } from '#checkout/components/CheckoutView';

/**
 * The real checkout page against the mock API (`mockCheckout`) and the mock directory
 * (`withDirectory`): every section and the summary as the buyer sees them, nothing drawn for
 * the story. Placing the order is refused.
 */
export function CheckoutFormPage({
  signInRequired = false,
}: {
  signInRequired?: boolean;
}) {
  const t = useTranslations('Checkout');
  return (
    <CheckoutView
      brand={<strong>Storefront</strong>}
      features={{ auth: true, country: 'UA' }}
      onSubmit={(event) => event.preventDefault()}
      t={t}
      signInRequired={signInRequired}
    />
  );
}
