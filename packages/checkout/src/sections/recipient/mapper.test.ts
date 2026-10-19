import { describe, expect, it } from 'vitest';
import type { Checkout } from '#checkout/types/entity';
import { mapCheckoutToRecipientFormData, recipientMutations } from './mapper';

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

describe('recipientMutations', () => {
  const recipient = { firstName: 'Олена', lastName: 'Коваль', phone: '+380501112233' };

  it('SC-5qfk: updates the recipient the previous save created instead of creating it again', () => {
    expect(
      recipientMutations({ deliveryGroupIds: ['g1'], groupIdsWithoutRecipient: [] }, recipient)
    ).toEqual({
      remove: null,
      update: { updates: [{ deliveryGroupId: 'g1', recipient }] },
      add: null,
    });
  });

  it('adds the recipient to a group split off later', () => {
    expect(
      recipientMutations({ deliveryGroupIds: ['g1', 'g2'], groupIdsWithoutRecipient: ['g2'] }, recipient)
    ).toEqual({
      remove: null,
      update: { updates: [{ deliveryGroupId: 'g1', recipient }] },
      add: { recipients: [{ deliveryGroupId: 'g2', recipient }] },
    });
  });

  it('removes the recipient only from the groups that have it', () => {
    expect(
      recipientMutations({ deliveryGroupIds: ['g1', 'g2'], groupIdsWithoutRecipient: ['g2'] }, null)
    ).toEqual({ remove: { deliveryGroupIds: ['g1'] }, update: null, add: null });
  });
});
