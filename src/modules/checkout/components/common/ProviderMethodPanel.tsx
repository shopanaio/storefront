'use client';

import type { FC, ReactNode } from 'react';
import { CheckoutMethodPanel } from './CheckoutMethodPanel';
import { ProviderBoundary } from './ProviderBoundary';
import type { ProviderId } from '@src/modules/checkout/state/checkoutBus';

/**
 * Configuration for a payment or shipping method
 */
export interface MethodConfig {
  code: string;
  nameI18n: string;
  descriptionI18n?: string;
  Component: FC | null;
}

/**
 * Props for the ProviderMethodPanel component
 */
export interface ProviderMethodPanelProps {
  /** Method configuration */
  config: MethodConfig;
  /** Currently active method code */
  activeCode?: string;
  /** Callback when method is selected */
  onSelect: (code: string) => void;
  /** Brand logo component */
  brand: ReactNode;
  /** Translation function */
  translate: (key: string) => string;
  /** Provider identifier for ProviderBoundary */
  providerId: ProviderId;
  /** Type of provider (payment or shipping) */
  type: 'payment' | 'shipping';
}

/**
 * Reusable wrapper component for checkout method panels.
 * Encapsulates the common pattern of rendering a method with CheckoutMethodPanel
 * and ProviderBoundary.
 */
export function ProviderMethodPanel({
  config,
  activeCode,
  onSelect,
  brand,
  translate: t,
  providerId,
  type,
}: ProviderMethodPanelProps) {
  const isActive = activeCode === config.code;
  const FormComponent = config.Component ?? null;

  return (
    <ProviderBoundary providerId={providerId} type={type}>
      <CheckoutMethodPanel
        key={config.code}
        title={t(config.nameI18n)}
        description={config.descriptionI18n ? t(config.descriptionI18n) : null}
        isActive={isActive}
        onActivate={() => onSelect(config.code)}
        brand={brand}
        component={FormComponent}
      />
    </ProviderBoundary>
  );
}
