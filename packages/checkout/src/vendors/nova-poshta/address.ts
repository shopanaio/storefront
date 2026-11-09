import type { ProviderDeliveryAddress } from '#checkout/vendors/types';
import type { Settlement } from './types';

/** Carrier code of the Nova Poshta app. */
export const NOVA_POSHTA = 'nova-poshta';

/** Settlement of the address hint: what the customer input is built from. */
export interface SettlementHint {
  settlementRef: string;
  cityRef: string;
}

/**
 * Nova Poshta hint of a delivery address: the settlement picked in the directory and the
 * carrier city that serves it, in the carrier's own space `address.data.carriers["nova-poshta"]`
 * (R8, B7). The backend takes them as they are. A new city replaces the whole `data`, so hints
 * of every carrier are dropped with it.
 */
export function settlementAddressData(settlement: Settlement) {
  return {
    carriers: {
      [NOVA_POSHTA]: {
        settlementRef: settlement.ref,
        cityRef: settlement.cityRef,
      },
    },
  };
}

/** Settlement of the address hint, or `null` when the address has no full hint. */
export function readSettlement(
  address: ProviderDeliveryAddress | null | undefined
): SettlementHint | null {
  const carriers = (address?.data as { carriers?: unknown } | null | undefined)
    ?.carriers;
  const hint =
    carriers && typeof carriers === 'object'
      ? (carriers as Record<string, unknown>)[NOVA_POSHTA]
      : null;
  if (!hint || typeof hint !== 'object') {
    return null;
  }
  const { settlementRef, cityRef } = hint as {
    settlementRef?: unknown;
    cityRef?: unknown;
  };
  return typeof settlementRef === 'string' &&
    settlementRef.length > 0 &&
    typeof cityRef === 'string' &&
    cityRef.length > 0
    ? { settlementRef, cityRef }
    : null;
}
