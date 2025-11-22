export {
  pageBuilderRegistry,
  registerSection,
  registerBlock,
  registerLayout,
} from './registry';
export * from './types';
export { createPageBuilderStore } from './store';
export { PageBuilderStoreProvider, PageBuilderStoreContext } from './store-provider';
export {
  usePage,
  usePageOptional,
  useSection,
  useBlock,
  usePageBuilder,
  usePageBuilderStore,
  usePageBuilderState,
  usePageBuilderActions,
} from './hooks';
export {
  validateTemplate,
  getAvailableSectionsForPageType,
  getAvailableBlocksForSection,
  canSectionBeUsedOnPage,
} from './validation';
export { PageBuilder } from './PageBuilder';
export { PageBuilderSSR } from './PageBuilderSSR';
export { SectionRenderer } from './SectionRenderer';
export { BlockRenderer } from './BlockRenderer';
export { LayoutRenderer } from './LayoutRenderer';

try {
  const sectionsContext = require.context('../../sections', true, /register\.(t|j)sx?$/);
  sectionsContext.keys().forEach((key: string) => sectionsContext(key));
} catch (error) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Page Builder: unable to auto-register sections', error);
  }
}

try {
  const blocksContext = require.context('../../blocks', true, /register\.(t|j)sx?$/);
  blocksContext.keys().forEach((key: string) => blocksContext(key));
} catch (error) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Page Builder: unable to auto-register blocks', error);
  }
}

try {
  const layoutsContext = require.context('../../layouts', true, /register\.(t|j)sx?$/);
  layoutsContext.keys().forEach((key: string) => layoutsContext(key));
} catch (error) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Page Builder: unable to auto-register layouts', error);
  }
}
