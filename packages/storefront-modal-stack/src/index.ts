// ============================================================================
// Components
// ============================================================================
export { ModalStack } from './components/modals';
export { ModalStackItem } from './components/modal';
export { ModalStackProvider } from './components/provider';

// ============================================================================
// Registry
// ============================================================================
export {
  modalStackRegistry,
  registerModalStackItem,
  registerModalStackItems,
} from './registry/modal-registry';

// ============================================================================
// Store
// ============================================================================
export { useModalStackStore } from './store/modals';

// ============================================================================
// Hooks
// ============================================================================
export { useModalStackContext } from './hooks/use-modal-context';
export { useCopyModalStackUrl } from './hooks/use-copy-modal-url';
export {
  useModalStack,
  useModalStackItem,
  createModalStackHook,
} from './hooks/use-modal';

// ============================================================================
// i18n
// ============================================================================
export {
  MODAL_STACK_NAMESPACE,
  modalStackMessages,
  type ModalStackMessages,
} from './i18n/messages';

// ============================================================================
// Types & URL
// ============================================================================
export type {
  IModalStackContext,
  IModalStackDefinition,
  IModalStackItem,
  IModalStackOpenOptions,
  IModalStackPayload,
  IModalUrlCodec,
  ModalPayloadOf,
  ModalStackComponent,
  ModalUrlValue,
} from './types';
export { createModalUrlCodec, MODAL_URL_PARAM } from './url/projection';
export { createModalStackUrl } from './url/share-url';

/**
 * Registry of payload shapes by modal `type`. A theme augments it:
 *
 * declare module '@shopana/storefront-modal-stack' {
 *   interface ModalStackPayloads {
 *     [PRODUCT_MODAL_TYPE]: ProductModalPayload;
 *   }
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ModalStackPayloads {}
