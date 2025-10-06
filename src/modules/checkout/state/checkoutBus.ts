/**
 * Checkout event bus powered by Emittery.
 * Provides typed events for sections, providers, method selection, and submit lifecycle.
 * This module is intended to be used from client-side Checkout code.
 */
import Emittery from 'emittery';
import type { SectionDtoMap } from '@src/modules/checkout/core/contracts/dto';
import { SectionEntry, SectionId } from '@src/modules/checkout/state/types';

/**
 * Inflight operation key used by orchestrator to group async operations.
 */
export type InflightKey = SectionId;

/**
 * Checkout event names enum for type-safe event handling.
 */
export enum CheckoutEvent {
  /** Emitted when a section registers itself with the checkout orchestrator */
  SectionRegistered = 'section/registered',
  /** Emitted when a section unregisters itself from the checkout orchestrator */
  SectionUnregistered = 'section/unregistered',
  /** Emitted when a section passes validation and provides valid DTO */
  SectionValid = 'section/valid',
  /** Emitted when a section fails validation with optional errors */
  SectionInvalid = 'section/invalid',
  /** Emitted when a section is reset to its initial state */
  SectionReset = 'section/reset',
  /** Emitted when user requests checkout submission */
  SubmitRequested = 'submit/requested',
  /** Emitted when submission is blocked due to missing or invalid sections */
  SubmitBlocked = 'submit/blocked',
  /** Emitted when all sections are valid and checkout is ready to submit */
  SubmitReady = 'submit/ready',
  /** Emitted when checkout submission has completed successfully */
  SubmitCompleted = 'submit/completed',
  /** Emitted when an async operation starts (for UI busy indicators) */
  OperationStart = 'operation/start',
  /** Emitted when an async operation completes successfully */
  OperationEnd = 'operation/end',
  /** Emitted when an async operation fails with error details */
  OperationError = 'operation/error',
}

/**
 * Static section keys that have corresponding DTOs in SectionDtoMap.
 */
export type StaticSectionId = keyof SectionDtoMap;

/**
 * Resolve section DTO type by section key.
 * - Static keys use SectionDtoMap
 * - Dynamic delivery keys use DeliverySectionDto
 */
export type SectionDtoFor<K extends SectionId> = K extends StaticSectionId
  ? SectionDtoMap[K]
  : never;

/**
 * Aggregated payload emitted when Checkout is ready for submission.
 */
export type CheckoutPayload = Partial<Record<SectionId, SectionEntry>>;

/**
 * Typed map of all Checkout events and their payloads.
 */
export type CheckoutEvents = {
  /** Section events */
  [CheckoutEvent.SectionRegistered]: {
    sectionId: SectionId;
    required: boolean;
  };
  [CheckoutEvent.SectionUnregistered]: {
    sectionId: SectionId;
  };
  [CheckoutEvent.SectionValid]: {
    sectionId: StaticSectionId;
    dto: SectionDtoMap[StaticSectionId];
  };
  [CheckoutEvent.SectionInvalid]: {
    sectionId: StaticSectionId;
    dto?: SectionDtoMap[StaticSectionId];
    errors?: Record<string, string>;
  };
  [CheckoutEvent.SectionReset]: {
    sectionId: SectionId;
  };

  /** Submit events */
  [CheckoutEvent.SubmitRequested]: object;
  [CheckoutEvent.SubmitBlocked]: {
    missing: SectionId[];
    errors?: Record<SectionId, string[]>;
  };
  [CheckoutEvent.SubmitReady]: {
    payload: CheckoutPayload;
  };
  [CheckoutEvent.SubmitCompleted]: object;

  /** Operation lifecycle events for UI busy indicators. */
  [CheckoutEvent.OperationStart]: {
    key: InflightKey;
    sectionId?: SectionId;
  };
  [CheckoutEvent.OperationEnd]: {
    key: InflightKey;
    sectionId?: SectionId;
  };
  /**
   * Operation error event for UI error indicators and toasts.
   * Consumers may map `sectionId` to local error presentation.
   */
  [CheckoutEvent.OperationError]: {
    key: InflightKey;
    sectionId?: SectionId;
    /** Optional human-readable message */
    message?: string;
    /** Optional machine error code */
    code?: string;
    /**
     * Raw error object as-is for advanced consumers.
     * Keep it typed as unknown to avoid leaking transport-specific types.
     */
    error?: unknown;
  };
};

/**
 * Singleton event bus instance for Checkout module.
 */
export const checkoutBus = new Emittery<CheckoutEvents>();

/**
 * Subscribe to a specific Checkout event.
 * @param eventName - The event name to subscribe to.
 * @param listener - The listener invoked when the event is emitted.
 * @returns Unsubscribe function.
 */
export function onCheckoutEvent<K extends keyof CheckoutEvents>(
  eventName: K,
  listener: (eventData: CheckoutEvents[K]) => void | Promise<void>
) {
  return checkoutBus.on(eventName, listener);
}

/**
 * Emit a Checkout event with a typed payload.
 * @param eventName - The event name to emit.
 * @param eventData - The payload of the event.
 */
export function emitCheckoutEvent<K extends keyof CheckoutEvents>(
  eventName: K,
  eventData: CheckoutEvents[K]
): Promise<void> {
  return checkoutBus.emit(eventName, eventData);
}
