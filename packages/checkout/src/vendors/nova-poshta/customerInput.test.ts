import { describe, expect, it } from 'vitest';
import { doorInput, pointInput, readInput } from './customerInput';

const SETTLEMENT = 'e718a680-4b33-11e4-ab6d-005056801329';
const CITY = '8d5a980d-391c-11dd-90d9-001a92567626';
const STREET = 'a1b2c3d4-0000-4000-8000-000000000001';
const SETTLEMENT_HINT = { settlementRef: SETTLEMENT, cityRef: CITY };

describe('Nova Poshta customer input', () => {
  it('builds a branch and a postomat input', () => {
    expect(pointInput('POSTOMAT', SETTLEMENT_HINT, STREET)).toEqual({
      type: 'POSTOMAT',
      settlementRef: SETTLEMENT,
      cityRef: CITY,
      warehouseRef: STREET,
    });
  });

  it('builds a courier input with the carrier city and without empty optional fields', () => {
    expect(
      doorInput({
        ...SETTLEMENT_HINT,
        streetRef: STREET,
        streetName: 'Хрещатик',
        building: ' 22 ',
        apartment: ' ',
        comment: 'Код 15',
      })
    ).toEqual({
      type: 'DOOR',
      settlementRef: SETTLEMENT,
      cityRef: CITY,
      streetRef: STREET,
      streetName: 'Хрещатик',
      building: '22',
      comment: 'Код 15',
    });
  });

  it('reads back only an input of the same type and settlement', () => {
    const input = pointInput('WAREHOUSE', SETTLEMENT_HINT, STREET);
    expect(readInput(input, 'WAREHOUSE', SETTLEMENT)).toBe(input);
    expect(readInput(input, 'POSTOMAT', SETTLEMENT)).toBeNull();
    expect(readInput(input, 'WAREHOUSE', STREET)).toBeNull();
    expect(readInput(undefined, 'DOOR', SETTLEMENT)).toBeNull();
  });
});
