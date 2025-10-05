/**
 * Checkout event bus powered by Emittery.
 * Provides typed events for sections, providers, method selection, and submit lifecycle.
 * This module is intended to be used from client-side Checkout code.
 */
import Emittery from 'emittery';
import type { SectionDtoMap, ShippingSectionDto } from '@src/modules/checkout/core/contracts/dto';

/**
 * Unique identifier of a delivery group.
 */
export type DeliveryGroupId = string;

/**
 * Static section identifiers present regardless of delivery grouping.
 */
export type SectionId =
  | 'contact'
  | 'recipient'
  | 'address'
  | 'payment'
  | 'promo'
  | 'comment';

/**
 * Dynamic shipping section key bound to a specific delivery group.
 */
export type ShippingSectionId = `shipping:${DeliveryGroupId}`;

/**
 * Union of all section keys used across Checkout.
 */
export type SectionKey = SectionId | ShippingSectionId;

/**
 * Inflight operation key used by orchestrator to group async operations.
 */
export type InflightKey =
  | 'identity'
  | 'recipient'
  | 'address'
  | `shipping:${string}`
  | 'payment'
  | 'promo'
  | 'note';

/**
 * Static section keys that have corresponding DTOs in SectionDtoMap.
 */
export type StaticSectionKey = keyof SectionDtoMap;

/**
 * Resolve section DTO type by section key.
 * - Static keys use SectionDtoMap
 * - Dynamic shipping keys use ShippingSectionDto
 */
export type SectionDtoFor<K extends SectionKey> =
  K extends ShippingSectionId
    ? ShippingSectionDto
    : K extends StaticSectionKey
      ? SectionDtoMap[K]
      : never;

/**
 * Provider type domain: shipping or payment.
 */
export type ProviderType = 'shipping' | 'payment';

/**
 * Provider identifiers:
 * - Shipping provider is coupled with a delivery group: `shipping:${vendor}@${groupId}`
 * - Payment provider is global: `payment:${vendor}`
 */
export type ShippingProviderId = `shipping:${string}@${DeliveryGroupId}`;
export type PaymentProviderId = `payment:${string}`;
export type ProviderId = ShippingProviderId | PaymentProviderId;

/**
 * Aggregated payload emitted when Checkout is ready for submission.
 */
export type CheckoutPayload = {
  contact?: unknown;
  recipient?: unknown;
  deliveries?: Array<{
    groupId: DeliveryGroupId;
    methodCode: string;
    data: unknown;
  }>;
  address?: unknown;
  payment?: { methodCode: string; data: unknown };
  promo?: unknown;
  comment?: string;
};

/**
 * Typed map of all Checkout events and their payloads.
 */
export type CheckoutEvents = {
  'section/registered': { sectionId: SectionKey; required: boolean };
  'section/valid':
    | { sectionId: StaticSectionKey; dto: SectionDtoMap[StaticSectionKey] }
    | { sectionId: ShippingSectionId; dto: ShippingSectionDto };
  'section/invalid':
    | { sectionId: StaticSectionKey; dto?: SectionDtoMap[StaticSectionKey]; errors?: Record<string, string> }
    | { sectionId: ShippingSectionId; dto?: ShippingSectionDto; errors?: Record<string, string> };
  'section/reset': { sectionId: SectionKey };
  'section/unregistered': { sectionId: SectionKey };

  'provider/registered': { providerId: ProviderId; providerType: ProviderType };
  'provider/activated': { providerId: ProviderId };
  'provider/deactivated': { providerId: ProviderId };
  'provider/valid': { providerId: ProviderId; data: unknown };
  'provider/invalid': {
    providerId: ProviderId;
    errors?: Record<string, string>;
  };
  'provider/unregistered': { providerId: ProviderId };

  'method/shipping-selected': { groupId: DeliveryGroupId; code: string | null };
  'method/payment-selected': { code: string | null };

  'submit/requested': object;
  'submit/blocked': {
    missing: SectionKey[];
    errors?: Record<SectionKey, string[]>;
  };
  'submit/ready': { payload: CheckoutPayload };
  'submit/completed': object;
  /**
   * Operation lifecycle events for UI busy indicators.
   */
  'operation/start': { key: InflightKey; sectionId?: SectionKey };
  'operation/end': { key: InflightKey; sectionId?: SectionKey };
  /**
   * Operation error event for UI error indicators and toasts.
   * Consumers may map `sectionId` to local error presentation.
   */
  'operation/error': {
    key: InflightKey;
    sectionId?: SectionKey;
    /** Optional human-readable message */
    message?: string;
    /** Optional machine error code */
    code?: string;
    /**
     * Raw error object as-is for advanced consumers.
     * Keep it typed as unknown to avoid leaking transport-specific types.
     */
    error?: unknown;
  };
};

/**
 * Singleton event bus instance for Checkout module.
 */
export const checkoutBus = new Emittery<CheckoutEvents>();

/**
 * Subscribe to a specific Checkout event.
 * @param eventName - The event name to subscribe to.
 * @param listener - The listener invoked when the event is emitted.
 * @returns Unsubscribe function.
 */
export function onCheckoutEvent<K extends keyof CheckoutEvents>(
  eventName: K,
  listener: (eventData: CheckoutEvents[K]) => void | Promise<void>
) {
  return checkoutBus.on(eventName, listener);
}

/**
 * Emit a Checkout event with a typed payload.
 * @param eventName - The event name to emit.
 * @param eventData - The payload of the event.
 */
export function emitCheckoutEvent<K extends keyof CheckoutEvents>(
  eventName: K,
  eventData: CheckoutEvents[K]
): Promise<void> {
  return checkoutBus.emit(eventName, eventData);
}

/**
 * Enable verbose console logging for all checkout events.
 * Intended for development diagnostics only. Returns a function to unsubscribe.
 */
export function enableCheckoutBusDevLogging(): () => void {
  const unsubscribe = checkoutBus.onAny((eventName: keyof CheckoutEvents | string, eventData: unknown) => {
    const name = String(eventName);
    if (
      typeof console !== 'undefined' &&
      typeof (console as unknown as { groupCollapsed?: (...args: unknown[]) => void }).groupCollapsed === 'function'
    ) {
      (console as unknown as { groupCollapsed: (...args: unknown[]) => void; groupEnd?: () => void; log?: (...args: unknown[]) => void; trace?: () => void; }).groupCollapsed(`[checkoutBus] ${name}`);
      // eslint-disable-next-line no-console
      console.log(eventData);
      if (typeof (console as unknown as { trace?: () => void }).trace === 'function') {
        (console as unknown as { trace: () => void }).trace();
      }
      (console as unknown as { groupEnd?: () => void }).groupEnd?.();
    } else {
      // eslint-disable-next-line no-console
      console.log('[checkoutBus]', name, eventData);
    }
  });
  return () => {
    unsubscribe();
  };
}

// Auto-enable logging when explicitly requested via public env flag.
if (
  typeof process !== 'undefined' &&
  (process.env.NEXT_PUBLIC_CHECKOUT_LOG_EVENTS === '1' ||
    process.env.NEXT_PUBLIC_CHECKOUT_LOG_EVENTS === 'true')
) {
  try {
    enableCheckoutBusDevLogging();
  } catch {
    // no-op: logging is best-effort
  }
}
