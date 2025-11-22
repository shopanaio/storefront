import type { SectionInstance } from './section';
import type { TemplateParams } from './page';

export interface PageTemplate<TData = unknown> {
  name: string;
  sections: SectionInstance<any, TData>[];
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
