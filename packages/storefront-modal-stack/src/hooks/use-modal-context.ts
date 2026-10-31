'use client';

import { useContext } from 'react';
import { ModalStackContext } from '../context/context';
import type { ModalStackPayloads } from '../index';
import type { IModalStackContext, ModalPayloadOf } from '../types';

/**
 * Hook to access the current modal stack item context
 * Must be used within a ModalStackProvider
 *
 * @example
 * ```tsx
 * function MyModalContent() {
 *   const { payload, pop, setDirty } = useModalStackContext();
 *
 *   return (
 *     <div>
 *       <p>Entity ID: {payload.entityId}</p>
 *       <button onClick={pop}>Close</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useModalStackContext<
  TType extends string = string,
>(): IModalStackContext<ModalPayloadOf<ModalStackPayloads, TType>> {
  const context = useContext(ModalStackContext);

  if (context === undefined) {
    throw new Error(
      'useModalStackContext must be used within a ModalStackProvider'
    );
  }

  return context as unknown as IModalStackContext<
    ModalPayloadOf<ModalStackPayloads, TType>
  >;
}
