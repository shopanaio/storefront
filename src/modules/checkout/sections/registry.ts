import type { ComponentType } from 'react';

export type SectionSlug = 'contact' | 'recipient' | 'address' | 'delivery' | 'payment';

export interface SectionProps {
  country: 'UA' | 'INTL';
}

export interface SectionModuleApi {
  slug: SectionSlug;
  /** i18n key for section title under Checkout namespace */
  titleKey: string;
  Component: ComponentType<SectionProps>;
}

type AsyncLoader<T> = () => Promise<T> | T;

class SectionRegistry {
  private readonly bySlug = new Map<SectionSlug, AsyncLoader<SectionModuleApi>>();

  register(slug: SectionSlug, loader: AsyncLoader<SectionModuleApi>) {
    this.bySlug.set(slug, loader);
  }

  resolve(slug: SectionSlug): AsyncLoader<SectionModuleApi> | undefined {
    return this.bySlug.get(slug);
  }

  list(): SectionSlug[] {
    return Array.from(this.bySlug.keys());
  }
}

export const sectionRegistry = new SectionRegistry();

export function registerSection(slug: SectionSlug, loader: AsyncLoader<SectionModuleApi>) {
  sectionRegistry.register(slug, loader);
}
