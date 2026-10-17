import type { model } from '../../../../model/namespace';

/** Only provisional lines may acquire a different ID when the server confirms them. */
export function resolveCartLineId(
  cart: model.Cart | null,
  lineId: string,
  purchasableId: string | undefined
): string | null {
  const exact = cart?.lines.find((line) => line.id === lineId);
  if (exact) return exact.id;
  if (!lineId.startsWith('client:checkoutLine:') || !purchasableId) return null;
  return (
    cart?.lines.find((line) => line.purchasableId === purchasableId)?.id ?? null
  );
}
