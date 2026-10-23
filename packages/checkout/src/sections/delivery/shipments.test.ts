import { describe, expect, it } from 'vitest';
import type { model } from '@shopana/storefront-sdk';
import type { Checkout } from '#checkout/types/entity';
import type { DeliveryGroup, DeliveryMethod } from './types';
import {
  carrierChargeWaived,
  commonMethods,
  commonSelectionKey,
  groupsShippingQuote,
  initialSplitGroupIds,
  methodKey,
  quotedMethod,
  quotedShipment,
  selectionsDiffer,
  shippingQuote,
  undeliverableLines,
  type QuotedShipment,
} from './shipments';

const uah = (amount: number) => ({ amount, currencyCode: 'UAH' });

/** Shipping of a merchant-collected option, charged at checkout. */
const merchant = (
  total: number,
  overrides: Partial<Checkout.DeliveryGroupShipping> = {}
): Checkout.DeliveryGroupShipping => ({
  paymentModel: 'MERCHANT_COLLECTED',
  originalPrice: uah(total),
  payer: 'MERCHANT',
  total: uah(total),
  freeShipping: null,
  ...overrides,
});

/** Shipping of a carrier-direct option the recipient pays on delivery. */
const recipient = (
  estimate: model.Money | null
): Checkout.DeliveryGroupShipping => ({
  paymentModel: 'CARRIER_DIRECT',
  originalPrice: estimate,
  payer: 'RECIPIENT',
  total: uah(0),
  freeShipping: null,
});

const shipment = (
  shipping: Checkout.DeliveryGroupShipping,
  estimatedMinDeliveryAt: Date | null = null,
  estimatedMaxDeliveryAt: Date | null = null
): QuotedShipment => ({
  shipping,
  estimatedMinDeliveryAt,
  estimatedMaxDeliveryAt,
});

const method = (
  handle: string,
  code: string,
  overrides: Partial<DeliveryMethod> = {}
): DeliveryMethod => ({
  handle,
  code,
  title: code,
  provider: 'nova-poshta',
  carrierCode: 'nova-poshta',
  estimatedMinDeliveryAt: null,
  estimatedMaxDeliveryAt: null,
  data: undefined,
  customerInputContract: null,
  publicData: {},
  ...overrides,
});

const group = (
  id: string,
  deliveryMethods: DeliveryMethod[],
  selected: DeliveryMethod | null = null,
  shipping: Checkout.DeliveryGroupShipping | null = null
): DeliveryGroup => ({
  id,
  replacesGroupIds: [],
  lines: [],
  deliveryMethods,
  selectedDeliveryMethod: selected,
  address: null,
  resetReason: null,
  previousOptionHandle: null,
  savedInput: null,
  shipping,
});

const fedex = (handle: string) =>
  method(handle, 'ground', {
    provider: 'test-fedex',
    carrierCode: 'test-fedex',
  });

