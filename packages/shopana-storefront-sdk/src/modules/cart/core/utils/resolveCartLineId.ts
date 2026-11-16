import type { model } from '../../../../model/namespace';

/**
 * Queue key of the writes of one line: a newer quantity or a removal replaces the write of the
 * line still waiting. A provisional line shares the key with the line the server confirms.
 */
export function cartLineWriteKey(
  lineId: string,
  purchasableId: string | undefined
): string {
  return `checkoutLine:${purchasableId ?? lineId}`;
}

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
