/**
 * CheckoutRepository: transport-agnostic contract for Checkout mutations.
 * Decouples UI/orchestrator from a specific transport (GraphQL/REST).
 */
import type { SubmitCheckoutDto } from './dto';

export interface CheckoutRepository {
  /** Select payment method (user clicked a method). Data may be undefined. */
  selectPaymentMethod(input: { checkoutId: string; method: { code: string; data: unknown } }): Promise<void>;
  /** Update payment method when provider form becomes valid and has data. */
  updatePaymentMethod(input: { checkoutId: string; method: { code: string; data: unknown } }): Promise<void>;

  /** Select shipping method for a delivery group (user clicked a method). Data may be undefined. */
  selectShippingMethod(input: { checkoutId: string; deliveryGroupId: string; method: { code: string; data: unknown } }): Promise<void>;
  /** Update shipping method when provider form becomes valid and has data. */
  updateShippingMethod(input: { checkoutId: string; deliveryGroupId: string; method: { code: string; data: unknown } }): Promise<void>;

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
