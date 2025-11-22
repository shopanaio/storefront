'use client';

import { useMemo } from 'react';
import { BlockContextProvider } from './context';
import { pageBuilderRegistry } from './registry';
import { usePageBuilderState } from './hooks';

export interface BlockRendererProps {
  blockId: string;
}

export function BlockRenderer({ blockId }: BlockRendererProps) {
  const block = usePageBuilderState((state) => state.blocks[blockId]);

  // Load component synchronously from registry
  const Component = useMemo(() => {
    if (!block) return null;

    // Try to get from cache first
    let component = pageBuilderRegistry.getBlockComponent(block.type);

    // If not in cache, load synchronously
    if (!component) {
      const record = pageBuilderRegistry.getBlock(block.type);
      if (record) {
        const result = record.loader();
        // For synchronous loaders, result is the module directly
        const module = result instanceof Promise ? null : result;
        if (module) {
          component = module.default ?? null;
          // Save to cache
          if (component) {
            pageBuilderRegistry.setBlockComponent(block.type, component);
          }
        }
      }
    }

    return component;
  }, [block?.type]);

  if (!block) {
    console.error(`Block with id "${blockId}" not found in store`);
    return null;
  }

  if (!Component) {
    console.error(`Block type "${block.type}" not found or not loaded`);
    return null;
  }

  return (
    <BlockContextProvider blockId={block.id}>
      <Component id={block.id} settings={block.settings} />
    </BlockContextProvider>
  );
}
