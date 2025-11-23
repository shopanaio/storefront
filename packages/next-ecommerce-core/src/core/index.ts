// Публичные типы для потребителей пакета
export type {
  Template,
  LayoutProps,
  SectionProps,
  BlockProps,
  PageType,
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

export {
  registerTemplate,
  getTemplateRegistration,
  getRegisteredPageTypes,
} from './templateRegistry';

