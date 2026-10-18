import type { model } from '@shopana/storefront-sdk';
import type { Checkout } from '#checkout/types/entity';
import { validateCustomerInput } from '#checkout/utils/jsonSchema';
import type { DeliveryGroup, DeliveryMethod } from './types';

/**
 * Identity of a delivery method across groups: the carrier and its service code. Every
 * group has its own option handle for the same method.
 */
export const methodKey = (method: Pick<DeliveryMethod, 'provider' | 'code'>) =>
  `${method.provider}\n${method.code}`;

/** Option of the group for the method `key`. */
export const methodOfGroup = (
  group: DeliveryGroup,
  key: string | null
): DeliveryMethod | null =>
  key === null
    ? null
    : (group.deliveryMethods.find((method) => methodKey(method) === key) ?? null);

/** Methods offered in every group, in the order of the first group. */
export function commonMethods(groups: DeliveryGroup[]): DeliveryMethod[] {
  const [first, ...rest] = groups;
  if (!first) {
    return [];
  }
  return first.deliveryMethods.filter((method) =>
    rest.every((group) => methodOfGroup(group, methodKey(method)) !== null)
  );
}

/**
 * Method selected in every group. A method selected in only some of them is not selected:
 * the order cannot go out until each shipment has its method.
 */
export function commonSelectionKey(groups: DeliveryGroup[]): string | null {
  const keys = groups.map((group) =>
    group.selectedDeliveryMethod ? methodKey(group.selectedDeliveryMethod) : null
  );
  const [first = null] = keys;
  return first !== null && keys.every((key) => key === first) ? first : null;
}

/**
 * Whether the selections can only be shown shipment by shipment: the groups have different
 * methods, a method the other groups do not offer, or the same method with different input
 * (two branches). The shared list shows one method with one input, so it would hide where
 * the other shipments go. A group with nothing selected yet does not count: the order is
 * blocked until it has a method.
 */
export function selectionsDiffer(groups: DeliveryGroup[]): boolean {
  const selected = groups.flatMap((group) =>
    group.selectedDeliveryMethod ? [group.selectedDeliveryMethod] : []
  );
  const keys = new Set(selected.map(methodKey));
  if (keys.size !== 1) {
    return keys.size > 1;
  }
  const [key] = keys;
  if (!commonMethods(groups).some((method) => methodKey(method) === key)) {
    return true;
  }
  return new Set(selected.map((method) => JSON.stringify(method.data ?? null))).size > 1;
}

/**
 * Option whose price and dates are known: the API accepted the selection together with the
 * input it needs. An option picked or edited a moment ago, or one still waiting for its
 * input (a branch), has no known price yet (R1).
 */
export const quotedMethod = (group: DeliveryGroup): DeliveryMethod | null => {
  const method = group.selectedDeliveryMethod;
  return method &&
    method.synced !== false &&
    validateCustomerInput(method.customerInputContract, method.data).length === 0
    ? method
    : null;
};

/** What a shipping price is made of. */
export interface QuoteMethod {
  cost: model.Money;
  paymentModel: Checkout.ShippingPaymentModel;
  estimatedMinDeliveryAt: Date | null;
  estimatedMaxDeliveryAt: Date | null;
}

export type ShippingPrice =
  | { kind: 'free' }
  | { kind: 'amount'; amount: model.Money }
  /** The carrier charges the recipient for every shipment. */
  | { kind: 'carrier' }
  /** The merchant collects `amount`; the carrier charges the rest of the shipments. */
  | { kind: 'amount-and-carrier'; amount: model.Money };

export interface ShippingQuote {
  price: ShippingPrice;
  /** Earliest and latest estimated delivery of the slowest shipment. */
  estimatedMinDeliveryAt: Date | null;
  estimatedMaxDeliveryAt: Date | null;
}

const latest = (dates: Array<Date | null>): Date | null =>
  dates.reduce<Date | null>(
    (max, date) => (date && (!max || date > max) ? date : max),
    null
  );

/**
 * Price and dates of the selected options of the shipments (R9). The price is the sum of
 * the charges the merchant collects; a `CARRIER_DIRECT` charge is paid to the carrier and
 * only named. The frontend never compares or ranks prices. The dates are those of the
 * shipment arriving last.
 */
export function shippingQuote(methods: QuoteMethod[]): ShippingQuote | null {
  if (methods.length === 0) {
    return null;
  }
  const collected = methods.filter(
    (method) => method.paymentModel === 'MERCHANT_COLLECTED'
  );
  const carrierDirect = collected.length < methods.length;
  const amount: model.Money | null = collected.length
    ? {
        currencyCode: collected[0].cost.currencyCode,
        amount:
          Math.round(
            collected.reduce((sum, method) => sum + Number(method.cost.amount), 0) * 100
          ) / 100,
      }
    : null;

  let price: ShippingPrice;
  if (!carrierDirect) {
    price = amount && amount.amount > 0 ? { kind: 'amount', amount } : { kind: 'free' };
  } else {
    price =
      amount && amount.amount > 0
        ? { kind: 'amount-and-carrier', amount }
        : { kind: 'carrier' };
  }

  const ends = methods.map(
    (method) => method.estimatedMaxDeliveryAt ?? method.estimatedMinDeliveryAt
  );
  const lastEnd = latest(ends);
  const slowest = lastEnd ? methods[ends.indexOf(lastEnd)] : null;
  return {
    price,
    estimatedMinDeliveryAt: slowest?.estimatedMinDeliveryAt ?? null,
    estimatedMaxDeliveryAt: lastEnd,
  };
}

/**
 * Quote of the whole order: known once every shipment that can be delivered has its option
 * selected and quoted. The groups carry the stored customer input (`useDeliveryFormData`).
 */
export function groupsShippingQuote(groups: DeliveryGroup[]): ShippingQuote | null {
  const quoted = groups
    .filter((group) => group.deliveryMethods.length > 0)
    .map(quotedMethod);
  return quoted.every((method) => method !== null)
    ? shippingQuote(quoted as DeliveryMethod[])
    : null;
}

/** Whether nothing can be delivered for the group to its address (R7). */
export const isUndeliverable = (group: Checkout.DeliveryGroup) =>
  group.deliveryAddress !== null && group.deliveryMethods.length === 0;

const contains = (line: Checkout.Line, ids: ReadonlySet<string>): boolean =>
  ids.has(line.id) || line.children.some((child) => contains(child, ids));

/**
 * Lines of the cart that cannot be delivered to the address. Groups may reference bundle
 * components; the cart line is the bundle itself.
 */
export function undeliverableLines(checkout: Checkout.Checkout): Checkout.Line[] {
  const ids = new Set(
    checkout.deliveryGroups
      .filter(isUndeliverable)
      .flatMap((group) => group.checkoutLines.map((line) => line.id))
  );
  return ids.size ? checkout.lines.filter((line) => contains(line, ids)) : [];
}
