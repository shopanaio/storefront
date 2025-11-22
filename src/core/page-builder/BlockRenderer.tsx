'use client';

import { use } from 'react';
import { BlockContextProvider } from './context';
import { pageBuilderRegistry } from './registry';
import { usePageBuilderState } from './hooks';

export interface BlockRendererProps {
  blockId: string;
}

export function BlockRenderer({ blockId }: BlockRendererProps) {
  const block = usePageBuilderState((state) => state.blocks[blockId]);

  if (!block) {
    console.error(`Block with id "${blockId}" not found in store`);
    return null;
  }

  const Component = use(pageBuilderRegistry.loadBlock(block.type));

  if (!Component) {
    console.error(`Block type "${block.type}" not found in registry`);
    return null;
  }

  return (
    <BlockContextProvider blockId={block.id}>
      <Component id={block.id} settings={block.settings} />
    </BlockContextProvider>
  );
}
