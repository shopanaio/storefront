import { describe, expect, it } from 'vitest';
import {
  contractFormModel,
  contractNeedsForm,
  formInput,
  formValues,
} from './customerInputForm';

const contract = {
  schema: {
    type: 'object',
    required: ['account', 'packages'],
    properties: {
      account: { type: 'string', minLength: 1 },
      reference: { type: ['string', 'null'] },
      packages: { type: 'integer', minimum: 1 },
      signature: { type: 'boolean' },
      service: { enum: ['GROUND', 'EXPRESS'] },
      contact: {
        type: 'object',
        properties: { phone: { type: 'string' } },
      },
    },
  },
};

describe('customer input form model', () => {
  it('builds the input from text, number, checkbox, choice and nested fields', () => {
    const model = contractFormModel(contract)!;
    expect(model.supported).toBe(true);

    expect(
      formInput(model, {
        account: ' 123 ',
        reference: '',
        packages: '2',
        signature: true,
        service: 'EXPRESS',
        'contact.phone': '+380',
      })
    ).toEqual({
      account: '123',
      packages: 2,
      signature: true,
      service: 'EXPRESS',
      contact: { phone: '+380' },
    });
  });

  it('restores the values of an input entered before', () => {
    const model = contractFormModel(contract)!;
    const input = { account: '1', packages: 3, contact: { phone: '5' } };

    expect(formInput(model, formValues(model, input))).toEqual(input);
  });

  it('picks a oneOf branch by its constant and fills the constant in', () => {
    const model = contractFormModel({
      schema: {
        oneOf: [
          {
            type: 'object',
            title: 'Pickup point',
            properties: { type: { const: 'POINT' }, pointId: { type: 'string' } },
          },
          {
            type: 'object',
            properties: { type: { const: 'DOOR' }, street: { type: 'string' } },
          },
        ],
      },
    })!;

    expect(model.choice?.branches.map((branch) => branch.title)).toEqual([
      'Pickup point',
      'DOOR',
    ]);
    expect(formInput(model, { type: 'DOOR', street: 'Main' })).toEqual({
      type: 'DOOR',
      street: 'Main',
    });
  });

  it('marks a contract the form cannot fill, so the option says so', () => {
    const arrays = {
      schema: {
        type: 'object',
        required: ['items'],
        properties: { items: { type: 'array', items: { type: 'string' } } },
      },
    };

    expect(contractFormModel(arrays)?.supported).toBe(false);
    expect(contractNeedsForm(arrays)).toBe(true);
    expect(contractNeedsForm({ schema: { type: 'object', properties: {} } })).toBe(false);
    expect(contractNeedsForm(null)).toBe(false);
  });
});