describe('shipments', () => {
  it('offers the methods every shipment has, in the order of the first', () => {
    const groups = [
      group('g1', [
        fedex('f1'),
        method('a1', 'warehouse'),
        method('a2', 'postomat'),
      ]),
      group('g2', [method('b1', 'postomat'), method('b2', 'warehouse')]),
    ];

    expect(commonMethods(groups).map((m) => m.handle)).toEqual(['a1', 'a2']);
  });

  it('treats a method as selected only when every shipment has it', () => {
    const a = method('a1', 'warehouse');
    const b = method('b1', 'warehouse');

    expect(commonSelectionKey([group('g1', [a], a), group('g2', [b], b)])).toBe(
      methodKey(a)
    );
    expect(
      commonSelectionKey([group('g1', [a], a), group('g2', [b])])
    ).toBeNull();
  });

  it('shows the selection by shipment when the shipments have different methods', () => {
    const a = method('a1', 'warehouse');
    const b = method('b1', 'warehouse');
    const f = fedex('f1');

    expect(selectionsDiffer([group('g1', [a], a), group('g2', [b])])).toBe(
      false
    );
    expect(
      selectionsDiffer([group('g1', [a], a), group('g2', [b, f], f)])
    ).toBe(true);
    // A method only one shipment offers cannot be shown in the shared list.
    expect(
      selectionsDiffer([
        group('g1', [a, fedex('f0')], fedex('f0')),
        group('g2', [b]),
      ])
    ).toBe(true);
  });

  it('shows the selection by shipment when the same method goes to different branches', () => {
    const a = method('a1', 'warehouse');
    const b = method('b1', 'warehouse');
    const branch = (ref: string) => ({ type: 'WAREHOUSE', warehouseRef: ref });

    expect(
      selectionsDiffer([
        group('g1', [a], { ...a, data: branch('5') }),
        group('g2', [b], { ...b, data: branch('7') }),
      ])
    ).toBe(true);
    expect(
      selectionsDiffer([
        group('g1', [a], { ...a, data: branch('5') }),
        group('g2', [b], { ...b, data: branch('5') }),
      ])
    ).toBe(false);
    // A shipment with nothing selected yet blocks the order by itself.
    expect(selectionsDiffer([group('g1', [a], a), group('g2', [b])])).toBe(
      false
    );
  });

  it('knows the price only once the API accepted the input', () => {
    const a = method('a1', 'warehouse');
    expect(quotedMethod(group('g1', [a], a))).toBe(a);
    expect(quotedMethod(group('g1', [a], { ...a, synced: false }))).toBeNull();
    expect(quotedMethod(group('g1', [a]))).toBeNull();
  });

  it('has no price while the option still waits for its input', () => {
    const contract = {
      type: 'object',
      required: ['warehouseRef'],
      properties: { warehouseRef: { type: 'string' } },
    };
    const a = method('a1', 'warehouse', { customerInputContract: contract });

    expect(quotedMethod(group('g1', [a], a))).toBeNull();
    const withBranch = { ...a, data: { warehouseRef: 'w1' }, synced: true };
    expect(quotedMethod(group('g1', [a], withBranch))).toBe(withBranch);
  });

  it('quotes the order only when every deliverable shipment is quoted', () => {
    const a = method('a1', 'x');
    const b = method('b1', 'x');
    const g1 = group('g1', [a], a, merchant(80));
    const g2 = group('g2', [b], b, merchant(60));

    expect(groupsShippingQuote([g1, group('g2', [b])])).toBeNull();
    expect(groupsShippingQuote([g1, g2])?.price).toEqual({
      kind: 'amount',
      amount: uah(140),
      original: null,
    });
    // A shipment that cannot be delivered blocks the order on its own, not the quote.
    expect(groupsShippingQuote([g1, group('g2', [])])?.price).toEqual({
      kind: 'amount',
      amount: uah(80),
      original: null,
    });
  });

  it('has no quote before the server settled the shipping of a shipment', () => {
    const a = method('a1', 'x');
    expect(quotedShipment(group('g1', [a], a))).toBeNull();
    expect(groupsShippingQuote([group('g1', [a], a)])).toBeNull();
  });
});

describe('shippingQuote', () => {
  it('sums what is charged at checkout', () => {
    expect(
      shippingQuote([shipment(merchant(80)), shipment(merchant(60.5))])?.price
    ).toEqual({
      kind: 'amount',
      amount: uah(140.5),
      original: null,
    });
  });

  it('names free shipping', () => {
    expect(shippingQuote([shipment(merchant(0))])?.price).toEqual({
      kind: 'free',
      original: null,
      carrierWaived: false,
    });
  });

  it('strikes the price free shipping took off and says why', () => {
    const tier: Checkout.FreeShipping = {
      source: 'LOYALTY_TIER',
      title: 'Gold',
      code: null,
    };
    const quote = shippingQuote([
      shipment(merchant(0, { originalPrice: uah(80), freeShipping: tier })),
      shipment(merchant(0, { originalPrice: uah(60), freeShipping: tier })),
    ]);
    expect(quote?.price).toEqual({
      kind: 'free',
      original: uah(140),
      carrierWaived: false,
    });
    expect(quote?.freeShipping).toEqual([tier]);
  });

  it('strikes the price of a shipment made free next to one still charged', () => {
    const promo: Checkout.FreeShipping = {
      source: 'DISCOUNT',
      title: 'Summer',
      code: 'SUN',
    };
    const quote = shippingQuote([
      shipment(merchant(0, { originalPrice: uah(80), freeShipping: promo })),
      shipment(merchant(60)),
    ]);
    expect(quote?.price).toEqual({
      kind: 'amount',
      amount: uah(60),
      original: uah(140),
    });
    expect(quote?.freeShipping).toEqual([promo]);
  });

  it('names the carrier rates instead of adding them', () => {
    const carrier = shipment(recipient(uah(70)));
    expect(shippingQuote([carrier])?.price).toEqual({ kind: 'carrier' });
    expect(shippingQuote([shipment(merchant(80)), carrier])?.price).toEqual({
      kind: 'amount-and-carrier',
      amount: uah(80),
      original: null,
    });
    expect(shippingQuote([shipment(merchant(0)), carrier])?.price).toEqual({
      kind: 'carrier',
    });
  });

  it('shows a carrier charge free shipping pays as free, never as carrier rates', () => {
    const reward: Checkout.FreeShipping = {
      source: 'LOYALTY_REWARD',
      title: 'Free delivery',
      code: null,
    };
    const waived = (originalPrice: model.Money | null) =>
      shipment({
        paymentModel: 'CARRIER_DIRECT',
        payer: 'MERCHANT',
        originalPrice,
        total: uah(0),
        freeShipping: reward,
      });

    expect(shippingQuote([waived(uah(95))])?.price).toEqual({
      kind: 'free',
      original: uah(95),
      carrierWaived: false,
    });
    // The carrier price is unknown: the carrier's rates are what is struck through.
    expect(shippingQuote([waived(null)])?.price).toEqual({
      kind: 'free',
      original: null,
      carrierWaived: true,
    });
    expect(carrierChargeWaived([waived(null)])).toBe(true);
    expect(carrierChargeWaived([shipment(recipient(null))])).toBe(false);
    expect(carrierChargeWaived([shipment(merchant(0))])).toBe(false);
  });

  it('names each reason once', () => {
    const tier: Checkout.FreeShipping = {
      source: 'LOYALTY_TIER',
      title: 'Gold',
      code: null,
    };
    const promo: Checkout.FreeShipping = {
      source: 'DISCOUNT',
      title: 'Summer',
      code: null,
    };
    const quote = shippingQuote([
      shipment(merchant(0, { originalPrice: uah(80), freeShipping: tier })),
      shipment(merchant(0, { originalPrice: uah(80), freeShipping: promo })),
      shipment(merchant(0, { originalPrice: uah(80), freeShipping: tier })),
    ]);
    expect(quote?.freeShipping).toEqual([tier, promo]);
  });

  it('dates the order by the shipment arriving last', () => {
    const quote = shippingQuote([
      shipment(merchant(80), new Date('2026-10-20'), new Date('2026-10-21')),
      shipment(merchant(80), new Date('2026-10-22'), new Date('2026-10-24')),
    ]);
    expect(quote?.estimatedMinDeliveryAt).toEqual(new Date('2026-10-22'));
    expect(quote?.estimatedMaxDeliveryAt).toEqual(new Date('2026-10-24'));
  });

  it('has no quote without options', () => {
    expect(shippingQuote([])).toBeNull();
  });
});

