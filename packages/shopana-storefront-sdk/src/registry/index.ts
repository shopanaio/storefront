import type { ComponentType } from 'react';

/**
 * Unique identifier used to resolve modules or widgets within the registry.
 */
export type ModuleSlug = string;

/**
 * Supported module types for the plugin system.
 */
export type ModuleType = 'page' | string;

/**
 * A loader that returns a module payload. Kept generic for various module types.
 *
 * Used to lazily import modules and widgets to minimize initial bundles.
 */
export type AsyncModuleLoader<T = unknown> = () => Promise<T> | T;

/**
 * Record held inside the registry for each module.
 */
export interface RegisteredModuleRecord<T = unknown> {
  type: ModuleType;
  slug: ModuleSlug;
  loader: AsyncModuleLoader<T>;
}

/**
 * Props contract for module page components resolved by `[...module]`.
 */
export interface DynamicModulePageProps {
  params: { locale: string; module?: string[] };
  searchParams?: Record<string, string | string[] | undefined>;
  segments?: string[];
}

/**
 * Common shape of a module export: either a default component or a component itself.
 */
export type ModuleExport<TProps> =
  | { default: ComponentType<TProps> }
  | ComponentType<TProps>;

/**
 * Context provided to widget source loaders when generating JavaScript output.
 *
 * - `origin` is the absolute origin of the current request (scheme + host + port).
 * - `widget` is the resolved widget slug.
 * - `searchParams` is the query string parameters for dynamic behavior.
 */
export interface WidgetSourceLoaderContext {
  origin: string;
  widget: ModuleSlug;
  searchParams: URLSearchParams;
}

/**
 * Function that produces JavaScript source for a widget given a request context.
 *
 * The returned string should be a valid self-contained JavaScript program.
 */
export type WidgetSourceLoader = (
  ctx: WidgetSourceLoaderContext
) => Promise<string> | string;

/**
 * Enterprise-ready minimal Module Registry for dynamic module resolution with module types.
 * - Allows feature modules to self-register with a type and slug.
 * - Supports lazy dynamic imports to keep bundles small.
 * - Safe server/runtime usage (no globals on window; SSR friendly).
 * - Backward compatible: legacy `register(slug, loader)` and `resolve(slug)` operate on `page` type.
 */
export class ModuleRegistry {
  private readonly typeToSlugToRecord: Map<
    ModuleType,
    Map<ModuleSlug, RegisteredModuleRecord>
  > = new Map();

  /**
   * Registers a module by type and slug. Overwrites existing pair by design.
   *
   * @param type Module type, e.g. `page` or `widget`.
   * @param slug Unique slug.
   * @param loader Lazy loader that returns the module payload.
   */
  register<T = unknown>(
    type: ModuleType,
    slug: ModuleSlug,
    loader: AsyncModuleLoader<T>
  ): void {
    let bySlug = this.typeToSlugToRecord.get(type);
    if (!bySlug) {
      bySlug = new Map();
      this.typeToSlugToRecord.set(type, bySlug);
    }
    const record: RegisteredModuleRecord = { type, slug, loader };
    bySlug.set(slug, record);
  }

  /**
   * Resolves a module loader by type and slug.
   *
   * @param type Module type, e.g. `page` or `widget`.
   * @param slug Registered slug.
   * @returns Loader function if found, otherwise `undefined`.
   */
  resolve<T = unknown>(
    type: ModuleType,
    slug: ModuleSlug
  ): AsyncModuleLoader<T> | undefined {
    const bySlug = this.typeToSlugToRecord.get(type);
    const record = bySlug?.get(slug);
    return record?.loader as AsyncModuleLoader<T> | undefined;
  }

  /**
   * Lists registered slugs for a specific type.
   *
   * @param type Module type.
   * @returns Array of slugs for the given type.
   */
  list(type: ModuleType): ModuleSlug[] {
    const bySlug = this.typeToSlugToRecord.get(type);
    return bySlug ? Array.from(bySlug.keys()) : [];
  }
}

/**
 * Global singleton registry instance for feature modules and widgets.
 */
export const moduleRegistry = new ModuleRegistry();

/**
 * Helper to standardize registration from modules.
 *
 * @param type Module type to register.
 * @param slug Unique slug.
 * @param loader Lazy loader returning the module payload.
 */
export function registerModule<T = unknown>(
  type: ModuleType,
  slug: ModuleSlug,
  loader: AsyncModuleLoader<T>
): void {
  moduleRegistry.register(type, slug, loader);
}

/**
 * Registers a widget under the `widget` module type.
 *
 * The loader should return a `WidgetSourceLoader` which in turn produces the JS string.
 *
 * @param slug Widget slug.
 * @param loader Lazy loader producing the widget source generator.
 */
export function registerWidget(
  slug: ModuleSlug,
  loader: AsyncModuleLoader<WidgetSourceLoader>
): void {
  moduleRegistry.register('widget', slug, loader);
}
