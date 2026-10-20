import { describe, expect, it } from 'vitest';
import type { DeliveryFormData, DeliveryMethod } from './types';
import { deliveryFormSchema } from './schema';

const SETTLEMENT = 'e718a680-4b33-11e4-ab6d-005056801329';
const WAREHOUSE = '8d5a980d-391c-11dd-90d9-001a92567626';

const contract = {
  schema: {
    oneOf: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          type: { const: 'WAREHOUSE' },
          settlementRef: { type: 'string', format: 'uuid' },
          warehouseRef: { type: 'string', format: 'uuid' },
        },
        required: ['type', 'settlementRef', 'warehouseRef'],
      },
    ],
  },
};

/** Key of the Nova Poshta branch method among the stored inputs (`methodKey`). */
const NP_WAREHOUSE = 'nova-poshta\nwarehouse';

const option = (
  data: unknown,
  customerInputContract: unknown = contract,
  handle = 'h-np'
): DeliveryMethod => ({
  handle,
  code: 'warehouse',
  title: 'warehouse',
  provider: 'nova-poshta',
  carrierCode: 'nova-poshta',
  cost: { amount: 80, currencyCode: 'UAH' },
  paymentModel: 'MERCHANT_COLLECTED',
  estimatedMinDeliveryAt: null,
  estimatedMaxDeliveryAt: null,
  data,
  customerInputContract,
  publicData: {},
});

const form = (selected: DeliveryMethod | null): DeliveryFormData => ({
  g1: {
    id: 'g1',
    replacesGroupIds: [],
    lines: [],
    deliveryMethods: [option(undefined)],
    selectedDeliveryMethod: selected,
    address: null,
    resetReason: null,
    previousOptionHandle: null,
    savedInput: null,
  },
});

const validate = (data: DeliveryFormData) =>
  deliveryFormSchema
    .resolve({ value: data })
    .validate(data, { abortEarly: false });

describe('deliveryFormSchema', () => {
  it('requires the customer input to satisfy the option contract', async () => {
    await expect(validate(form(option(undefined)))).rejects.toThrow(
      'Complete the delivery details'
    );
    await expect(
      validate(
        form(
          option({
            type: 'WAREHOUSE',
            settlementRef: SETTLEMENT,
            warehouseRef: WAREHOUSE,
          })
        )
      )
    ).resolves.toBeTruthy();
  });

  it('accepts an option without a contract and without input', async () => {
    await expect(validate(form(option(undefined, null)))).resolves.toBeTruthy();
  });

  it('requires a selected option', async () => {
    await expect(validate(form(null))).rejects.toThrow();
  });
});

