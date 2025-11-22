'use client';

// Import registry initialization to register all sections and blocks on the client
import '@src/core/page-builder/registry-init';

import { ShopProvider } from '@src/core/shop/ShopContext';
import { PageBuilder } from '@src/core/page-builder/PageBuilder';
import type { ShopConfig } from '@src/core/shop/types';
import type { PageTemplate } from '@src/core/page-builder/types';

interface TestPageContentProps {
  shopConfig: ShopConfig;
  template: PageTemplate;
}

export function TestPageContent({ shopConfig, template }: TestPageContentProps) {
  return (
    <ShopProvider config={shopConfig}>
      <PageBuilder template={template} />
    </ShopProvider>
  );
}
