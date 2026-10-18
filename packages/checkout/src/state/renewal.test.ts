import { describe, expect, it } from 'vitest';
import type { Checkout } from '#checkout/types/entity';
import { renewalInput } from './renewal';

const line = (patch: Partial<Checkout.Line>): Checkout.Line =>
  ({
    purchasableId: 'variant-1',
    quantity: 1,
    purchase: { type: 'ONE_TIME' },
    attributes: null,
    tag: null,
    componentItemId: null,
    children: [],
    ...patch,
  }) as Checkout.Line;

describe('renewalInput', () => {
  it('carries lines with purchase, attributes, tags and components, nothing else', () => {
    const checkout = {
      currencyCode: 'UAH',
      localeCode: 'uk',
      appliedPromoCodes: [{ code: 'SALE' }],
      lines: [
        line({
          purchasableId: 'box',
          attributes: { giftNote: 'Hi' },
          tag: { id: 't1', slug: 'box-builder', unique: true },
          children: [
            line({
              purchasableId: 'snack',
              quantity: 2,
              componentItemId: 'slot-1',
              attributes: [{ key: 'flavor', value: 'salt' }],
            }),
          ],
        }),
        line({ purchasableId: 'tea', quantity: 3 }),
      ],
    } as unknown as Checkout.Checkout;

    expect(renewalInput(checkout)).toEqual({
      currencyCode: 'UAH',
      localeCode: 'uk',
      tags: [{ slug: 'box-builder', unique: true }],
      items: [
        {
          purchasableId: 'box',
          quantity: 1,
          purchase: { type: 'ONE_TIME' },
          attributes: { giftNote: 'Hi' },
          tagSlug: 'box-builder',
          children: [
            {
              componentItemId: 'slot-1',
              purchasableId: 'snack',
              quantity: 2,
              attributes: [{ key: 'flavor', value: 'salt' }],
            },
          ],
        },
        {
          purchasableId: 'tea',
          quantity: 3,
          purchase: { type: 'ONE_TIME' },
          attributes: undefined,
          tagSlug: undefined,
          children: undefined,
        },
      ],
    });
  });
});