describe('deliveryFormSchema with the customer input of the checkout', () => {
  const address = {
    addressId: 'a1',
    countryCode: 'UA',
    address1: null,
    address2: null,
    postalCode: null,
    provinceCode: null,
    city: 'Київ',
    data: { carriers: { 'nova-poshta': { settlementRef: SETTLEMENT } } },
  };
  const input = {
    type: 'WAREHOUSE',
    settlementRef: SETTLEMENT,
    warehouseRef: WAREHOUSE,
  };

  it('SC-ytuv: shows the branch the checkout saved, with nothing kept in the browser', async () => {
    const { mergeCustomerInputs } = await import('./withCustomerInputs');
    const fromApi: DeliveryFormData = {
      g1: { ...form(option(undefined)).g1, address, savedInput: input },
    };

    const merged = mergeCustomerInputs(fromApi, {});
    expect(merged?.g1.selectedDeliveryMethod).toMatchObject({
      data: input,
      synced: true,
    });
    await expect(validate(merged!)).resolves.toBeTruthy();
  });

  it('SC-sf3h: keeps the input typed for a group whose id changed with its lines', async () => {
    const { mergeCustomerInputs } = await import('./withCustomerInputs');
    const { addressScope } = await import('./customerInputStorage');
    // The new group quotes the method again, so its option has a new handle.
    const quotedAgain = option(undefined, contract, 'h-np-requoted');
    const regrouped: DeliveryFormData = {
      g2: {
        ...form(quotedAgain).g1,
        id: 'g2',
        replacesGroupIds: ['g1'],
        deliveryMethods: [quotedAgain],
        address,
      },
    };

    const merged = mergeCustomerInputs(regrouped, {
      g1: {
        scope: addressScope(address),
        inputs: { [NP_WAREHOUSE]: { input, synced: false } },
      },
    });
    expect(merged?.g2.selectedDeliveryMethod).toMatchObject({
      data: input,
      synced: false,
    });
  });

  it('keeps the display state of a saved branch the API returns with its keys reordered', async () => {
    const { mergeCustomerInputs } = await import('./withCustomerInputs');
    const { addressScope } = await import('./customerInputStorage');
    // `jsonb` orders the keys its own way.
    const fromApi: DeliveryFormData = {
      g1: {
        ...form(option(undefined)).g1,
        address,
        savedInput: {
          warehouseRef: WAREHOUSE,
          type: 'WAREHOUSE',
          settlementRef: SETTLEMENT,
        },
      },
    };
    const view = { number: '5', shortAddress: 'Main st. 1' };

    const merged = mergeCustomerInputs(fromApi, {
      g1: {
        scope: addressScope(address),
        inputs: { [NP_WAREHOUSE]: { input, view, synced: true } },
      },
    });
    expect(merged?.g1.selectedDeliveryMethod).toMatchObject({
      view,
      synced: true,
    });
  });

  it('keeps an unsaved edit over the saved input, and follows a newer saved input', async () => {
    const { mergeCustomerInputs } = await import('./withCustomerInputs');
    const { addressScope } = await import('./customerInputStorage');
    const other = {
      ...input,
      warehouseRef: '20000000-0000-4000-8000-000000000002',
    };
    const fromApi: DeliveryFormData = {
      g1: { ...form(option(undefined)).g1, address, savedInput: other },
    };
    const drafts = (synced: boolean) => ({
      g1: {
        scope: addressScope(address),
        inputs: { [NP_WAREHOUSE]: { input, synced } },
      },
    });

    // Typed here and not saved yet: the buyer's input stays (BR-q7dr).
    expect(
      mergeCustomerInputs(fromApi, drafts(false))?.g1.selectedDeliveryMethod
        ?.data
    ).toEqual(input);
    // Saved here, then another tab saved another branch: the checkout shows that one.
    expect(
      mergeCustomerInputs(fromApi, drafts(true))?.g1.selectedDeliveryMethod
    ).toMatchObject({
      data: other,
      synced: true,
    });
  });
});

describe('deliveryFormSchema with an unsaved edit', () => {
  it('blocks the order until the API accepts the edited input', async () => {
    const input = {
      type: 'WAREHOUSE',
      settlementRef: SETTLEMENT,
      warehouseRef: WAREHOUSE,
    };
    await expect(
      validate(form({ ...option(input), synced: false }))
    ).rejects.toThrow('Saving the delivery details');
    await expect(
      validate(form({ ...option(input), synced: true }))
    ).resolves.toBeTruthy();
  });
});

describe('initial customer input', () => {
  it('is an empty object for a contract with optional fields only', async () => {
    const { mergeCustomerInputs } = await import('./withCustomerInputs');
    const optional = {
      schema: {
        type: 'object',
        properties: { pickupPointId: { type: 'string', minLength: 1 } },
        additionalProperties: false,
      },
    };
    const merged = mergeCustomerInputs(form(option(undefined, optional)), {});
    expect(merged?.g1.selectedDeliveryMethod?.data).toEqual({});
    await expect(validate(merged!)).resolves.toBeTruthy();

    // A contract with required fields still needs the customer's input.
    const required = mergeCustomerInputs(form(option(undefined)), {});
    expect(required?.g1.selectedDeliveryMethod?.data).toBeUndefined();
  });
});
