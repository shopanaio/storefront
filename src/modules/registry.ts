import type { ComponentType } from "react";

export type ModuleSlug = string;

export type AsyncModuleLoader<T = unknown> = () => Promise<T> | T;

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
export type ModuleExport<TProps> = { default: ComponentType<TProps> } | ComponentType<TProps>;

/**
 * Enterprise-ready minimal Module Registry for dynamic module resolution.
 * - Allows feature modules to self-register by calling `moduleRegistry.register(slug, loader)`.
 * - Supports lazy dynamic imports to keep bundles small.
 * - Safe server/runtime usage (no globals on window; SSR friendly).
 */
class ModuleRegistry {
  private readonly slugToLoader: Map<ModuleSlug, AsyncModuleLoader> = new Map();

  /**
   * Registers a module loader by slug. Overwrites existing slug by design.
   */
  register(slug: ModuleSlug, loader: AsyncModuleLoader): void {
    this.slugToLoader.set(slug, loader);
  }

  /**
   * Returns loader by slug if present; otherwise undefined.
   */
  resolve(slug: ModuleSlug): AsyncModuleLoader | undefined {
    return this.slugToLoader.get(slug);
  }

  /**
   * Lists registered slugs. Useful for diagnostics and tests.
   */
  list(): ModuleSlug[] {
    return Array.from(this.slugToLoader.keys());
  }
}

export const moduleRegistry = new ModuleRegistry();

/**
 * Helper to standardize registration from modules.
 */
export function registerModule(slug: ModuleSlug, loader: AsyncModuleLoader): void {
  moduleRegistry.register(slug, loader);
}
