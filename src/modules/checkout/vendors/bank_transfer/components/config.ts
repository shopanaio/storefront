import type { FC } from 'react';
import { BTLogo as LogoComponent } from './Logo';
import { BankTransferPaymentMethod } from './methods/BankTransferPaymentMethod';

/**
 * Configuration types and values for Bank Transfer provider.
 */
export interface ProviderMethodConfig {
  /** Unique code identifier used internally */
  code: string;
  /** Full method component that includes CheckoutMethodPanel */
  Component: FC<{
    isActive: boolean;
    onActivate: () => void;
  }>;
}

export interface BankTransferProviderConfig {
  /** Brand/logo component for the provider */
  logo: FC<{ size?: number }>;
  /** List of payment methods supported by this provider */
  payment: ProviderMethodConfig[];
}

export const BANK_TRANSFER_CONFIG: BankTransferProviderConfig = {
  logo: LogoComponent,
  payment: [
    {
      code: 'bank_transfer',
      Component: BankTransferPaymentMethod,
    },
  ],
};
