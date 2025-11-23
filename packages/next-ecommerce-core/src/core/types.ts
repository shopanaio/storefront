import type {
  ComponentType,
  LazyExoticComponent,
  ReactNode,
} from 'react';

export type PageType =
  | 'home'
  | 'product'
  | 'collection'
  | 'search'
  | 'blog'
  | 'article'
  | 'page'
  | 'cart'
  | 'list-collections'
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

export interface BlockConfig<TSettings = any> {
  component: BlockComponent<TSettings>;
  settings: TSettings;
}

export interface BlockCollection<TSettings = any> {
  order: string[];
  // Each key is either a block config or the special "order" array.
  [blockId: string]: BlockConfig<TSettings> | string[];
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

export interface SectionConfig<TSettings = any, TData = any> {
  component: SectionComponent<TSettings, TData>;
  settings: TSettings;
  blocks?: BlockCollection;
}

export interface SectionCollection<TData = any> {
  order: string[];
  // Each key is either a section config or the special "order" array.
  [sectionId: string]: SectionConfig<any, TData> | string[];
}

export interface LayoutProps {
  children: ReactNode;
}

export type LayoutComponent =
  | ComponentType<LayoutProps>
  | LazyExoticComponent<ComponentType<LayoutProps>>;

export interface TemplateLayout<TSettings = any, TData = any> {
  component: LayoutComponent;
  settings?: TSettings;
}

export interface PageTemplate<TData = any, TLayoutSettings = any> {
  layout: TemplateLayout<TLayoutSettings, TData>;
  sections: SectionCollection<TData>;
}

export type Template<TData = any, TLayoutSettings = any> = PageTemplate<
  TData,
  TLayoutSettings
>;

export interface PageBuilderProps<TData = any> {
  template: PageTemplate<TData>;
  data: TData;
  pageType: PageType;
  fallback?: ReactNode;
}

export type PageDataLoader<TData = any> = (
  ctx: TemplateParams,
) => Promise<TData>;

export type MetadataBuilder<
  TData = any,
  TMetadata = Record<string, any>,
> = (
  ctx: TemplateParams & { resolved?: TData },
) => Promise<TMetadata> | TMetadata;

export interface TemplateRegistration<TData = any> {
  template: PageTemplate<TData>;
  loadData: PageDataLoader<TData>;
  buildMetadata?: MetadataBuilder<TData>;
}
