import { makeSection } from '#checkout/components/section/makeSection';
import { SectionId } from '#checkout/state/interface';
import Component from './Component';
import type { LoyaltyFormData } from '../types';
import { mapCheckoutToLoyaltyFormData } from '../mapper';
import { loyaltyFormSchema } from '../schema';

/** Loyalty block of the order summary: balance, points or store credit, rewards. */
export const LoyaltySection = makeSection<LoyaltyFormData>({
  id: SectionId.Loyalty,
  required: false,
  Component,
  selector: mapCheckoutToLoyaltyFormData,
  schema: loyaltyFormSchema,
  displayName: 'LoyaltySection',
});
