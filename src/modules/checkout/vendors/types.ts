import { ComponentType, FC } from 'react';
import type { AnySchema } from 'yup';

/**
 * Supported module types for the plugin system.
 */
export enum ProviderModuleType {
  Payment = 'payment',
  Delivery = 'delivery',
}

/**
 * Configuration for a single provider method (shipping or payment).
 */
export interface ProviderMethodConfig {
  /** Unique code identifier used internally */
  code: string;
  /** Optional yup schema for this method's data validation */
  schema?: AnySchema;
  /** Full method component that includes CheckoutMethodPanel */
  Component: FC<{
    isActive: boolean;
    onActive: () => void;
    data?: unknown;
    onSubmit?: (data: unknown) => void;
    /** Delivery address for delivery methods (only for delivery providers) */
    deliveryAddress?: unknown;
  }>;
  /** Initial values for this method (if any) */
  initialValues?: unknown;
}

/**
 * Base configuration interface for all provider configs.
 * Each provider can support shipping and/or payment methods.
 */
export interface ProviderConfig {
  /** Brand/logo component for the provider */
  logo: FC<{ size?: number }>;
  /** List of methods supported by this provider */
  methods: ProviderMethodConfig[];
}

export interface ProviderMethod {
  code: string;
  data: unknown;
  provider: string;
}

export interface ProviderProps {
  moduleType: ProviderModuleType;
  provider: string;
  availableMethods: ProviderMethod[];
  selectedMethod: ProviderMethod | null;
  /** Callback for when a method is selected (optional for backward compatibility) */
  onSelectMethod?: (method: ProviderMethod) => void;
  /** Callback for when selected method data is updated (optional, mainly for delivery) */
  onUpdateMethodData?: (data: unknown) => void;
  /** Delivery address for delivery providers (only for delivery module type) */
  deliveryAddress?: unknown;
}

export type ProviderComponentProps = Omit<ProviderProps, 'moduleType'> & {
  config: ProviderConfig;
};

export interface ProviderMethodComponentProps {
  data: unknown;
  onSubmit: (data: unknown) => void;
  isActive: boolean;
  onActive: () => void;
  /** Delivery address for delivery methods (only for delivery providers) */
  deliveryAddress?: unknown;
}

export interface ProviderModuleApi {
  provider: string;
  moduleType: ProviderModuleType;
  config: ProviderConfig;
  Component: ComponentType<ProviderComponentProps>;
}
