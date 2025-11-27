import type { ComponentType } from 'react';
import { match, type MatchFunction, type ParamData } from 'path-to-regexp';

// Re-export ParamData for module authors
export type { ParamData };

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
 * Configuration for registering a module.
 */
export interface ModuleConfig<T = unknown> {
  /**
   * Module type, e.g. `page` or `widget`.
   */
  type: ModuleType;
  /**
   * Unique slug identifier.
   */
  slug: ModuleSlug;
  /**
   * URL path pattern using path-to-regexp syntax.
   * Required for 'page' modules, optional for internal modules.
   * Examples: '/checkout', '/checkout/:step', '/wishlist/:id?'
   */
  path?: string;
  /**
   * Lazy loader that returns the module payload.
   */
  loader: AsyncModuleLoader<T>;
}

/**
 * Record held inside the registry for each module.
 */
export interface RegisteredModuleRecord<T = unknown> extends ModuleConfig<T> {
  matcher: MatchFunction<ParamData> | null;
}

/**
 * Result of a successful module match.
 */
export interface ModuleMatchResult<T = unknown> {
  record: RegisteredModuleRecord<T>;
  params: ParamData;
}

/**
 * Props contract for module page components resolved by `[...module]`.
 */
export interface DynamicModulePageProps {
  params: { locale: string; module?: string[] };
  searchParams?: Record<string, string | string[] | undefined>;
  /** @deprecated Use pathParams instead */
  segments?: string[];
  /** Extracted path parameters from the URL pattern (e.g., { step: 'shipping' } for /checkout/:step) */
  pathParams: ParamData;
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
 * - Uses path-to-regexp for flexible URL pattern matching.
 */
export class ModuleRegistry {
  private readonly typeToSlugToRecord: Map<
    ModuleType,
    Map<ModuleSlug, RegisteredModuleRecord>
  > = new Map();

  /**
   * Registers a module. Overwrites existing pair by design.
   *
   * @param config Module configuration object.
   */
  register<T = unknown>(config: ModuleConfig<T>): void {
    const { type, slug, path, loader } = config;
    let bySlug = this.typeToSlugToRecord.get(type);
    if (!bySlug) {
      bySlug = new Map();
      this.typeToSlugToRecord.set(type, bySlug);
    }
    const matcher = path ? match(path, { decode: decodeURIComponent }) : null;
    const record: RegisteredModuleRecord<T> = { type, slug, path, loader, matcher };
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
   * Matches a URL path against registered modules of a given type.
   *
   * @param type Module type to match against.
   * @param pathname URL pathname to match (e.g. '/checkout/shipping').
   * @returns Match result with the record and extracted params, or undefined if no match.
   */
  matchPath<T = unknown>(
    type: ModuleType,
    pathname: string
  ): ModuleMatchResult<T> | undefined {
    const bySlug = this.typeToSlugToRecord.get(type);
    if (!bySlug) return undefined;

    const records = Array.from(bySlug.values());
    for (const record of records) {
      if (!record.matcher) continue;
      const result = record.matcher(pathname);
      if (result) {
        return {
          record: record as RegisteredModuleRecord<T>,
          params: result.params,
        };
      }
    }

    return undefined;
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
 * @param config Module configuration object.
 */
export function registerModule<T = unknown>(config: ModuleConfig<T>): void {
  moduleRegistry.register(config);
}

/**
 * Widget configuration (convenience type for widget modules).
 */
export interface WidgetConfig {
  slug: ModuleSlug;
  path?: string;
  loader: AsyncModuleLoader<WidgetSourceLoader>;
}

/**
 * Registers a widget under the `widget` module type.
 *
 * The loader should return a `WidgetSourceLoader` which in turn produces the JS string.
 *
 * @param config Widget configuration object.
 */
export function registerWidget(config: WidgetConfig): void {
  moduleRegistry.register({
    type: 'widget',
    slug: config.slug,
    path: config.path,
    loader: config.loader,
  });
}
