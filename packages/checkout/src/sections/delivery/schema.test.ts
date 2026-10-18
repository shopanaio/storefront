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

const option = (data: unknown, customerInputContract: unknown = contract): DeliveryMethod => ({
  handle: 'h-np',
  code: 'warehouse-warehouse',
  title: 'warehouse-warehouse',
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
    lines: [],
    deliveryMethods: [option(undefined)],
    selectedDeliveryMethod: selected,
    address: null,
    resetReason: null,
    previousOptionHandle: null,
  },
});

const validate = (data: DeliveryFormData) =>
  deliveryFormSchema.resolve({ value: data }).validate(data, { abortEarly: false });

describe('deliveryFormSchema', () => {
  it('requires the customer input to satisfy the option contract', async () => {
    await expect(validate(form(option(undefined)))).rejects.toThrow(
      'Complete the delivery details'
    );
    await expect(
      validate(
        form(option({ type: 'WAREHOUSE', settlementRef: SETTLEMENT, warehouseRef: WAREHOUSE }))
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

describe('deliveryFormSchema with stored customer input', () => {
  it('validates the input saved for the selected option, not the bare API option', async () => {
    const { mergeCustomerInputs } = await import('./withCustomerInputs');
    const { addressScope } = await import('./customerInputStorage');
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
    const fromApi: DeliveryFormData = {
      g1: { ...form(option(undefined)).g1, address },
    };
    const input = { type: 'WAREHOUSE', settlementRef: SETTLEMENT, warehouseRef: WAREHOUSE };

    await expect(validate(fromApi)).rejects.toThrow();
    const merged = mergeCustomerInputs(fromApi, {
      g1: { scope: addressScope(address), inputs: { 'h-np': { input, synced: true } } },
    });
    expect(merged?.g1.selectedDeliveryMethod?.data).toEqual(input);
    await expect(validate(merged!)).resolves.toBeTruthy();
  });
});

describe('deliveryFormSchema with an unsaved edit', () => {
  it('blocks the order until the API accepts the edited input', async () => {
    const input = { type: 'WAREHOUSE', settlementRef: SETTLEMENT, warehouseRef: WAREHOUSE };
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
