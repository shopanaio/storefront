'use client';

import type { ComponentType } from 'react';
import { ContactSection } from './contact/components/Container';
import { AddressSection } from './address/components/Container';
import { DeliverySection } from './delivery/components/Container';
import { PaymentSection } from './payment/components/Container';
import { RecipientSection } from './recipient/components/Container';
import { CommentSection } from './comment/components/Container';
import { PromoSection } from './promo/components/Container';
import { SectionId } from '@src/modules/checkout/state/interface';

export interface SectionConfig {
  slug: SectionId;
  /** i18n key for section title under Checkout namespace */
  titleKey: string;
  Component: ComponentType<Record<string, never>>;
}

/**
 * Map of all checkout sections.
 * Each section is directly imported and mapped to its slug.
 */
export const sections: Record<SectionId, SectionConfig> = {
  [SectionId.Contact]: {
    slug: SectionId.Contact,
    titleKey: 'contact',
    Component: ContactSection,
  },
  [SectionId.Address]: {
    slug: SectionId.Address,
    titleKey: 'address',
    Component: AddressSection,
  },
  [SectionId.Delivery]: {
    slug: SectionId.Delivery,
    titleKey: 'shipping',
    Component: DeliverySection,
  },
  [SectionId.Payment]: {
    slug: SectionId.Payment,
    titleKey: 'payment',
    Component: PaymentSection,
  },
  [SectionId.Recipient]: {
    slug: SectionId.Recipient,
    titleKey: 'recipient',
    Component: RecipientSection,
  },
  [SectionId.Comment]: {
    slug: SectionId.Comment,
    titleKey: 'comment',
    Component: CommentSection,
  },
  [SectionId.Promo]: {
    slug: SectionId.Promo,
    titleKey: 'promo',
    Component: PromoSection,
  },
};
