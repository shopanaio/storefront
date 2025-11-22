import type { ReactNode } from 'react';
import type { PageTemplate } from './template';

export type PageType = 'home' | 'product' | 'collection' | 'page' | 'cart';

export interface TemplateParams {
  pageType: PageType;
  params: Record<string, string | undefined>;
  searchParams?: Record<string, string | string[] | undefined>;
}

export interface PageBuilderProps<TData = unknown> {
  template: PageTemplate<TData>;
  data: TData;
  pageType: PageType;
  fallback?: ReactNode;
}