describe('undeliverableLines', () => {
  const line = (id: string, children: Checkout.Line[] = []) =>
    ({ id, children }) as unknown as Checkout.Line;
  const address = { id: 'addr' } as Checkout.DeliveryAddress;
  const apiGroup = (
    lines: Checkout.Line[],
    deliveryMethods: unknown[],
    deliveryAddress: Checkout.DeliveryAddress | null = address
  ) =>
    ({
      checkoutLines: lines,
      deliveryMethods,
      deliveryAddress,
    }) as unknown as Checkout.DeliveryGroup;

  it('lists cart lines of groups with no option for the address', () => {
    const component = line('component');
    const bundle = line('bundle', [component]);
    const shoes = line('shoes');
    const checkout = {
      lines: [bundle, shoes],
      deliveryGroups: [apiGroup([component], []), apiGroup([shoes], [{}])],
    } as unknown as Checkout.Checkout;

    expect(undeliverableLines(checkout).map((l) => l.id)).toEqual(['bundle']);
  });

  it('does not block before the address is entered', () => {
    const shoes = line('shoes');
    const checkout = {
      lines: [shoes],
      deliveryGroups: [apiGroup([shoes], [], null)],
    } as unknown as Checkout.Checkout;

    expect(undeliverableLines(checkout)).toEqual([]);
  });
});

describe('initialSplitGroupIds', () => {
  const branch = (ref: string) => ({ type: 'WAREHOUSE', warehouseRef: ref });

  it('keeps every shipment together when they have the same method and input', () => {
    const a = method('a1', 'warehouse', { data: branch('5') });
    const b = method('b1', 'warehouse', { data: branch('5') });
    expect(
      initialSplitGroupIds([group('g1', [a], a), group('g2', [b], b)])
    ).toEqual([]);
  });

  it('takes apart a shipment whose method or branch differs from the first one', () => {
    const a = method('a1', 'warehouse', { data: branch('5') });
    const b = method('b1', 'warehouse', { data: branch('7') });
    const c = method('c1', 'warehouse', { data: branch('5') });
    const courier = method('c2', 'courier');
    expect(
      initialSplitGroupIds([
        group('g1', [a], a),
        group('g2', [b], b),
        group('g3', [c, courier], courier),
      ])
    ).toEqual(['g2', 'g3']);
  });

  it('keeps a shipment with nothing selected with the others', () => {
    const a = method('a1', 'warehouse');
    const b = method('b1', 'warehouse');
    expect(
      initialSplitGroupIds([group('g1', [a]), group('g2', [b], b)])
    ).toEqual([]);
  });

  it('takes apart every shipment but the first when they share no method', () => {
    const a = method('a1', 'warehouse');
    const b = method('b1', 'courier');
    expect(initialSplitGroupIds([group('g1', [a]), group('g2', [b])])).toEqual([
      'g2',
    ]);
  });
});
