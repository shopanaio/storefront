import { ValidationCallbacks } from '@src/modules/checkout/types/utils';
import { ComponentType } from 'react';

/**
 * Supported module types for the plugin system.
 */
export enum ProviderModuleType {
  Payment = 'payment',
  Delivery = 'delivery',
}

export interface ProviderMethod {
  code: string;
  data: unknown;
}

export interface ProviderProps extends ValidationCallbacks {
  moduleType: ProviderModuleType;
  provider: string;
  methods: ProviderMethod[];
  selectedMethod: ProviderMethod | null;
}

export type ProviderComponentProps = Omit<ProviderProps, 'moduleType'>;

export interface ProviderModuleApi {
  moduleType: ProviderModuleType;
  provider?: string;
  Component: ComponentType<ProviderComponentProps>;
}
