import { ComponentType, FC } from 'react';
import type { AnySchema } from 'yup';
import type { PlacementCustomerAction } from '#checkout/state/placement/types';

/**
 * Supported module types for the plugin system.
 */
export enum ProviderModuleType {
  Payment = 'payment',
  Delivery = 'delivery',
  /** Client SDK that completes a `CLIENT_SDK` customer action; the slug is the action `sdk`. */
  PaymentSdk = 'payment-sdk',
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
  Component: FC<ProviderMethodComponentProps>;
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
  handle: string;
  code: string;
  data: unknown;
  publicData?: unknown;
  title?: string;
  description?: string | null;
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

/**
 * Props of a client SDK component. It takes over the `CLIENT_SDK` customer action and reports
 * back; the checkout then reads the placement until the server settles the payment.
 */
export interface PaymentSdkComponentProps {
  action: PlacementCustomerAction;
  /** The SDK finished its part (the payment may still be pending on the server). */
  onComplete: () => void;
  /** The buyer closed the SDK or it failed; the checkout reads the placement to find out why. */
  onCancel: () => void;
}

/** Module registered under `ProviderModuleType.PaymentSdk`. No implementation ships yet (1.10). */
export interface PaymentSdkModuleApi {
  sdk: string;
  Component: ComponentType<PaymentSdkComponentProps>;
}
