import { describe, expect, it } from 'vitest';
import {
  contractBranch,
  contractSchema,
  resolveSchema,
  validateCustomerInput,
} from './jsonSchema';

const REF = 'e718a680-4b33-11e4-ab6d-005056801329';
const OTHER_REF = '8d5a980d-391c-11dd-90d9-001a92567626';

/** The Nova Poshta contract as the app publishes it. */
const novaPoshtaContract = {
  schemaDialect: 'https://json-schema.org/draft/2020-12/schema',
  schema: {
    oneOf: ['WAREHOUSE', 'POSTOMAT', 'DOOR'].map((type) => ({
      type: 'object',
      additionalProperties: false,
      properties: {
        type: { const: type },
        settlementRef: { type: 'string', format: 'uuid' },
        cityRef: { type: 'string', format: 'uuid' },
        ...(type === 'DOOR'
          ? {
              streetRef: { type: 'string', format: 'uuid' },
              streetName: { type: 'string', minLength: 1, maxLength: 100 },
              building: { type: 'string', minLength: 1, maxLength: 50 },
              apartment: { type: 'string', maxLength: 50 },
              comment: { type: 'string', maxLength: 500 },
            }
          : { warehouseRef: { type: 'string', format: 'uuid' } }),
      },
      required:
        type === 'DOOR'
          ? ['type', 'settlementRef', 'streetRef', 'streetName', 'building']
          : ['type', 'settlementRef', 'warehouseRef'],
    })),
  },
};

describe('validateCustomerInput', () => {
  it('accepts every Nova Poshta input shape', () => {
    expect(
      validateCustomerInput(novaPoshtaContract, {
        type: 'WAREHOUSE',
        settlementRef: REF,
        warehouseRef: OTHER_REF,
      })
    ).toEqual([]);
    expect(
      validateCustomerInput(novaPoshtaContract, {
        type: 'DOOR',
        settlementRef: REF,
        streetRef: OTHER_REF,
        streetName: 'Хрещатик',
        building: '1',
      })
    ).toEqual([]);
  });

  it('points at the missing field of the closest branch', () => {
    expect(
      validateCustomerInput(novaPoshtaContract, {
        type: 'DOOR',
        settlementRef: REF,
        streetRef: OTHER_REF,
        streetName: 'Хрещатик',
      })
    ).toEqual([{ path: 'building', keyword: 'required' }]);
  });

  it('rejects unknown fields and malformed refs', () => {
    expect(
      validateCustomerInput(novaPoshtaContract, {
        type: 'WAREHOUSE',
        settlementRef: 'kyiv',
        warehouseRef: OTHER_REF,
        warehouse: {},
      })
    ).toEqual([
      { path: 'settlementRef', keyword: 'format' },
      { path: 'warehouse', keyword: 'additionalProperties' },
    ]);
  });

  it('accepts only an absent input without a contract', () => {
    expect(validateCustomerInput(null, undefined)).toEqual([]);
    expect(validateCustomerInput(null, { a: 1 })).toHaveLength(1);
  });

  it('validates a flat contract such as test-fedex', () => {
    const contract = {
      schema: {
        type: 'object',
        properties: {
          pickupPointId: { type: 'string', minLength: 1, maxLength: 128 },
        },
        additionalProperties: false,
      },
    };
    expect(validateCustomerInput(contract, {})).toEqual([]);
    expect(validateCustomerInput(contract, { pickupPointId: '' })).toEqual([
      { path: 'pickupPointId', keyword: 'minLength' },
    ]);
  });
});

describe('contract helpers', () => {
  it('reads the schema and the branch by type', () => {
    expect(contractSchema(novaPoshtaContract)?.oneOf).toHaveLength(3);
    expect(
      contractBranch(novaPoshtaContract, 'POSTOMAT')?.required
    ).toContain('warehouseRef');
    expect(contractBranch(novaPoshtaContract, 'LOCKER')).toBeNull();
  });

  it('follows local refs, allOf and array items', () => {
    const contract = {
      schema: {
        $defs: { code: { type: 'string', minLength: 2 } },
        allOf: [
          { type: 'object', properties: { code: { $ref: '#/$defs/code' } }, required: ['code'] },
          {
            type: 'object',
            properties: { boxes: { type: 'array', items: { type: 'integer', exclusiveMinimum: 0 }, maxItems: 2 } },
          },
        ],
      },
    };

    expect(validateCustomerInput(contract, { code: 'AB', boxes: [1, 2] })).toEqual([]);
    expect(validateCustomerInput(contract, { code: 'A' })).toEqual([
      { path: 'code', keyword: 'minLength' },
    ]);
    expect(validateCustomerInput(contract, { boxes: [0, 1, 2] })).toEqual([
      { path: 'code', keyword: 'required' },
      { path: 'boxes', keyword: 'maxItems' },
      { path: 'boxes.0', keyword: 'exclusiveMinimum' },
    ]);
  });

  it('merges allOf parts and refs into one schema for forms', () => {
    const root = {
      $defs: { street: { type: 'object', properties: { street: { type: 'string' } }, required: ['street'] } },
      allOf: [{ $ref: '#/$defs/street' }, { properties: { flat: { type: 'string' } } }],
    } as const;

    const resolved = resolveSchema(root as never, root as never);
    expect(Object.keys(resolved.properties ?? {})).toEqual(['street', 'flat']);
    expect(resolved.required).toEqual(['street']);
  });
});

