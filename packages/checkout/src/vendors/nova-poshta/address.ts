import type { ProviderDeliveryAddress } from '#checkout/vendors/types';
import type { Settlement } from './types';

/** Carrier code of the Nova Poshta app. */
export const NOVA_POSHTA = 'nova-poshta';

/**
 * Nova Poshta hint of a delivery address: the settlement picked in the directory.
 *
 * Current backend contract: `address.data.settlementRef` (delivery reads it as
 * `providerData.settlementRef`). B7 moves it to `address.data.carriers["nova-poshta"]`;
 * only this file changes then.
 */
export function settlementAddressData(settlement: Settlement) {
  return { settlementRef: settlement.ref };
}

/** Settlement ref of the address hint, or `null` when the address has none. */
export function readSettlementRef(
  address: ProviderDeliveryAddress | null | undefined
): string | null {
  const data = address?.data;
  if (!data || typeof data !== 'object') {
    return null;
  }
  const ref = (data as { settlementRef?: unknown }).settlementRef;
  return typeof ref === 'string' && ref.length > 0 ? ref : null;
}
