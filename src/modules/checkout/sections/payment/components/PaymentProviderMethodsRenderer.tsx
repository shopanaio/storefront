'use client';

import { ModuleType } from '@src/modules/registry';
import { ProviderRenderer } from '@src/modules/checkout/infra/loaders/ProviderRenderer';

/**
 * Props for PaymentProviderMethodsRenderer
 */
interface PaymentProviderMethodsRendererProps {
  /** Provider code */
  provider: string;
  /** Method configurations */
  methods: Array<{ code: string; providerId: string }>;
  /** @deprecated Currently selected method code (not used) */
  selectedMethodCode?: string;
  /** Current locale */
  locale: string;
}

/**
 * Renders a payment provider with enhanced methods that include controller APIs.
 *
 * Creates provider controllers for each method and passes them
 * as props to the provider component.
 */
export const PaymentProviderMethodsRenderer = ({
  provider,
  methods,
  locale,
}: PaymentProviderMethodsRendererProps) => {
  return (
    <ProviderRenderer
      moduleType={ModuleType.Payment}
      provider={provider}
      methods={methods}
      locale={locale}
    />
  );
};

export default PaymentProviderMethodsRenderer;
