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

/**
 * Whether `id` names the group: its own id or one it replaced. A group gets a new id when its
 * lines change, and the API applies a mutation naming a replaced id to this group.
 */
export const isGroupOf = (
  group: Pick<DeliveryGroup, 'id' | 'replacesGroupIds'>,
  id: string
): boolean => group.id === id || group.replacesGroupIds.includes(id);

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

/** Selection of the group as a shared list shows it: the method with its input. */
const selectionOf = (group: DeliveryGroup): string | null =>
  group.selectedDeliveryMethod
    ? `${methodKey(group.selectedDeliveryMethod)}\n${JSON.stringify(
        group.selectedDeliveryMethod.data ?? null
      )}`
    : null;

/**
 * Groups shown in blocks of their own when the shipments appear, as if the customer had asked
 * for "another delivery method" for each: a group whose method or input differs from the first
 * selected one, and every group but the first when the groups share no method. A group with
 * nothing selected stays with the others; the order is blocked until it has a method.
 */
export function initialSplitGroupIds(groups: DeliveryGroup[]): string[] {
  if (commonMethods(groups).length === 0) {
    return groups.slice(1).map((group) => group.id);
  }
  const first = groups.map(selectionOf).find((selection) => selection !== null) ?? null;
  return groups
    .filter((group) => {
      const selection = selectionOf(group);
      return selection !== null && selection !== first;
    })
    .map((group) => group.id);
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

/** Shipment of a group with a known price: the shipping the server settled and its dates. */
export interface QuotedShipment {
  shipping: Checkout.DeliveryGroupShipping;
  estimatedMinDeliveryAt: Date | null;
  estimatedMaxDeliveryAt: Date | null;
}

/** Shipment of the group once its option is quoted and the server settled its shipping. */
export const quotedShipment = (group: DeliveryGroup): QuotedShipment | null => {
  const method = quotedMethod(group);
  return method && group.shipping
    ? {
        shipping: group.shipping,
        estimatedMinDeliveryAt: method.estimatedMinDeliveryAt,
        estimatedMaxDeliveryAt: method.estimatedMaxDeliveryAt,
      }
    : null;
};

/**
 * Shipping price as the customer reads it. `original` is the price before free shipping or a
 * shipping discount, shown struck through; `null` when nothing was taken off or the price of a
 * waived carrier charge is unknown.
 */
export type ShippingPrice =
  /**
   * Nothing is charged and no carrier charges the recipient. `carrierWaived`: free shipping
   * covers a carrier charge of unknown price, so the carrier's rates are what is struck through.
   */
  | { kind: 'free'; original: model.Money | null; carrierWaived: boolean }
  | { kind: 'amount'; amount: model.Money; original: model.Money | null }
  /** The carrier charges the recipient for every shipment. */
  | { kind: 'carrier' }
  /** The merchant collects `amount`; the carrier charges the rest of the shipments. */
  | { kind: 'amount-and-carrier'; amount: model.Money; original: model.Money | null };

export interface ShippingQuote {
  price: ShippingPrice;
  /** Why shipping is free, once per distinct reason, in shipment order. */
  freeShipping: Checkout.FreeShipping[];
  /** Earliest and latest estimated delivery of the slowest shipment. */
  estimatedMinDeliveryAt: Date | null;
  estimatedMaxDeliveryAt: Date | null;
}

const latest = (dates: Array<Date | null>): Date | null =>
  dates.reduce<Date | null>(
    (max, date) => (date && (!max || date > max) ? date : max),
    null
  );

const sum = (amounts: model.Money[]): model.Money => ({
  currencyCode: amounts[0].currencyCode,
  amount:
    Math.round(amounts.reduce((total, money) => total + Number(money.amount) * 100, 0)) /
    100,
});

/**
 * Price and dates of the selected options of the shipments (R9), from the shipping the server
 * settled for each group: the amount charged at checkout, who pays the carrier, the price before
 * free shipping and why it is free. A shipment whose recipient pays the carrier is only named.
 * The frontend never compares or ranks prices. The dates are those of the shipment arriving
 * last.
 */
export function shippingQuote(shipments: QuotedShipment[]): ShippingQuote | null {
  if (shipments.length === 0) {
    return null;
  }
  const charged = shipments
    .map(({ shipping }) => shipping)
    .filter((shipping) => shipping.payer === 'MERCHANT');
  const carrierPays = charged.length < shipments.length;
  const amount = charged.length ? sum(charged.map(({ total }) => total)) : null;
  const originals = charged.flatMap(({ originalPrice }) =>
    originalPrice ? [originalPrice] : []
  );
  const known = originals.length === charged.length;
  const before = charged.length && known ? sum(originals) : null;
  const original = before && amount && before.amount > amount.amount ? before : null;

  let price: ShippingPrice;
  if (amount && amount.amount > 0) {
    price = carrierPays
      ? { kind: 'amount-and-carrier', amount, original }
      : { kind: 'amount', amount, original };
  } else if (!carrierPays) {
    price = { kind: 'free', original, carrierWaived: !known };
  } else {
    price = { kind: 'carrier' };
  }

  const reasons = shipments.flatMap(({ shipping }) =>
    shipping.freeShipping ? [shipping.freeShipping] : []
  );
  const ends = shipments.map(
    (shipment) => shipment.estimatedMaxDeliveryAt ?? shipment.estimatedMinDeliveryAt
  );
  const lastEnd = latest(ends);
  const slowest = lastEnd ? shipments[ends.indexOf(lastEnd)] : null;
  return {
    price,
    freeShipping: reasons.filter(
      (reason, index) =>
        reasons.findIndex(
          (other) => other.source === reason.source && other.title === reason.title
        ) === index
    ),
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
    .map(quotedShipment);
  return quoted.every((shipment) => shipment !== null)
    ? shippingQuote(quoted as QuotedShipment[])
    : null;
}

/**
 * Whether free shipping covers the carrier charge of every shipment: the merchant pays the
 * carrier for a `CARRIER_DIRECT` option, and the recipient pays nothing on delivery.
 */
export const carrierChargeWaived = (shipments: QuotedShipment[]): boolean =>
  shipments.length > 0 &&
  shipments.every(
    ({ shipping }) =>
      shipping.paymentModel === 'CARRIER_DIRECT' && shipping.payer === 'MERCHANT'
  );

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
