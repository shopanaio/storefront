import { describe, expect, it } from 'vitest';
import type { Checkout } from '#checkout/types/entity';
import type { DeliveryGroup, DeliveryMethod } from './types';
import {
  commonMethods,
  commonSelectionKey,
  groupsShippingQuote,
  methodKey,
  quotedMethod,
  selectionsDiffer,
  shippingQuote,
  undeliverableLines,
} from './shipments';

const uah = (amount: number) => ({ amount, currencyCode: 'UAH' });

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
  cost: uah(80),
  paymentModel: 'MERCHANT_COLLECTED',
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
  selected: DeliveryMethod | null = null
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
});

const fedex = (handle: string) =>
  method(handle, 'ground', { provider: 'test-fedex', carrierCode: 'test-fedex' });

describe('shipments', () => {
  it('offers the methods every shipment has, in the order of the first', () => {
    const groups = [
      group('g1', [fedex('f1'), method('a1', 'warehouse'), method('a2', 'postomat')]),
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
    expect(commonSelectionKey([group('g1', [a], a), group('g2', [b])])).toBeNull();
  });

  it('shows the selection by shipment when the shipments have different methods', () => {
    const a = method('a1', 'warehouse');
    const b = method('b1', 'warehouse');
    const f = fedex('f1');

    expect(selectionsDiffer([group('g1', [a], a), group('g2', [b])])).toBe(false);
    expect(selectionsDiffer([group('g1', [a], a), group('g2', [b, f], f)])).toBe(true);
    // A method only one shipment offers cannot be shown in the shared list.
    expect(selectionsDiffer([group('g1', [a, fedex('f0')], fedex('f0')), group('g2', [b])])).toBe(
      true
    );
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
    expect(selectionsDiffer([group('g1', [a], a), group('g2', [b])])).toBe(false);
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
    const a = method('a1', 'x', { cost: uah(80) });
    const b = method('b1', 'x', { cost: uah(60) });

    expect(groupsShippingQuote([group('g1', [a], a), group('g2', [b])])).toBeNull();
    expect(groupsShippingQuote([group('g1', [a], a), group('g2', [b], b)])?.price).toEqual({
      kind: 'amount',
      amount: uah(140),
    });
    // A shipment that cannot be delivered blocks the order on its own, not the quote.
    expect(groupsShippingQuote([group('g1', [a], a), group('g2', [])])?.price).toEqual({
      kind: 'amount',
      amount: uah(80),
    });
  });
});

describe('shippingQuote', () => {
  it('sums what the merchant collects', () => {
    expect(
      shippingQuote([method('a', 'x', { cost: uah(80) }), method('b', 'x', { cost: uah(60.5) })])
        ?.price
    ).toEqual({ kind: 'amount', amount: uah(140.5) });
  });

  it('names free shipping', () => {
    expect(shippingQuote([method('a', 'x', { cost: uah(0) })])?.price).toEqual({
      kind: 'free',
    });
  });

  it('names the carrier rates instead of adding them', () => {
    const carrier = method('b', 'x', { paymentModel: 'CARRIER_DIRECT', cost: uah(70) });
    expect(shippingQuote([carrier])?.price).toEqual({ kind: 'carrier' });
    expect(shippingQuote([method('a', 'x'), carrier])?.price).toEqual({
      kind: 'amount-and-carrier',
      amount: uah(80),
    });
    expect(shippingQuote([method('a', 'x', { cost: uah(0) }), carrier])?.price).toEqual({
      kind: 'carrier',
    });
  });

  it('dates the order by the shipment arriving last', () => {
    const quote = shippingQuote([
      method('a', 'x', {
        estimatedMinDeliveryAt: new Date('2026-10-20'),
        estimatedMaxDeliveryAt: new Date('2026-10-21'),
      }),
      method('b', 'x', {
        estimatedMinDeliveryAt: new Date('2026-10-22'),
        estimatedMaxDeliveryAt: new Date('2026-10-24'),
      }),
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
    ({ checkoutLines: lines, deliveryMethods, deliveryAddress }) as unknown as Checkout.DeliveryGroup;

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
