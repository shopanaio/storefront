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
}

export interface ProviderProps {
  moduleType: ProviderModuleType;
  provider: string;
  availableMethods: ProviderMethod[];
  selectedMethod: ProviderMethod | null;
}

export type ProviderComponentProps = Omit<ProviderProps, 'moduleType'> & {
  config: ProviderConfig;
};

export interface ProviderMethodComponentProps {
  data: unknown;
  onSubmit: (data: unknown) => void;
  isActive: boolean;
  onActive: () => void;
}

export interface ProviderModuleApi {
  provider: string;
  moduleType: ProviderModuleType;
  config: ProviderConfig;
  Component: ComponentType<ProviderComponentProps>;
}
