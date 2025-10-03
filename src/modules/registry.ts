import type { ComponentType } from "react";

export type ModuleSlug = string;

/**
 * Supported module types for the plugin system.
 */
export enum ModuleType {
  Page = "page",
  Shipping = "shipping",
  Payment = "payment",
}

/**
 * A loader that returns a module payload. Kept generic for various module types.
 */
export type AsyncModuleLoader<T = unknown> = () => Promise<T> | T;

/**
 * Optional metadata associated with a registered module.
 */
/**
 * Record held inside the registry for each module.
 */
export interface RegisteredModuleRecord<T = unknown> {
  type: ModuleType;
  slug: ModuleSlug;
  loader: AsyncModuleLoader<T>;
}

/**
 * Contract for shipping method modules. These can expose calculators, UIs or adapters.
 */
export interface ShippingModuleApi {
  /** Unique method code, e.g. "nova-poshta" */
  methodCode: string;
  /** Human readable label for UI */
  label: string;
  /** Optional server action to quote price */
  quote?: (payload: unknown) => Promise<unknown> | unknown;
  /** Optional React component for configuration or selection */
  Component?: ComponentType<unknown>;
}

/**
 * Contract for payment method modules.
 */
export interface PaymentModuleApi {
  /** Unique method code, e.g. "liqpay" */
  methodCode: string;
  /** Human readable label for UI */
  label: string;
  /** Initialize payment and return a client payload */
  initialize?: (payload: unknown) => Promise<unknown> | unknown;
  /** Optional React component for payment UI */
  Component?: ComponentType<unknown>;
}

/**
 * Provider-level contracts: one module per provider rendering full UI and managing its inner methods.
 */
export interface ProviderMethod {
  code: string;
  label?: string;
  price?: { amount: string; currencyCode: string };
}

export interface ProviderProps {
  provider: string;
  methods: ProviderMethod[];
  locale: string;
  /**
   * Optional delivery group id. Present for shipping providers.
   */
  groupId?: string;
}

export interface ShippingProviderModuleApi {
  provider: string;
  label?: string;
  icon?: string;
  Component: ComponentType<ProviderProps>;
  quoteByCode?: (
    code: string,
    payload: unknown
  ) => Promise<{ amount: string; currencyCode: string }> | { amount: string; currencyCode: string };
}

export interface PaymentProviderModuleApi {
  provider: string;
  label?: string;
  icon?: string;
  Component: ComponentType<ProviderProps>;
  initialize?: (code: string, payload: unknown) => Promise<unknown> | unknown;
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
export type ModuleExport<TProps> = { default: ComponentType<TProps> } | ComponentType<TProps>;

/**
 * Enterprise-ready minimal Module Registry for dynamic module resolution with module types.
 * - Allows feature modules to self-register with a type and slug.
 * - Supports lazy dynamic imports to keep bundles small.
 * - Safe server/runtime usage (no globals on window; SSR friendly).
 * - Backward compatible: legacy `register(slug, loader)` and `resolve(slug)` operate on `page` type.
 */
class ModuleRegistry {
  private readonly typeToSlugToRecord: Map<ModuleType, Map<ModuleSlug, RegisteredModuleRecord>> = new Map();

  /**
   * Registers a module by type and slug. Overwrites existing pair by design.
   */
  register<T = unknown>(type: ModuleType, slug: ModuleSlug, loader: AsyncModuleLoader<T>): void {
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
   */
  resolve<T = unknown>(type: ModuleType, slug: ModuleSlug): AsyncModuleLoader<T> | undefined {
    const bySlug = this.typeToSlugToRecord.get(type);
    const record = bySlug?.get(slug);
    return record?.loader as AsyncModuleLoader<T> | undefined;
  }

  /**
   * Lists registered slugs for a specific type.
   */
  list(type: ModuleType): ModuleSlug[] {
    const bySlug = this.typeToSlugToRecord.get(type);
    return bySlug ? Array.from(bySlug.keys()) : [];
  }
}

export const moduleRegistry = new ModuleRegistry();

/**
 * Helper to standardize registration from modules.
 * Overloads keep backward compatibility for existing page modules.
 */
export function registerModule<T = unknown>(type: ModuleType, slug: ModuleSlug, loader: AsyncModuleLoader<T>): void {
  moduleRegistry.register(type, slug, loader);
}
