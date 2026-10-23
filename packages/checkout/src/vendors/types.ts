import { ComponentType, FC } from 'react';
import type { PlacementCustomerAction } from '#checkout/state/placement/types';
import type { DeliveryCountry } from '#checkout/sections/address/countries';

/**
 * Supported module types for the plugin system.
 */
export enum ProviderModuleType {
  Payment = 'payment',
  Delivery = 'delivery',
  /** Client SDK that completes a `CLIENT_SDK` customer action; the slug is the action `sdk`. */
  PaymentSdk = 'payment-sdk',
  /** Delivery address form of a country; the slug is the ISO 3166-1 alpha-2 country code. */
  Address = 'address',
}

/**
 * Configuration for a single provider method (shipping or payment).
 */
export interface ProviderMethodConfig {
  /** Method code as the API returns it (a delivery service code or a payment method code). */
  code: string;
  /** Full method component that includes CheckoutMethodPanel */
  Component: FC<ProviderMethodComponentProps>;
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
  /** Customer input of the method, exactly as it is sent to the API. */
  data: unknown;
  /** Module-owned display state kept next to the input (labels of the picked refs). */
  view?: unknown;
  /** JSON Schema of the customer input (delivery options only). */
  customerInputContract?: unknown;
  publicData?: unknown;
  title?: string;
  description?: string | null;
  provider: string;
  /** Free shipping pays the carrier charge of the selected delivery option. */
  carrierChargeWaived?: boolean;
}

export interface ProviderProps {
  moduleType: ProviderModuleType;
  provider: string;
  availableMethods: ProviderMethod[];
  selectedMethod: ProviderMethod | null;
  /** Callback for when a method is selected (optional for backward compatibility) */
  onSelectMethod?: (method: ProviderMethod) => void;
  /**
   * Called with a new customer input of the method `handle` and its display state, on every
   * change. The input belongs to that method even if another one is selected meanwhile.
   */
  onUpdateMethodData?: (handle: string, data: unknown, view?: unknown) => void;
  /** Delivery address for delivery providers (only for delivery module type) */
  deliveryAddress?: ProviderDeliveryAddress | null;
}

/**
 * Delivery address as a delivery module sees it: neutral fields plus carrier-scoped `data`.
 */
export interface ProviderDeliveryAddress {
  addressId: string | null;
  countryCode: string | null;
  city: string | null;
  address1: string | null;
  address2: string | null;
  postalCode: string | null;
  /** ISO 3166-2 subdivision code without the country prefix. */
  provinceCode: string | null;
  /** Carrier hints of the address; each carrier reads only its own. */
  data: unknown;
}

export type ProviderComponentProps = Omit<ProviderProps, 'moduleType'> & {
  config: ProviderConfig;
};

export interface ProviderMethodComponentProps {
  /** Customer input last submitted for the method. */
  data: unknown;
  /** Display state submitted with that input. */
  view?: unknown;
  /** JSON Schema of the customer input (delivery options only). */
  customerInputContract?: unknown;
  /** Submits a new customer input with the display state needed to show it again. */
  onSubmit: (data: unknown, view?: unknown) => void;
  isActive: boolean;
  onActive: () => void;
  /** Delivery address for delivery methods (only for delivery providers) */
  deliveryAddress?: ProviderDeliveryAddress | null;
  /** Title of the option from the API. */
  title?: string;
  description?: string | null;
  /** Read-only metadata of the option from the provider. */
  publicData?: unknown;
  /**
   * Free shipping pays the carrier charge of the option: the recipient pays nothing on
   * delivery, so a carrier price note does not apply.
   */
  carrierChargeWaived?: boolean;
}

/**
 * Messages a module renders with (`ScopedIntlProvider`), declared so the checkout can load them
 * together with the module, ahead of rendering.
 */
export interface ModuleMessages {
  /** Scope under `Modules`. */
  scope: string;
  load: (locale: string) => Promise<Record<string, unknown>>;
}

export interface ProviderModuleApi {
  provider: string;
  moduleType: ProviderModuleType;
  config: ProviderConfig;
  Component: ComponentType<ProviderComponentProps>;
  messages?: ModuleMessages;
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

/**
 * Address as an address module submits it. Only neutral fields: carrier data (branch,
 * postomat, street of a carrier) belongs to the delivery method's customer input.
 */
export interface AddressModuleValue {
  countryCode: string;
  city: string;
  address1?: string | null;
  address2?: string | null;
  postalCode?: string | null;
  /** ISO 3166-2 subdivision code without the country prefix, as the address format lists it. */
  provinceCode?: string | null;
  /** Carrier hints, e.g. the Nova Poshta settlement of the picked city. */
  data?: Record<string, unknown>;
}

export interface AddressModuleProps {
  /** Saved address; `null` until one is saved or when it belongs to another country. */
  address: ProviderDeliveryAddress | null;
  /** Country of the form with its address format (B6). */
  country: DeliveryCountry;
  onSubmit: (address: AddressModuleValue) => void;
}

/** Module registered under `ProviderModuleType.Address` with the country code as slug. */
export interface AddressModuleApi {
  country: string;
  Component: ComponentType<AddressModuleProps>;
  messages?: ModuleMessages;
}
