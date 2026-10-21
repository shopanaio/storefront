import type { Checkout } from '#checkout/types/entity';
import { settlementAddressData } from '#checkout/vendors/nova-poshta/address';
import { popularCities } from '#checkout/vendors/nova-poshta/popularCities';
import type {
  DoorInput,
  PointInput,
  ServiceCode,
  Warehouse,
} from '#checkout/vendors/nova-poshta/types';
import { defaultCheckout, uah } from './fixtures';

/** Kyiv, as the Nova Poshta directory returns it. */
export const KYIV = popularCities[0];

/** The delivery address of the buyer: Kyiv, with the Nova Poshta settlement as the hint. */
export const kyivAddress: Checkout.DeliveryAddress = {
  id: 'address-1',
  address1: null,
  address2: null,
  city: KYIV.name,
  countryCode: 'UA',
  data: settlementAddressData(KYIV),
  postalCode: null,
  provinceCode: 'UA-30',
  name: 'Olena Kovalenko',
  phone: '+380671234567',
  country: 'Ukraine',
  province: null,
  formatted: [KYIV.name],
  formattedArea: `${KYIV.name}, Ukraine`,
};

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const schedule = (weekdays: string, saturday: string, sunday: string) => [
  ...WEEKDAYS.map((day) => ({
    __typename: 'NovaPoshtaScheduleDay' as const,
    day,
    hours: weekdays,
  })),
  {
    __typename: 'NovaPoshtaScheduleDay' as const,
    day: 'Saturday',
    hours: saturday,
  },
  {
    __typename: 'NovaPoshtaScheduleDay' as const,
    day: 'Sunday',
    hours: sunday,
  },
];

const point = (
  kind: Warehouse['kind'],
  number: string,
  shortAddress: string,
  selectable = true
): Warehouse => ({
  __typename: 'NovaPoshtaWarehouse',
  ref: `${kind.toLowerCase()}-${number}`,
  kind,
  number,
  description: `${kind === 'WAREHOUSE' ? 'Відділення' : 'Поштомат'} №${number}: ${shortAddress}`,
  shortAddress,
  selectable,
  settlementRef: KYIV.ref,
  schedule:
    kind === 'WAREHOUSE'
      ? schedule('08:00-21:00', '09:00-19:00', '10:00-18:00')
      : schedule('00:00-23:59', '00:00-23:59', '00:00-23:59'),
});

/** Branches and parcel lockers of Kyiv in the directory; one branch takes no parcels now. */
export const KYIV_POINTS: Warehouse[] = [
  point('WAREHOUSE', '1', 'вул. Пирогівський шлях, 135'),
  point('WAREHOUSE', '5', 'вул. Федорова, 32'),
  point('WAREHOUSE', '12', 'вул. Богатирська, 11'),
  point('WAREHOUSE', '31', 'просп. Перемоги, 67', false),
  point('WAREHOUSE', '102', 'вул. Хрещатик, 22'),
  point('POSTOMAT', '27014', 'вул. Саксаганського, 41 (АТБ)'),
  point('POSTOMAT', '27588', 'просп. Берестейський, 9 (Сільпо)'),
];

/** Streets of Kyiv in the directory. */
export const KYIV_STREETS = [
  ['street-khreshchatyk', 'Хрещатик', 'вул. Хрещатик'],
  ['street-saksahanskoho', 'Саксаганського', 'вул. Саксаганського'],
  ['street-shevchenka', 'Тараса Шевченка', 'бульв. Тараса Шевченка'],
].map(([ref, name, present]) => ({
  __typename: 'NovaPoshtaSettlementStreet' as const,
  ref,
  settlementRef: KYIV.ref,
  name,
  present,
  streetType: null,
}));

