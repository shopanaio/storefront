import type { ComponentType, ReactNode } from 'react';
import type { NormalizedCacheObject, OperationVariables } from '@apollo/client';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { SerializableApolloQuery } from '../graphql/apollo/loadSerializableQuery';
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
  /** Page layout owned by the module instead of the storefront layout. */
  layoutLoader?: AsyncModuleLoader<{
    default: ComponentType<{ children: ReactNode }>;
  }>;
  /**
   * Who may open the pages of a `page` module; open to everyone when omitted. A closed page
   * without a session sends the visitor to the home page (see `ModuleAccess`).
   */
  access?: ModuleAccess;
}

/**
 * Access of a page module. `session: 'required'` closes every page of the module to visitors
 * without a session, except the `publicPaths` (path-to-regexp patterns matched against the
 * same locale-free pathname as `path`), e.g. the pages links from emails open.
 */
export interface ModuleAccess {
  session: 'required';
  publicPaths?: string[];
}

/**
 * Record held inside the registry for each module.
 */
export interface RegisteredModuleRecord<T = unknown> extends ModuleConfig<T> {
  matcher: MatchFunction<ParamData> | null;
  publicMatchers: MatchFunction<ParamData>[];
}

/**
 * Result of a successful module match.
 */
export interface ModuleMatchResult<T = unknown> {
  record: RegisteredModuleRecord<T>;
  params: ParamData;
  /** The matched page is closed to visitors without a session. */
  requiresSession: boolean;
}

/** Pathname of the home page, where a closed page sends a visitor without a session. */
const HOME_PATHNAME = '/';

/**
 * Props contract for module page components resolved by `[...module]`.
 */
/** Request-scoped data services of a module page; the same ones reserved pages receive. */
export interface ModulePageServices {
  loadQuery<TData, TVariables extends OperationVariables>(
    document: TypedDocumentNode<TData, TVariables>,
    variables: TVariables
  ): Promise<SerializableApolloQuery<TData, TVariables>>;
  extractCacheState(): Promise<NormalizedCacheObject>;
}

export interface DynamicModulePageProps {
  /** `locale` is the URL locale segment of the request. */
  params: { locale: string; module?: string[] };
  searchParams?: Record<string, string | string[] | undefined>;
  /** Extracted path parameters from the URL pattern (e.g., { step: 'shipping' } for /checkout/:step) */
  pathParams: ParamData;
  services: ModulePageServices;
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
    const { type, slug, path, loader, layoutLoader, access } = config;
    const matcher = path ? match(path, { decode: decodeURIComponent }) : null;
    const publicMatchers = (access?.publicPaths ?? []).map((publicPath) =>
      match(publicPath, { decode: decodeURIComponent })
    );
    // The home page is where a closed page sends a visitor without a session; a module that
    // closed it would send the visitor back to itself.
    if (
      access?.session === 'required' &&
      matcher?.(HOME_PATHNAME) &&
      !publicMatchers.some((publicMatcher) => publicMatcher(HOME_PATHNAME))
    ) {
      throw new Error(
        `Module "${type}/${slug}" cannot require a session for the home page "${HOME_PATHNAME}"`
      );
    }
    let bySlug = this.typeToSlugToRecord.get(type);
    if (!bySlug) {
      bySlug = new Map();
      this.typeToSlugToRecord.set(type, bySlug);
    }
    const record: RegisteredModuleRecord<T> = {
      type,
      slug,
      path,
      loader,
      layoutLoader,
      access,
      matcher,
      publicMatchers,
    };
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
          requiresSession:
            record.access?.session === 'required' &&
            !record.publicMatchers.some((publicMatcher) =>
              publicMatcher(pathname)
            ),
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
