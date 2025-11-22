import type { ComponentType, ReactNode, LazyExoticComponent } from 'react';

export type PageType = 'home' | 'product' | 'collection' | 'page' | 'cart';

export interface TemplateParams {
  pageType: PageType;
  params: Record<string, string | undefined>;
  searchParams?: Record<string, string | string[] | undefined>;
}

export interface BlockInstance<TSettings = Record<string, any>> {
  id: string;
  type: string;
  settings: TSettings;
  blocks?: BlockInstance[];
}

export interface SectionProps<TSettings = Record<string, any>, TData = unknown> {
  id: string;
  settings: TSettings;
  blocks?: BlockInstance[];
  data: TData;
}

export type SectionComponent<TSettings = any, TData = any> =
  | ComponentType<SectionProps<TSettings, TData>>
  | LazyExoticComponent<ComponentType<SectionProps<TSettings, TData>>>;

export interface SectionInstance<TSettings = any, TData = any> {
  id: string;
  component: SectionComponent<TSettings, TData>;
  settings: TSettings;
  blocks?: BlockInstance[];
}

export interface PageTemplate<TData = unknown> {
  name: string;
  sections: SectionInstance<any, TData>[];
}

export interface PageBuilderProps<TData = unknown> {
  template: PageTemplate<TData>;
  data: TData;
  pageType: PageType;
  fallback?: ReactNode;
}

export interface TemplateLoaderContext<TData = unknown> extends TemplateParams {
  resolved?: TData;
}

export type PageDataLoader<TData = unknown> = (ctx: TemplateParams) => Promise<TData>;

export type MetadataBuilder<TData = unknown, TMetadata = Record<string, any>> = (
  ctx: TemplateLoaderContext<TData>
) => Promise<TMetadata> | TMetadata;

export interface TemplateRegistration<TData = unknown> {
  template: PageTemplate<TData>;
  loadData: PageDataLoader<TData>;
  buildMetadata?: MetadataBuilder<TData>;
}
