import type { PageType, TemplateRegistration } from './types';

export type TemplateRegistry = Partial<
  Record<PageType, TemplateRegistration<any>>
>;

const registry: TemplateRegistry = {};

export function registerTemplate<TData = any>(
  pageType: PageType,
  registration: TemplateRegistration<TData>,
): void {
  registry[pageType] = registration;
}

export function getTemplateRegistration(
  pageType: PageType,
): TemplateRegistration<any> | undefined {
  return registry[pageType];
}

export function getRegisteredPageTypes(): PageType[] {
  return Object.keys(registry) as PageType[];
}

export function clearTemplateRegistry(): void {
  Object.keys(registry).forEach((key) => {
    delete registry[key as PageType];
  });
}

