'use client';

import { createPageBuilderStore } from './store';
import type { PageTemplate } from './types';

const fallbackTemplate: PageTemplate = {
  id: '__page_builder_fallback__',
  name: 'Page Builder Fallback',
  pageType: 'page',
  sections: [],
  data: undefined,
  metadata: {},
};

export const fallbackPageBuilderStore = createPageBuilderStore(fallbackTemplate);
