import { describe, expect, it } from 'vitest';
import { issueSection } from '#checkout/state/issueSections';
import { SectionId } from '#checkout/state/interface';

const at = (field: string[], lineId: string | null = null) => issueSection({ field, lineId });

describe('issueSection', () => {
  it('maps the field path of an issue to its section', () => {
    expect(at(['cartIntent', 'discountCodes', '0'])).toBe(SectionId.Promo);
    expect(at(['loyaltyRedemption', 'points'])).toBe(SectionId.Loyalty);
    expect(at(['payment'])).toBe(SectionId.Payment);
    expect(at(['customerIdentity', 'email'])).toBe(SectionId.Contact);
    expect(at(['customerNote'])).toBe(SectionId.Comment);
    expect(at(['deliveryGroups', '0', 'deliveryAddress', 'postalCode'])).toBe(SectionId.Address);
    expect(at(['deliveryGroups', '0', 'recipient', 'phone'])).toBe(SectionId.Recipient);
    expect(at(['deliveryGroups', '0', 'selectedDeliveryOption'])).toBe(SectionId.Delivery);
  });

  it('keeps issues of lines and of the whole checkout above the button', () => {
    expect(at([])).toBeNull();
    expect(at(['cart', 'lines'])).toBeNull();
    expect(at(['payment'], 'line-1')).toBeNull();
  });

  it('routes a missing delivery destination of a line to the address section', () => {
    expect(at(['delivery', 'destinations'], 'line-1')).toBe(SectionId.Address);
  });
});
