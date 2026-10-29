import type { ComponentType, LazyExoticComponent, ReactNode } from 'react';
import type {
  BlockSettingsSchema,
  EmptyBlockSettings,
  EmptySectionSettings,
  SectionSettingsSchema,
} from './settings';

export type PageType =
  | 'home'
  | 'product'
  | 'category'
  | 'collection'
  | 'search'
  | 'blog'
  | 'article'
  | 'page'
  | 'cart'
  | 'list-collections'
  | 'vendor'
  | '404';

export interface TemplateParams {
  pageType: PageType;
  params: Record<string, string | undefined>;
  searchParams?: Record<string, string | string[] | undefined>;
}

export interface BlockProps<TSettings = any> {
  id: string;
  settings: TSettings;
}

export type BlockComponent<TSettings = any> =
  | ComponentType<BlockProps<TSettings>>
  | LazyExoticComponent<ComponentType<BlockProps<TSettings>>>;

export interface BlockInstance<TSettings = any> extends BlockProps<TSettings> {
  component: BlockComponent<TSettings>;
}

export interface BlockConfig<TSettings extends object = EmptyBlockSettings> {
  component: BlockComponent<TSettings>;
  settings: TSettings;
  /** Metadata consumed by a Shopify-like theme editor. */
  schema?: BlockSettingsSchema<TSettings>;
}

export interface BlockCollection {
  order: string[];
  // Each key is either a block config or the special "order" array.
  [blockId: string]: BlockConfig<any> | string[];
}

export interface SectionProps<TSettings = any, TData = any> {
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

export interface SectionConfig<
  TSettings extends object = EmptySectionSettings,
  TData = any,
> {
  component: SectionComponent<TSettings, TData>;
  settings: TSettings;
  blocks?: BlockCollection;
  /** Metadata consumed by a Shopify-like theme editor. */
  schema?: SectionSettingsSchema<TSettings>;
}

export interface SectionCollection<TData = any> {
  order: string[];
  // Each key is either a section config or the special "order" array.
  [sectionId: string]: SectionConfig<any, TData> | string[];
}

export interface PageTemplateSkeletonProps<TData = any> {
  data: TData;
}

export interface PageTemplate<TData = any> {
  sections: SectionCollection<TData>;
  /**
   * The whole page while its sections load their data (see Builder): for a page whose
   * sections load it together, a product or a listing. It may read the Apollo cache
   * (cache-only) to show what is known. Without it each section shows its own fallback.
   */
  skeleton?: ComponentType<PageTemplateSkeletonProps<TData>>;
}

export type Template<TData = any> = PageTemplate<TData>;

export interface PageBuilderProps<TData = any> {
  template: PageTemplate<TData>;
  data: TData;
  pageType: PageType;
  fallback?: ReactNode;
  /**
   * What ends the page after its sections (the site's footer): part of the page, so with a
   * `skeleton` it shows with the loaded page, not under the skeleton.
   */
  end?: ReactNode;
}

export type PageDataLoader<TData = any> = (
  ctx: TemplateParams
) => Promise<TData>;

export type MetadataBuilder<TData = any, TMetadata = Record<string, any>> = (
  ctx: TemplateParams & { resolved?: TData }
) => Promise<TMetadata> | TMetadata;

export interface TemplateRegistration<TData = any> {
  template: PageTemplate<TData>;
  loadData: PageDataLoader<TData>;
  buildMetadata?: MetadataBuilder<TData>;
}
