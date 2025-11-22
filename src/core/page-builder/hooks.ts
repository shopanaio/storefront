'use client';

/**
 * Page Builder hooks module
 *
 * Provides React hooks for accessing PageBuilder state using Zustand.
 * Supports fine-grained subscriptions through selectors for optimal performance.
 *
 * @module core/page-builder/hooks
 */

import { useContext } from 'react';
import { useStore } from 'zustand';
import { pageBuilderRegistry } from './registry';
import {
  type BlockSelector,
  type BlockState,
  type PageBuilderActions,
  type PageBuilderState,
  type PageSelector,
  type SectionSelector,
  type SectionState,
} from './types';
import { BlockContext, SectionContext } from './context';
import { PageBuilderStoreContext } from './store-provider';
import { fallbackPageBuilderStore } from './store-fallback';
import type { PageBuilderStore } from './types';

/**
 * Hook for accessing the PageBuilder Zustand store
 *
 * This is a low-level hook that provides direct access to the Zustand store.
 * Most components should use the higher-level hooks (usePage, useSection, useBlock)
 * instead of accessing the store directly.
 *
 * @template TData - Type of page data
 * @returns The Zustand store instance
 * @throws Error if used outside of PageBuilderStoreProvider
 *
 * @example
 * ```tsx
 * function AdvancedComponent() {
 *   const store = usePageBuilderStore();
 *   // Use store.getState() or store.subscribe() for advanced use cases
 * }
 * ```
 */
export function usePageBuilderStore<TData = any>(): PageBuilderStore<TData> {
  const store = useContext(PageBuilderStoreContext);
  if (!store) {
    throw new Error('usePageBuilderStore must be used within PageBuilderStoreProvider');
  }
  return store as PageBuilderStore<TData>;
}

/**
 * Hook for accessing the full PageBuilder state with optional selector
 *
 * Provides access to the entire PageBuilder state or a derived value using a selector.
 * This is a low-level hook; consider using usePage, useSection, or useBlock for
 * specific use cases.
 *
 * @template TData - Type of page data
 * @template R - Return type when using selector
 * @param selector - Optional selector function for subscribing to specific state
 * @returns Full state or selected value
 *
 * @example
 * ```tsx
 * // Get entire state
 * const state = usePageBuilderState();
 *
 * // Get specific value with selector (optimized)
 * const sections = usePageBuilderState(state => state.sections);
 * const sectionCount = usePageBuilderState(state => state.sectionOrder.length);
 * ```
 */
export function usePageBuilderState<TData = any>(): PageBuilderState<TData>;
export function usePageBuilderState<TData = any, R = any>(selector: PageSelector<TData, R>): R;
export function usePageBuilderState<TData = any, R = any>(selector?: PageSelector<TData, R>) {
  const store = usePageBuilderStore<TData>();
  return useStore(store, selector ?? ((state) => state as PageBuilderState<TData>));
}

/**
 * Hook for accessing page-level data and metadata
 *
 * Provides access to global page data loaded on the server, along with page metadata.
 * Supports selectors for fine-grained subscriptions to prevent unnecessary re-renders.
 *
 * @template TData - Type of page data
 * @template R - Return type when using selector
 * @param selector - Optional selector for subscribing to specific page data
 * @returns Page data object or selected value
 *
 * @example
 * ```tsx
 * // Get all page data
 * const page = usePage<ProductPageData>();
 * console.log(page.data.product); // Typed as ProductPageData
 *
 * // Get specific data with selector (prevents re-renders on other changes)
 * const productName = usePage(state => state.data?.product.name);
 * const pageId = usePage(state => state.pageId);
 * ```
 */
export function usePage<TData = any>(): {
  pageId: string;
  pageName: string;
  data?: TData;
  metadata?: Record<string, any>;
};
export function usePage<TData = any, R = any>(selector: PageSelector<TData, R>): R;
export function usePage<TData = any, R = any>(selector?: PageSelector<TData, R>) {
  const store = usePageBuilderStore<TData>();

  if (selector) {
    return useStore(store, selector);
  }

  return useStore(store, (state) => ({
    pageId: state.pageId,
    pageName: state.pageName,
    data: state.data,
    metadata: state.metadata,
  }));
}

