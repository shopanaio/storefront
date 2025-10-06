'use client';

import type { ComponentType } from 'react';
import { ContactSection } from './contact/components/ContactSection';
import { AddressSection } from './address/components/AddressSection';
import { DeliverySection } from './delivery/components/DeliverySection';
import { PaymentSection } from './payment/components/PaymentSection';
import { RecipientSection } from './recipient/components/RecipientSection';
import { CommentSection } from './comment/components/CommentSection';
import { PromoSection } from './promo/components/PromoSection';

export type SectionSlug = 'contact' | 'recipient' | 'address' | 'delivery' | 'payment' | 'promo' | 'comment';

export interface SectionConfig {
  slug: SectionSlug;
  /** i18n key for section title under Checkout namespace */
  titleKey: string;
  Component: ComponentType<{}>;
}

/**
 * Map of all checkout sections.
 * Each section is directly imported and mapped to its slug.
 */
export const sections: Record<SectionSlug, SectionConfig> = {
  contact: {
    slug: 'contact',
    titleKey: 'contact',
    Component: ContactSection,
  },
  address: {
    slug: 'address',
    titleKey: 'address',
    Component: AddressSection,
  },
  delivery: {
    slug: 'delivery',
    titleKey: 'shipping',
    Component: DeliverySection,
  },
  payment: {
    slug: 'payment',
    titleKey: 'payment',
    Component: PaymentSection,
  },
  recipient: {
    slug: 'recipient',
    titleKey: 'recipient',
    Component: RecipientSection,
  },
  comment: {
    slug: 'comment',
    titleKey: 'comment',
    Component: CommentSection,
  },
  promo: {
    slug: 'promo',
    titleKey: 'promo',
    Component: PromoSection,
  },
};
