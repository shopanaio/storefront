'use client';

import type { FC, ReactNode } from 'react';
import { CheckoutMethodPanel } from './CheckoutMethodPanel';
import { ActiveProviderBoundary } from './ActiveProviderBoundary';
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
  /** Provider identifier for ActiveProviderBoundary */
  providerId: ProviderId;
  /** Type of provider (payment or shipping) */
  type: 'payment' | 'shipping';
}

/**
 * Reusable wrapper component for checkout method panels.
 * Encapsulates the common pattern of rendering a method with CheckoutMethodPanel
 * and ActiveProviderBoundary.
 */
export function ProviderMethodPanel({
  config,
  activeCode,
  onSelect,
  brand,
  translate,
  providerId,
  type,
}: ProviderMethodPanelProps) {
  const isActive = activeCode === config.code;
  const FormComponent = config.Component;

  const isHeadless = typeof FormComponent !== 'function';

  return (
    <CheckoutMethodPanel
      key={config.code}
      title={translate(config.nameI18n)}
      description={
        config.descriptionI18n ? translate(config.descriptionI18n) : ''
      }
      isActive={isActive}
      onActivate={() => onSelect(config.code)}
      brand={brand}
      content={
        isActive ? (
          <ActiveProviderBoundary
            providerId={providerId}
            type={type}
            autoPublish={isHeadless}
          >
            {!isHeadless && <FormComponent />}
          </ActiveProviderBoundary>
        ) : null
      }
    />
  );
}
