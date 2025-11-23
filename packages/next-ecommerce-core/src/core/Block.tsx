'use client';

import type { BlockInstance } from './types';
import { BlockErrorBoundary } from './ErrorBoundary';

export function Block<TSettings = any>({
  component,
  ...config
}: BlockInstance<TSettings>) {
  const Component = component;

  return (
    <BlockErrorBoundary blockId={config.id}>
      <Component {...config} />
    </BlockErrorBoundary>
  );
}

