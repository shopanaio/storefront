import { describe, expect, it } from 'vitest';
import { doorInput, pointInput, readInput } from './customerInput';

const SETTLEMENT = 'e718a680-4b33-11e4-ab6d-005056801329';
const STREET = 'a1b2c3d4-0000-4000-8000-000000000001';

describe('Nova Poshta customer input', () => {
  it('builds a branch and a postomat input', () => {
    expect(pointInput('POSTOMAT', SETTLEMENT, STREET)).toEqual({
      type: 'POSTOMAT',
      settlementRef: SETTLEMENT,
      warehouseRef: STREET,
    });
  });

  it('builds a courier input without empty optional fields and without cityRef', () => {
    expect(
      doorInput({
        settlementRef: SETTLEMENT,
        streetRef: STREET,
        streetName: 'Хрещатик',
        building: ' 22 ',
        apartment: ' ',
        comment: 'Код 15',
      })
    ).toEqual({
      type: 'DOOR',
      settlementRef: SETTLEMENT,
      streetRef: STREET,
      streetName: 'Хрещатик',
      building: '22',
      comment: 'Код 15',
    });
  });

  it('reads back only an input of the same type and settlement', () => {
    const input = pointInput('WAREHOUSE', SETTLEMENT, STREET);
    expect(readInput(input, 'WAREHOUSE', SETTLEMENT)).toBe(input);
    expect(readInput(input, 'POSTOMAT', SETTLEMENT)).toBeNull();
    expect(readInput(input, 'WAREHOUSE', STREET)).toBeNull();
    expect(readInput(undefined, 'DOOR', SETTLEMENT)).toBeNull();
  });
});
