import type { ComponentType, ReactNode } from 'react';
import type { PageTemplate } from '@shopana/storefront-sdk/core/types';
import type {
  DynamicModulePageProps,
  ModuleExport,
  RegisteredModuleRecord,
} from '@shopana/storefront-sdk/registry';
import { track, type TrackedPromise } from '../core/page-client';
import { getComponentFromModule } from '../core/module-page';
import type { RuntimePageModuleMap } from '../core/page-definition';
import { loadNotFoundDefinition } from '../core/page-registry';
import type { RuntimePageType } from '../core/route';

export type PageLayoutComponent = ComponentType<{ children: ReactNode }>;

/** The layout of a page type: the theme layout, or none (null). */
export type LoadRuntimeLayout = (
  pageType: RuntimePageType,
  context: { isModule: boolean; moduleSlug?: string }
) => Promise<PageLayoutComponent | null>;

/** What the generated page route passes to its loader and its component. */
export interface RuntimePageRouteDefinition {
  pages: RuntimePageModuleMap;
  loadLayout: LoadRuntimeLayout;
}

/**
 * The tracked load of `key` in `loads`, started on first ask; a failed one is dropped to retry.
 * Tracked so that a render after the load (the server render after its loader, a client render
 * after `clientLoader`) reads it without suspending.
 */
function cachedLoad<T>(
  loads: Map<string, TrackedPromise<T>>,
  key: string,
  load: () => Promise<T>
): TrackedPromise<T> {
  let promise = loads.get(key);
  if (!promise) {
    promise = track(load());
    promise.catch(() => loads.delete(key));
    loads.set(key, promise);
  }
  return promise;
}

const layoutLoads = new WeakMap<
  LoadRuntimeLayout,
  Map<string, TrackedPromise<PageLayoutComponent | null>>
>();

export function loadRouteLayout(
  route: RuntimePageRouteDefinition,
  pageType: RuntimePageType,
  context: { isModule: boolean; moduleSlug?: string }
): TrackedPromise<PageLayoutComponent | null> {
  let loads = layoutLoads.get(route.loadLayout);
  if (!loads) {
    loads = new Map();
    layoutLoads.set(route.loadLayout, loads);
  }
  return cachedLoad(
    loads,
    JSON.stringify([pageType, context.isModule, context.moduleSlug ?? null]),
    () => route.loadLayout(pageType, context)
  );
}

export interface ModulePageModules {
  /** What the module's loader returned: the page component and its `generateMetadata`. */
  payload: unknown;
  Component: ComponentType<DynamicModulePageProps>;
  /** The module's own layout; null when it renders in the storefront layout. */
  Layout: PageLayoutComponent | null;
}

const moduleLoads = new Map<string, TrackedPromise<ModulePageModules>>();
const moduleLayoutLoads = new Map<
  string,
  TrackedPromise<PageLayoutComponent | null>
>();

/** The page component and own layout of a page module. */
export function loadModulePage(
  record: RegisteredModuleRecord
): TrackedPromise<ModulePageModules> {
  return cachedLoad(moduleLoads, record.slug, async () => {
    const [payload, layout] = await Promise.all([
      record.loader(),
      record.layoutLoader?.(),
    ]);
    return {
      payload,
      Component: getComponentFromModule(
        payload as ModuleExport<DynamicModulePageProps>
      ),
      Layout: layout?.default ?? null,
    };
  });
}

/** The layout a module page renders in: its own, or the one the route gives modules. */
export function loadModuleLayout(
  route: RuntimePageRouteDefinition,
  record: RegisteredModuleRecord
): TrackedPromise<PageLayoutComponent | null> {
  if (record.layoutLoader) {
    return cachedLoad(moduleLayoutLoads, record.slug, async () => {
      const modules = await loadModulePage(record);
      return modules.Layout;
    });
  }
  return loadRouteLayout(route, 'module', {
    isModule: true,
    moduleSlug: record.slug,
  });
}

export interface NotFoundModules {
  definition: Awaited<ReturnType<typeof loadNotFoundDefinition>>;
  template: PageTemplate<unknown>;
}

const notFoundLoads = new WeakMap<
  RuntimePageModuleMap,
  Map<string, TrackedPromise<NotFoundModules>>
>();

export function loadNotFoundModules(
  pages: RuntimePageModuleMap
): TrackedPromise<NotFoundModules> {
  let loads = notFoundLoads.get(pages);
  if (!loads) {
    loads = new Map();
    notFoundLoads.set(pages, loads);
  }
  return cachedLoad(loads, '404', async () => {
    const definition = await loadNotFoundDefinition(pages);
    return { definition, template: await definition.loadTemplate() };
  });
}
