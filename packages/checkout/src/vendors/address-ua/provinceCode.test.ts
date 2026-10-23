import { describe, expect, it } from 'vitest';
import { settlementProvinceCode } from './provinceCode';

describe('settlementProvinceCode', () => {
  it('maps the area of a settlement to its oblast code', () => {
    expect(
      settlementProvinceCode({
        name: 'Бровари',
        area: 'Київська',
        settlementType: 'місто',
      })
    ).toBe('32');
    expect(
      settlementProvinceCode({
        name: 'Яремче',
        area: 'Івано-Франківська обл.',
        settlementType: 'місто',
      })
    ).toBe('26');
  });

  it('gives the city of Kyiv its own code', () => {
    expect(
      settlementProvinceCode({
        name: 'Київ',
        area: 'Київська',
        settlementType: 'м.',
      })
    ).toBe('30');
  });

  it('returns null for an unknown area', () => {
    expect(
      settlementProvinceCode({
        name: 'Село',
        area: null,
        settlementType: 'село',
      })
    ).toBeNull();
  });
});