/**
 * Optional hook for accessing page data
 *
 * Similar to usePage, but returns null instead of throwing an error when used
 * outside of PageBuilderStoreProvider. Useful for components that may render
 * in different contexts.
 *
 * @template TData - Type of page data
 * @returns Page data object or null if outside provider
 *
 * @example
 * ```tsx
 * function OptionalPageInfo() {
 *   const page = usePageOptional();
 *
 *   if (!page) {
 *     return <div>No page data available</div>;
 *   }
 *
 *   return <div>Page: {page.pageName}</div>;
 * }
 * ```
 */
export function usePageOptional<TData = any>() {
  const contextStore = useContext(PageBuilderStoreContext);
  const store =
    (contextStore as PageBuilderStore<TData> | null) ??
    (fallbackPageBuilderStore as PageBuilderStore<TData>);
  const value = useStore(store, (state) => ({
    pageId: state.pageId,
    pageName: state.pageName,
    data: state.data,
    metadata: state.metadata,
  }));

  return contextStore ? value : null;
}

/**
 * Internal helper to resolve section arguments
 * Supports both explicit sectionId and context-based resolution
 *
 * @internal
 */
function useResolvedSectionArguments<TSettings, R>(
  sectionIdOrSelector?: string | SectionSelector<TSettings, R>,
  maybeSelector?: SectionSelector<TSettings, R>
) {
  const sectionIdFromContext = useContext(SectionContext);
  const hasExplicitId = typeof sectionIdOrSelector === 'string';
  const sectionId = hasExplicitId ? (sectionIdOrSelector as string) : sectionIdFromContext;
  const selector = hasExplicitId
    ? maybeSelector
    : (sectionIdOrSelector as SectionSelector<TSettings, R> | undefined);

  return { sectionId, selector } as const;
}

/**
 * Hook for accessing section state and settings
 *
 * Provides access to section configuration, settings, and child blocks.
 * Supports both explicit sectionId parameter and automatic resolution from SectionContext.
 * Use selectors for fine-grained subscriptions to specific section properties.
 *
 * @template TSettings - Type of section settings
 * @template R - Return type when using selector
 * @param sectionId - Section ID (optional if used within SectionContext)
 * @param selector - Optional selector for subscribing to specific section data
 * @returns Section state or selected value
 * @throws Error if sectionId not provided and not in SectionContext
 *
 * @example
 * ```tsx
 * // In a section component - ID is implicit from context
 * function MySection({ id }: SectionProps) {
 *   const section = useSection<MySectionSettings>();
 *   return <div>{section.settings.title}</div>;
 * }
 *
 * // Explicit ID with typed settings
 * const section = useSection<MySectionSettings>('section-1');
 *
 * // With selector for optimization
 * const title = useSection('section-1', s => s.settings.title);
 * const blockCount = useSection('section-1', s => s.blocks?.length ?? 0);
 * ```
 */
export function useSection<TSettings = Record<string, any>>(
  sectionId?: string
): SectionState<TSettings> | null;
export function useSection<TSettings = Record<string, any>, R = any>(
  sectionId: string,
  selector: SectionSelector<TSettings, R>
): R | undefined;
export function useSection<TSettings = Record<string, any>, R = any>(
  sectionIdOrSelector?: string | SectionSelector<TSettings, R>,
  maybeSelector?: SectionSelector<TSettings, R>
) {
  const { sectionId, selector } = useResolvedSectionArguments<TSettings, R>(
    sectionIdOrSelector,
    maybeSelector
  );
  const store = usePageBuilderStore();

  if (!sectionId) {
    throw new Error('useSection must receive sectionId or be used within SectionContext');
  }

  return useStore(store, (state) => {
    const section = state.sections[sectionId] as SectionState<TSettings> | undefined;
    if (!section) {
      console.warn(`Section with id "${sectionId}" not found in store`);
      return selector ? undefined : null;
    }

    return selector ? selector(section) : section;
  });
}

/**
 * Internal helper to resolve block arguments
 * Supports both explicit blockId and context-based resolution
 *
 * @internal
 */
function useResolvedBlockArguments<TSettings, R>(
  blockIdOrSelector?: string | BlockSelector<TSettings, R>,
  maybeSelector?: BlockSelector<TSettings, R>
) {
  const blockIdFromContext = useContext(BlockContext);
  const hasExplicitId = typeof blockIdOrSelector === 'string';
  const blockId = hasExplicitId ? (blockIdOrSelector as string) : blockIdFromContext;
  const selector = hasExplicitId
    ? maybeSelector
    : (blockIdOrSelector as BlockSelector<TSettings, R> | undefined);

  return { blockId, selector } as const;
}