const contractBranch = (type: 'WAREHOUSE' | 'POSTOMAT' | 'DOOR') =>
  type === 'DOOR'
    ? {
        type: 'object',
        additionalProperties: false,
        required: [
          'type',
          'settlementRef',
          'streetRef',
          'streetName',
          'building',
        ],
        properties: {
          type: { const: 'DOOR' },
          settlementRef: { type: 'string', minLength: 1 },
          streetRef: { type: 'string', minLength: 1 },
          streetName: { type: 'string', minLength: 1 },
          building: { type: 'string', minLength: 1, maxLength: 50 },
          apartment: { type: 'string', minLength: 1, maxLength: 50 },
          comment: { type: 'string', minLength: 1, maxLength: 500 },
        },
      }
    : {
        type: 'object',
        additionalProperties: false,
        required: ['type', 'settlementRef', 'warehouseRef'],
        properties: {
          type: { const: type },
          settlementRef: { type: 'string', minLength: 1 },
          warehouseRef: { type: 'string', minLength: 1 },
        },
      };

const SERVICE_TYPE = {
  warehouse: 'WAREHOUSE',
  postomat: 'POSTOMAT',
  doors: 'DOOR',
} as const;

/** Who pays Nova Poshta for an option: the store, or the buyer on receipt (the default). */
export type Payer = 'MERCHANT' | 'RECIPIENT';

/** Carrier estimate of an option the buyer pays on receipt, in UAH. */
const ESTIMATES: Record<ServiceCode, number> = {
  warehouse: 80,
  postomat: 70,
  doors: 120,
};

/**
 * A Nova Poshta option as the app returns it. The buyer pays the carrier on receipt by
 * default, with the carrier's estimate; `estimate: null` is an estimate still unknown. The
 * store pays a fixed price at checkout with `payer: 'MERCHANT'`.
 */
export function npOption(
  code: ServiceCode,
  {
    payer = 'RECIPIENT',
    price = ESTIMATES[code],
    estimate = ESTIMATES[code],
  }: { payer?: Payer; price?: number; estimate?: number | null } = {}
): Checkout.DeliveryMethod {
  const recipient = payer === 'RECIPIENT';
  return {
    handle: `nova-poshta-${code}`,
    code,
    title: code,
    description: null,
    deliveryMethodType: code === 'doors' ? 'SHIPPING' : 'PICKUP_POINT',
    carrierCode: 'nova-poshta',
    provider: { code: 'nova-poshta' },
    cost: uah(recipient ? 0 : price),
    paymentModel: recipient ? 'CARRIER_DIRECT' : 'MERCHANT_COLLECTED',
    carrierEstimatedCost: recipient && estimate !== null ? uah(estimate) : null,
    estimatedMinDeliveryAt: new Date('2026-10-22T00:00:00Z'),
    estimatedMaxDeliveryAt: new Date(
      code === 'doors' ? '2026-10-24T00:00:00Z' : '2026-10-23T00:00:00Z'
    ),
    phoneRequired: true,
    customerInputContract: {
      schemaDialect: 'https://json-schema.org/draft/2020-12/schema',
      schema: { oneOf: [contractBranch(SERVICE_TYPE[code])] },
    },
    publicData: recipient
      ? {
          payer: 'Recipient',
          estimatedCost:
            estimate === null
              ? null
              : { amountMinor: String(estimate * 100), currencyCode: 'UAH' },
        }
      : { payer: 'Sender' },
  };
}

/** The Nova Poshta services in the order the app returns them. */
export const npOptions = (payer: Payer = 'RECIPIENT') => [
  npOption('warehouse', { payer }),
  npOption('postomat', { payer }),
  npOption('doors', { payer }),
];

/** Branch №5 of Kyiv as the customer input of the branch option. */
export const branchInput: PointInput = {
  type: 'WAREHOUSE',
  settlementRef: KYIV.ref,
  warehouseRef: KYIV_POINTS[1].ref,
};

/** Parcel locker of Kyiv as the customer input of the locker option. */
export const lockerInput: PointInput = {
  type: 'POSTOMAT',
  settlementRef: KYIV.ref,
  warehouseRef: KYIV_POINTS[5].ref,
};

/** A courier address in Kyiv as the customer input of the courier option. */
export const courierInput: DoorInput = {
  type: 'DOOR',
  settlementRef: KYIV.ref,
  streetRef: KYIV_STREETS[0].ref,
  streetName: KYIV_STREETS[0].name,
  building: '22',
  apartment: '14',
};

