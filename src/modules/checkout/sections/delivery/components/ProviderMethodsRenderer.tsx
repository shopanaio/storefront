'use client';

import { ModuleType } from '@src/modules/registry';
import { ProviderRenderer } from '@src/modules/checkout/infra/loaders/ProviderRenderer';

/**
 * Props for ProviderMethodsRenderer
 */
interface ProviderMethodsRendererProps {
  /** Provider code */
  provider: string;
  /** Group ID for delivery */
  groupId: string;
  /** Method configurations */
  methods: Array<{ code: string; label?: string; providerId: string }>;
  /** @deprecated Currently selected method code (not used) */
  selectedMethodCode?: string;
  /** Current locale */
  locale: string;
}

/**
 * Renders a provider with enhanced methods that include controller APIs.
 *
 * Creates provider controllers for each method and passes them
 * as props to the provider component.
 */
export const ProviderMethodsRenderer = ({
  provider,
  groupId,
  methods,
  locale,
}: ProviderMethodsRendererProps) => {
  return (
    <ProviderRenderer
      moduleType={ModuleType.Shipping}
      provider={provider}
      methods={methods}
      locale={locale}
      groupId={groupId}
    />
  );
};

export default ProviderMethodsRenderer;