/**
 * Hook for accessing block state and settings
 *
 * Provides access to block configuration and settings.
 * Supports both explicit blockId parameter and automatic resolution from BlockContext.
 * Use selectors for fine-grained subscriptions to specific block properties.
 *
 * @template TSettings - Type of block settings
 * @template R - Return type when using selector
 * @param blockId - Block ID (optional if used within BlockContext)
 * @param selector - Optional selector for subscribing to specific block data
 * @returns Block state or selected value
 * @throws Error if blockId not provided and not in BlockContext
 *
 * @example
 * ```tsx
 * // In a block component - ID is implicit from context
 * function MyBlock({ id }: BlockProps) {
 *   const block = useBlock<MyBlockSettings>();
 *   return <div>{block.settings.content}</div>;
 * }
 *
 * // Explicit ID with typed settings
 * const block = useBlock<MyBlockSettings>('block-1');
 *
 * // With selector for optimization
 * const content = useBlock('block-1', b => b.settings.content);
 * const blockType = useBlock('block-1', b => b.type);
 * ```
 */
export function useBlock<TSettings = Record<string, any>>(
  blockId?: string
): BlockState<TSettings> | null;
export function useBlock<TSettings = Record<string, any>, R = any>(
  blockId: string,
  selector: BlockSelector<TSettings, R>
): R | undefined;
export function useBlock<TSettings = Record<string, any>, R = any>(
  blockIdOrSelector?: string | BlockSelector<TSettings, R>,
  maybeSelector?: BlockSelector<TSettings, R>
) {
  const { blockId, selector } = useResolvedBlockArguments<TSettings, R>(
    blockIdOrSelector,
    maybeSelector
  );
  const store = usePageBuilderStore();

  if (!blockId) {
    throw new Error('useBlock must receive blockId or be used within BlockContext');
  }

  return useStore(store, (state) => {
    const block = state.blocks[blockId] as BlockState<TSettings> | undefined;
    if (!block) {
      console.warn(`Block with id "${blockId}" not found in store`);
      return selector ? undefined : null;
    }

    return selector ? selector(block) : block;
  });
}

/**
 * Hook for accessing PageBuilder actions
 *
 * Provides methods for updating PageBuilder state, such as adding/removing sections,
 * updating settings, and managing page data. These actions trigger re-renders for
 * components subscribed to the affected state.
 *
 * @template TData - Type of page data
 * @returns Object containing all PageBuilder actions
 *
 * @example
 * ```tsx
 * function EditorControls() {
 *   const actions = usePageBuilderActions();
 *
 *   const addNewSection = () => {
 *     actions.addSection({
 *       id: 'new-section',
 *       type: 'hero',
 *       settings: { title: 'New Hero' }
 *     });
 *   };
 *
 *   const updatePageData = () => {
 *     actions.setPageData({ user: { name: 'John' } });
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={addNewSection}>Add Section</button>
 *       <button onClick={updatePageData}>Update Data</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePageBuilderActions<TData = any>(): PageBuilderActions<TData> {
  const store = usePageBuilderStore<TData>();
  return useStore(store, (state) => state.actions);
}

/**
 * Hook for accessing the PageBuilder registry
 *
 * Provides access to registered sections and blocks, their schemas,
 * and utility functions for working with the registry. Useful for
 * building dynamic UIs, editors, or inspecting available components.
 *
 * @returns Object containing registry access methods
 *
 * @example
 * ```tsx
 * function SectionPicker() {
 *   const { listSections, getSectionSchema } = usePageBuilder();
 *   const sections = listSections();
 *
 *   return (
 *     <div>
 *       {sections.map(slug => {
 *         const schema = getSectionSchema(slug);
 *         return (
 *           <button key={slug}>
 *             {schema?.name || slug}
 *           </button>
 *         );
 *       })}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePageBuilder() {
  return {
    getSectionSchema: (slug: string) => pageBuilderRegistry.getSectionSchema(slug),
    getBlockSchema: (slug: string) => pageBuilderRegistry.getBlockSchema(slug),
    listSections: () => pageBuilderRegistry.listSections(),
    listBlocks: () => pageBuilderRegistry.listBlocks(),
    getSection: (slug: string) => pageBuilderRegistry.getSection(slug),
    getBlock: (slug: string) => pageBuilderRegistry.getBlock(slug),
  };
}