/** What the server settles for a selected option: the price at checkout and who pays the carrier. */
export function shippingOf(
  option: Checkout.DeliveryMethod,
  freeShipping: Checkout.FreeShipping | null = null
): Checkout.DeliveryGroupShipping {
  const recipient = option.paymentModel === 'CARRIER_DIRECT' && !freeShipping;
  return {
    paymentModel: option.paymentModel,
    originalPrice:
      option.paymentModel === 'CARRIER_DIRECT'
        ? option.carrierEstimatedCost
        : option.cost,
    payer: recipient ? 'RECIPIENT' : 'MERCHANT',
    total: freeShipping ? uah(0) : option.cost,
    freeShipping,
  };
}

/** Delivery group of a scenario; one group ships every line. */
export interface GroupScenario {
  id?: string;
  lines?: Checkout.Line[];
  address?: Checkout.DeliveryAddress | null;
  options?: Checkout.DeliveryMethod[];
  /** Handle of the selected option. */
  selected?: string | null;
  /** Customer input the API saved for the selected (or reset) option. */
  input?: unknown;
  /** The API reset the selection of this option, for this reason. */
  reset?: { handle: string; reason: Checkout.SelectionResetReason };
  freeShipping?: Checkout.FreeShipping | null;
}

/** A delivery group as the API returns it, with the shipping settled for its selection. */
export function deliveryGroup({
  id = 'group-1',
  lines = defaultCheckout.lines,
  address = kyivAddress,
  options = npOptions(),
  selected = null,
  input = null,
  reset,
  freeShipping = null,
}: GroupScenario = {}): Checkout.DeliveryGroup {
  const option = options.find((item) => item.handle === selected) ?? null;
  return {
    id,
    replacesGroupIds: [],
    checkoutLines: lines,
    deliveryAddress: address,
    deliveryMethods: options,
    recipient: null,
    selection: reset
      ? {
          status: 'RESET',
          option: null,
          previousOptionHandle: reset.handle,
          resetReason: reset.reason,
          customerInput: input,
        }
      : {
          status: option ? 'SELECTED' : 'NONE',
          option,
          previousOptionHandle: null,
          resetReason: null,
          customerInput: option ? input : null,
        },
    shipping: option ? shippingOf(option, freeShipping) : null,
  };
}

/** The checkout with the option selected in the group, as the API settles it. */
export function withDeliveryOption(
  checkout: Checkout.Checkout,
  groupId: string,
  handle: string,
  input: unknown
): Checkout.Checkout {
  return {
    ...checkout,
    deliveryGroups: checkout.deliveryGroups.map((group) => {
      const option = group.deliveryMethods.find(
        (item) => item.handle === handle
      );
      return group.id === groupId && option
        ? {
            ...group,
            selection: {
              status: 'SELECTED',
              option,
              previousOptionHandle: null,
              resetReason: null,
              customerInput: input,
            },
            shipping: shippingOf(option, group.shipping?.freeShipping ?? null),
          }
        : group;
    }),
  };
}

/** The checkout with the customer input of the selected option saved in the group. */
export function withDeliveryInput(
  checkout: Checkout.Checkout,
  groupId: string,
  input: unknown
): Checkout.Checkout {
  return {
    ...checkout,
    deliveryGroups: checkout.deliveryGroups.map((group) =>
      group.id === groupId
        ? { ...group, selection: { ...group.selection, customerInput: input } }
        : group
    ),
  };
}

/**
 * The checkout with the address in every group. A new city drops the input of the selected
 * option: its branch or street belongs to the old one.
 */
export function withDeliveryAddress(
  checkout: Checkout.Checkout,
  address: Pick<
    Checkout.DeliveryAddress,
    'city' | 'countryCode' | 'provinceCode' | 'data'
  >
): Checkout.Checkout {
  const city = address.city ?? null;
  return {
    ...checkout,
    deliveryGroups: checkout.deliveryGroups.map((group) => ({
      ...group,
      deliveryAddress: {
        ...kyivAddress,
        ...address,
        city,
        formatted: city ? [city] : [],
        formattedArea: city,
      },
      selection:
        group.deliveryAddress?.city === city
          ? group.selection
          : { ...group.selection, customerInput: null },
    })),
  };
}
