import type { FC } from 'react';
import { BTLogo as LogoComponent } from './Logo';

/**
 * Configuration types and values for Bank Transfer provider.
 */
export interface ProviderOptionConfig {
  /** Unique code identifier used internally */
  code: string;
  /** i18n translation key for name */
  nameI18n: string;
  /** i18n translation key for description */
  descriptionI18n?: string;
  /** Optional React form component to render inside method panel */
  Component: FC | null;
}

export interface BankTransferProviderConfig {
  /** Brand/logo component for the provider */
  logo: FC<{ size?: number }>;
  /** List of payment methods supported by this provider */
  payment: ProviderOptionConfig[];
}

export const BANK_TRANSFER_CONFIG: BankTransferProviderConfig = {
  logo: LogoComponent,
  payment: [
    {
      code: 'bank_transfer',
      nameI18n: 'payment.name',
      descriptionI18n: 'payment.description',
      Component: null,
    },
  ],
};
