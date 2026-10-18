import { describe, expect, it } from 'vitest';
import type { Checkout } from '#checkout/types/entity';
import { mapCheckoutToRecipientFormData } from './mapper';

const person = {
  firstName: 'Олена',
  lastName: 'Коваль',
  middleName: null,
  phone: '+380501112233',
};
const group = (id: string, recipient: typeof person | null) =>
  ({ id, recipient }) as unknown as Checkout.DeliveryGroup;
const checkout = (deliveryGroups: Checkout.DeliveryGroup[]) =>
  ({ deliveryGroups }) as unknown as Checkout.Checkout;

describe('mapCheckoutToRecipientFormData', () => {
  it('is the customer when no group has a recipient', () => {
    expect(mapCheckoutToRecipientFormData(checkout([group('g1', null), group('g2', null)]))).toEqual({
      self: true,
      deliveryGroupIds: ['g1', 'g2'],
      groupIdsWithoutRecipient: ['g1', 'g2'],
    });
  });

  it('finds the recipient in any group, not only the first', () => {
    const data = mapCheckoutToRecipientFormData(
      checkout([group('g1', null), group('g2', person)])
    );

    expect(data).toMatchObject({
      self: false,
      deliveryGroupIds: ['g1', 'g2'],
      groupIdsWithoutRecipient: ['g1'],
      firstName: 'Олена',
      phone: '+380501112233',
    });
  });

  it('has no data before the checkout has groups', () => {
    expect(mapCheckoutToRecipientFormData(checkout([]))).toBeNull();
  });
});
