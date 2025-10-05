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
 * Provider method with controller API
 */
export interface ProviderMethod {
  code: string;
  label?: string;
  price?: { amount: string; currencyCode: string };
  /** Initial values for this method (if any) */
  initialValues?: unknown;
}

/**
 * Standard validation callbacks interface for all checkout forms.
 * Follows explicit validation state pattern used in enterprise systems.
 *
 * @example
 * ```tsx
 * function MyForm({ onValid, onInvalid }: ValidationCallbacks) {
 *   useEffect(() => {
 *     if (isFormValid) {
 *       onValid(formData);
 *     } else {
 *       onInvalid({ field: 'error message' });
 *     }
 *   }, [formData]);
 * }
 * ```
 */
export interface ValidationCallbacks {
  /**
   * Called when form data passes validation.
   * Must be called explicitly to mark section as valid.
   * @param data - Validated form data (DTO)
   */
  onValid: (data: unknown) => void;

  /**
   * Called when form data fails validation.
   * Must be called explicitly to mark section as invalid.
   * @param errors - Optional map of field-level errors for debugging
   */
  onInvalid: (errors?: Record<string, string>) => void;
}

export interface ProviderProps extends ValidationCallbacks {
  provider: string;
  methods: ProviderMethod[];
  locale: string;
  /**
   * Optional delivery group id. Present for shipping providers.
   */
  groupId?: string;
}

/**
 * API for shipping provider modules
 */
export interface ShippingProviderModuleApi {
  provider?: string;
  Component: ComponentType<{
    provider: string;
    methods: Array<{ code: string; label?: string; initialValues?: unknown }>;
    groupId: string;
    locale: string;
  } & ValidationCallbacks>;
  label?: string;
  icon?: string;
  quoteByCode?: (
    code: string,
    groupId: string,
    locale: string
  ) => Promise<{ price: { amount: string; currencyCode: string } } | null>;
}

/**
 * API for payment provider modules
 */
export interface PaymentProviderModuleApi {
  provider?: string;
  Component: ComponentType<{
    provider: string;
    methods: Array<{ code: string; label?: string; initialValues?: unknown }>;
    locale: string;
  } & ValidationCallbacks>;
  label?: string;
  icon?: string;
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
