import type { ProviderDeliveryAddress } from '#checkout/vendors/types';
import type { Settlement } from './types';

/** Carrier code of the Nova Poshta app. */
export const NOVA_POSHTA = 'nova-poshta';

/**
 * Nova Poshta hint of a delivery address: the settlement picked in the directory, in the
 * carrier's own space `address.data.carriers["nova-poshta"]` (R8, B7). A new city replaces
 * the whole `data`, so hints of every carrier are dropped with it.
 */
export function settlementAddressData(settlement: Settlement) {
  return { carriers: { [NOVA_POSHTA]: { settlementRef: settlement.ref } } };
}

/** Settlement ref of the address hint, or `null` when the address has none. */
export function readSettlementRef(
  address: ProviderDeliveryAddress | null | undefined
): string | null {
  const carriers = (address?.data as { carriers?: unknown } | null | undefined)?.carriers;
  const hint =
    carriers && typeof carriers === 'object'
      ? (carriers as Record<string, unknown>)[NOVA_POSHTA]
      : null;
  if (!hint || typeof hint !== 'object') {
    return null;
  }
  const ref = (hint as { settlementRef?: unknown }).settlementRef;
  return typeof ref === 'string' && ref.length > 0 ? ref : null;
}
