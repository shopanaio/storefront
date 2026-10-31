import { ComponentType, LazyExoticComponent } from 'react';

/**
 * Base payload interface for all modal stack items
 * Each item type extends this with its own payload shape
 */
export interface IModalStackPayload {
  entityId?: string | number;
  mode?: 'view' | 'details' | 'edit' | 'create';
  [key: string]: unknown;
}

export interface IModalStackOpenOptions {
  /** Include this instance in the URL. Requires a codec in its registry definition. */
  url?: boolean;
  owner?: string;
  onRemoved?: (reason: 'closed' | 'owner-disposed') => void;
}

export type ModalUrlValue =
  | string
  | number
  | boolean
  | null
  | ModalUrlValue[]
  | { [key: string]: ModalUrlValue };

export interface IModalUrlCodec<
  T extends IModalStackPayload = IModalStackPayload,
> {
  schema: { parse: (value: unknown) => Record<string, ModalUrlValue> };
  project: (payload: T) => Record<string, ModalUrlValue>;
  restore: (params: Record<string, ModalUrlValue>) => T;
}

/**
 * Modal stack item stored in the state
 */
export interface IModalStackItem<
  T extends IModalStackPayload = IModalStackPayload,
> {
  uuid: string;
  url?: boolean;
  type: string;
  payload: T;
  owner?: string;
  isDirty?: boolean;
  isSaving?: boolean;
  onRemoved?: (reason: 'closed' | 'owner-disposed') => void;
}

/**
 * Context value provided to modal stack item components
 */
export interface IModalStackContext<T = IModalStackPayload> {
  uuid: string;
  type: string;
  payload: T;
  isDirty: boolean;
  isSaving: boolean;
  pop: () => void;
  forcePop: () => void;
  setDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;
  updatePayload: (payload: Partial<T>) => void;
}

/**
 * Modal stack item component type - can be regular or lazy loaded
 */
export type ModalStackComponent =
  | ComponentType<object>
  | LazyExoticComponent<ComponentType<object>>;

/**
 * Modal stack item definition for registration
 */
export interface IModalStackDefinition<
  T extends IModalStackPayload = IModalStackPayload,
> {
  type: string;
  owner?: string;
  component: ModalStackComponent;
  url?: IModalUrlCodec<T>;
}

/**
 * Options for pushing a modal stack item
 */
export interface IModalStackPushOptions<
  T extends IModalStackPayload = IModalStackPayload,
> extends IModalStackOpenOptions {
  type: string;
  payload?: T;
}

/**
 * Modal stack registry map type
 */
export type ModalStackRegistryMap = Map<string, IModalStackDefinition>;

// ============================================================================
// Type-safe payloads
// ============================================================================

/**
 * `ModalStackPayloads` is declared in the package entry (index.ts); a theme augments it:
 *
 * declare module "@shopana/storefront-modal-stack" {
 *   interface ModalStackPayloads {
 *     product: { entityId: string; mode?: "view" | "edit" };
 *   }
 * }
 */

/**
 * Payload for a registry `type`: the declared shape for augmented types,
 * the loose base payload for everything else.
 */
export type ModalPayloadOf<
  TPayloads,
  TType extends string,
> = TType extends keyof TPayloads ? TPayloads[TType] : IModalStackPayload;
