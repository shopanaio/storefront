/**
 * CheckoutRepository: transport-agnostic contract for Checkout mutations.
 * Decouples UI/orchestrator from a specific transport (GraphQL/REST).
 */
import type { SubmitCheckoutDto } from './dto';

export interface CheckoutRepository {
  /** Select payment method for the checkout */
  selectPaymentMethod(input: { checkoutId: string; paymentMethodCode: string }): Promise<void>;

  /** Select delivery method for a specific delivery group */
  selectDeliveryMethod(input: { checkoutId: string; deliveryGroupId: string; shippingMethodCode: string }): Promise<void>;

  /** Update customer identity (phone for now) */
  updateCustomerIdentity(input: { checkoutId: string; phone: string }): Promise<void>;

  /** Update customer note */
  updateCustomerNote(input: { checkoutId: string; note: string }): Promise<void>;

  /** Promo codes */
  addPromoCode(input: { checkoutId: string; code: string }): Promise<void>;
  removePromoCode(input: { checkoutId: string; code: string }): Promise<void>;

  /** Addresses (optional for step 1; parity with existing API) */
  addDeliveryAddresses?(input: { checkoutId: string; addresses: unknown }): Promise<void>;
  updateDeliveryAddresses?(input: { checkoutId: string; addresses: unknown }): Promise<void>;
  removeDeliveryAddresses?(input: { checkoutId: string; addressIds: string[] }): Promise<void>;

  /** Submit checkout */
  submitCheckout?(input: { checkoutId: string; payload: SubmitCheckoutDto }): Promise<void>;
}
