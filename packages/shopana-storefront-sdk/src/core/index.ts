// Публичные типы для потребителей пакета
export type {
  Template,
  PageTemplate,
  LayoutProps,
  SectionProps,
  BlockProps,
  PageType,
  PageDataLoader,
  MetadataBuilder,
  TemplateParams,
} from './types';

export { Builder } from './Builder';

export {
  TemplateDataProvider,
  useTemplateData,
} from './TemplateDataContext';

export { Section } from './Section';
export { Block } from './Block';

export {
  ErrorBoundary,
  SectionErrorBoundary,
  BlockErrorBoundary,
} from './ErrorBoundary';

// Route parsing utilities
export { parseRoute } from '../utils/routeParser';
export type { ParsedRoute } from '../utils/routeParser';

