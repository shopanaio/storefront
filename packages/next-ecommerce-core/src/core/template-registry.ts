import type {
  MetadataBuilder,
  PageDataLoader,
  PageTemplate,
  TemplateRegistration,
  PageType,
} from './types';

const registry = new Map<PageType, TemplateRegistration<any>>();

export function registerTemplate<TData>(pageType: PageType, config: TemplateRegistration<TData>) {
  registry.set(pageType, config);
}

export function getTemplateRegistration(pageType: PageType) {
  return registry.get(pageType);
}

export function clearTemplates() {
  registry.clear();
}

export type TemplateRegistry = typeof registry;

export type TemplateConfig<TData> = {
  template: PageTemplate<TData>;
  loadData: PageDataLoader<TData>;
  buildMetadata?: MetadataBuilder<TData>;
};

export function registerTemplates(map: Partial<Record<PageType, TemplateConfig<any>>>) {
  Object.entries(map).forEach(([pageType, value]) => {
    if (!value) return;
    registerTemplate(pageType as PageType, value);
  });
}
