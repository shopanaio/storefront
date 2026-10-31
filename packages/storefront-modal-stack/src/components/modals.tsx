'use client';

import { Suspense, useEffect, useRef, type ReactNode } from 'react';
import { ModalStackUrlController } from './modal-stack-url-controller';

import { ModalStackItem } from './modal';
import { modalStackRegistry } from '../registry/modal-registry';
import { useModalStackStore } from '../store/modals';
import type { IModalStackDefinition, IModalStackItem } from '../types';

interface INestedModalStackProps {
  items: IModalStackItem[];
  totalCount: number;
  level?: number;
  fallback?: ReactNode;
}

/**
 * Recursive component for rendering nested modal stack items
 */
const NestedModalStack = ({
  items,
  totalCount,
  level = 0,
  fallback,
}: INestedModalStackProps) => {
  const [current, ...rest] = items;

  const hasMore = rest.length > 0;

  return (
    <ModalStackItem
      item={current}
      level={level}
      totalCount={totalCount}
      fallback={fallback}
    >
      {hasMore && (
        <NestedModalStack
          items={rest}
          totalCount={totalCount}
          level={level + 1}
          fallback={fallback}
        />
      )}
    </ModalStackItem>
  );
};

interface IModalStackProps {
  /**
   * Item definitions registered once on mount. The URL projection is restored only after
   * they are registered: links to these types open on page load.
   */
  items?: () => IModalStackDefinition[];
  /** Shown while an item component loads; by default a centered spinner. */
  fallback?: ReactNode;
}

/**
 * Registers the definitions of the theme and marks the registry ready. Items registered later
 * with `registerModalStackItem` still open, and URL entries of them restore on registration.
 */
function useModalStackRegistration(items: IModalStackProps['items']) {
  const registeredRef = useRef(false);

  useEffect(() => {
    if (registeredRef.current) {
      return;
    }
    registeredRef.current = true;
    items?.().forEach((item) => modalStackRegistry.register(item));
    modalStackRegistry.markReady();
  }, [items]);
}

/**
 * Root modal stack component
 * Renders all open modal stack items from the store
 *
 * Place this component once in the theme layout, inside antd `App`:
 *
 * @example
 * ```tsx
 * import { ModalStack } from "@shopana/storefront-modal-stack";
 *
 * export default function Layout({ children }) {
 *   return (
 *     <>
 *       {children}
 *       <ModalStack items={getModalStackItems} />
 *     </>
 *   );
 * }
 * ```
 */
export const ModalStack = ({
  items: definitions,
  fallback,
}: IModalStackProps) => {
  const items = useModalStackStore((state) => state.items);
  useModalStackRegistration(definitions);

  return (
    <>
      <Suspense fallback={null}>
        <ModalStackUrlController />
      </Suspense>
      {items.length > 0 && (
        <NestedModalStack
          items={items}
          totalCount={items.length}
          fallback={fallback}
        />
      )}
    </>
  );
};
