// Types
export type {
  PageType,
  SectionProps,
  PageTemplate,
  SectionInstance,
  PageBuilderProps,
  TemplateRegistration,
  PageDataLoader,
  MetadataBuilder,
  TemplateParams,
  BlockInstance,
  SectionComponent,
  TemplateLoaderContext,
} from './types';

// Builder
export { PageBuilder, SectionErrorBoundary } from './builder';

// Context
export { PageDataContext, PageDataProvider, usePageData } from './context';
export type { PageDataContextValue } from './context';

// Registry
export {
  registerTemplate,
  registerTemplates,
  clearTemplates,
  getTemplateRegistration,
} from './registry';
export type { TemplateRegistry, TemplateConfig } from './registry';

// Router
export { parseRoute, resolvePageRequest, ROUTE_CONFIG } from './router';
export type { RouteMatch, ResolvedPage, RouteConfig } from './router';
