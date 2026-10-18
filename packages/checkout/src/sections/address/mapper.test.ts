import { describe, expect, it } from 'vitest';
import type { Checkout } from '#checkout/types/entity';
import { mapCheckoutToAddressFormData } from './mapper';

const line = (id: string) => ({ id }) as Checkout.Line;
const address = (id: string) =>
  ({ id, countryCode: 'UA', city: 'Київ', data: {} }) as unknown as Checkout.DeliveryAddress;
const group = (
  id: string,
  lines: Checkout.Line[],
  deliveryAddress: Checkout.DeliveryAddress | null
) => ({ id, checkoutLines: lines, deliveryAddress }) as unknown as Checkout.DeliveryGroup;
const checkout = (deliveryGroups: Checkout.DeliveryGroup[], lines: Checkout.Line[] = []) =>
  ({ lines, deliveryGroups }) as unknown as Checkout.Checkout;

describe('mapCheckoutToAddressFormData', () => {
  it('updates the address of every group and adds it for lines without one', () => {
    const data = mapCheckoutToAddressFormData(
      checkout([
        group('g1', [line('l1')], address('a1')),
        group('g2', [line('l2')], address('a2')),
        group('g3', [line('l3'), line('l4')], null),
      ])
    );

    expect(data?.addressIds).toEqual(['a1', 'a2']);
    expect(data?.unaddressedLineIds).toEqual(['l3', 'l4']);
    expect(data?.address?.addressId).toBe('a1');
  });

  it('adds the address for every line before the checkout has groups', () => {
    const data = mapCheckoutToAddressFormData(checkout([], [line('l1'), line('l2')]));

    expect(data?.addressIds).toEqual([]);
    expect(data?.unaddressedLineIds).toEqual(['l1', 'l2']);
    expect(data?.address).toBeNull();
  });

  it('shows the saved address even when the first group has none yet', () => {
    const data = mapCheckoutToAddressFormData(
      checkout([group('g1', [line('l1')], null), group('g2', [line('l2')], address('a2'))])
    );

    expect(data?.address?.addressId).toBe('a2');
    expect(data?.unaddressedLineIds).toEqual(['l1']);
  });
});
