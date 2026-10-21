import '#checkout/vendors/address-ua/register';
import '#checkout/vendors/liqpay/register';
import '#checkout/vendors/nova-poshta/register';
import { usePreloadModules } from '#checkout/infra/preloadModules';
import { AddressSection } from '#checkout/sections/address/components/Container';
import { DeliverySection } from '#checkout/sections/delivery/components/Container';
import { PaymentSection } from '#checkout/sections/payment/components/Container';
import { CheckoutPageShell } from './CheckoutPageShell';
import { useMockCheckout } from './mockCheckout';

/**
 * The checkout page with the delivery and payment sections as they work on the page: the city
 * of the address, the Nova Poshta services and the payment methods of LiqPay and Nova Poshta,
 * against the mock API (`mockCheckout`) and the mock directory (`withDirectory`).
 */
export function CheckoutFormPage() {
  const checkout = useMockCheckout();
  usePreloadModules(checkout);
  if (!checkout) return null;
  return (
    <CheckoutPageShell
      checkout={checkout}
      delivery={
        <>
          <AddressSection />
          <DeliverySection />
        </>
      }
      payment={<PaymentSection />}
    />
  );
}
