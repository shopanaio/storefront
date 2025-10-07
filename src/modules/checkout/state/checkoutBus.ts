/**
 * Checkout event bus powered by Emittery.
 * Provides typed events for sections, providers, method selection, and submit lifecycle.
 * This module is intended to be used from client-side Checkout code.
 */
import Emittery from 'emittery';
import { SectionEntry, SectionId } from '@src/modules/checkout/state/interface';

/**
 * Operation keys for tracking inflight operations.
 * Each key represents a unique checkout API operation.
 */
export enum OperationKey {
  SelectDeliveryMethod = 'selectDeliveryMethod',
  SelectPaymentMethod = 'selectPaymentMethod',
  UpdateCustomerIdentity = 'updateCustomerIdentity',
  AddDeliveryAddresses = 'addDeliveryAddresses',
  UpdateDeliveryAddresses = 'updateDeliveryAddresses',
  RemoveDeliveryAddresses = 'removeDeliveryAddresses',
  AddDeliveryRecipients = 'addDeliveryRecipients',
  UpdateDeliveryRecipients = 'updateDeliveryRecipients',
  RemoveDeliveryRecipients = 'removeDeliveryRecipients',
  AddPromoCode = 'addPromoCode',
  RemovePromoCode = 'removePromoCode',
  UpdateCustomerNote = 'updateCustomerNote',
}

/**
 * @deprecated Use OperationKey instead
 */
export type InflightKey = OperationKey;


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
  /** Emitted when user selects a payment method */
  MethodPaymentSelected = 'method/payment-selected',
  /** Emitted when user selects a delivery method */
  MethodDeliverySelected = 'method/delivery-selected',
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
    sectionId: SectionId;
  };
  [CheckoutEvent.SectionInvalid]: {
    sectionId: SectionId;
    errors?: Record<string, string>;
  };
  [CheckoutEvent.SectionReset]: {
    sectionId: SectionId;
  };

  /** Method selection events */
  [CheckoutEvent.MethodPaymentSelected]: {
    provider: string;
    code: string;
  };
  [CheckoutEvent.MethodDeliverySelected]: {
    groupId: string;
    provider: string;
    code: string;
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
    key: OperationKey;
    sectionId?: SectionId;
  };
  [CheckoutEvent.OperationEnd]: {
    key: OperationKey;
    sectionId?: SectionId;
  };
  /**
   * Operation error event for UI error indicators and toasts.
   * Consumers may map `sectionId` to local error presentation.
   */
  [CheckoutEvent.OperationError]: {
    key: OperationKey;
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
