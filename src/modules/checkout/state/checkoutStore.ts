/**
 * Checkout Zustand store.
 * Holds aggregate validation state and method selections for Checkout module.
 * Emits typed events via checkoutBus on important state transitions.
 */
import { create } from 'zustand';
import {
  emitCheckoutEvent,
  CheckoutEvent,
} from '@src/modules/checkout/state/checkoutBus';
import { SectionEntry, SectionId } from '@src/modules/checkout/state/interface';
import { CheckoutState } from '@src/modules/checkout/state/interface';

/**
 * Determine if a section is valid in the current state.
 * Delivery/payment sections are validated against selected method and active provider status.
 */
export function isSectionValid(sectionEntry: SectionEntry): boolean {
  return (
    Boolean(sectionEntry) &&
    sectionEntry.required &&
    sectionEntry.status === 'valid'
  );
}

/**
 * Compute list of missing required sections considering delivery groups and providers state.
 */
export function computeMissingRequiredSections(
  state: CheckoutState
): SectionId[] {
  return Object.entries(state.sections)
    .filter(([, entry]) => !isSectionValid(entry))
    .map(([key]) => key as SectionId);
}

/**
 * Returns true when there are no missing required sections.
 */
export function canSubmit(state: CheckoutState): boolean {
  return Object.entries(state.sections).every(([, entry]) => {
    if (entry?.required && entry.status !== 'valid') {
      return false;
    }

    return true;
  });
}

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  sections: {},
  selectedPaymentMethod: null,
  activeOperationsCount: 0,
  selectedDeliveryMethodByGroup: {},

  // Sections
  registerSection: (id, required) => {
    set((state) => ({
      sections: {
        ...state.sections,
        [id]: { data: null, status: 'idle', required, busy: false },
      },
    }));
    void emitCheckoutEvent(CheckoutEvent.SectionRegistered, {
      sectionId: id,
      required,
    });
  },
  unregisterSection: (id) => {
    set((state) => {
      const rest = { ...state.sections } as Record<
        SectionId,
        SectionEntry | undefined
      >;
      delete rest[id as SectionId];
      return { sections: rest as Partial<Record<SectionId, SectionEntry>> };
    });
    void emitCheckoutEvent(CheckoutEvent.SectionUnregistered, {
      sectionId: id,
    });
  },
  sectionValid: (id) => {
    set((state) => ({
      sections: {
        ...state.sections,
        [id]: {
          ...(state.sections[id] as SectionEntry | undefined),
          status: 'valid',
          required: state.sections[id]?.required ?? true,
          busy: state.sections[id]?.busy ?? false,
        },
      },
    }));
    void emitCheckoutEvent(CheckoutEvent.SectionValid, {
      sectionId: id as SectionId,
    });
  },
  sectionInvalid: (id, errors) => {
    set((state) => ({
      sections: {
        ...state.sections,
        [id]: {
          ...(state.sections[id] as SectionEntry | undefined),
          status: 'invalid',
          errors,
          required: state.sections[id]?.required ?? true,
          busy: state.sections[id]?.busy ?? false,
        },
      },
    }));
    void emitCheckoutEvent(CheckoutEvent.SectionInvalid, {
      sectionId: id as SectionId,
      errors,
    });
  },
  resetSection: (id) => {
    set((state) => ({
      sections: {
        ...state.sections,
        [id]: {
          ...(state.sections[id] as SectionEntry | undefined),
          status: 'idle',
          data: null,
          errors: undefined,
          required: state.sections[id]?.required ?? true,
          busy: false,
        },
      },
    }));
    void emitCheckoutEvent(CheckoutEvent.SectionReset, { sectionId: id });
  },
  setSectionBusy: (id, busy) => {
    set((state) => ({
      sections: {
        ...state.sections,
        [id]: {
          ...(state.sections[id] as SectionEntry | undefined),
          busy,
          required: state.sections[id]?.required ?? true,
          data: state.sections[id]?.data ?? null,
          status: state.sections[id]?.status ?? 'idle',
        },
      },
    }));
  },

  // Active operations tracking
  incrementActiveOperations: () => {
    set((state) => ({
      activeOperationsCount: state.activeOperationsCount + 1,
    }));
  },
  decrementActiveOperations: () => {
    set((state) => ({
      activeOperationsCount: Math.max(0, state.activeOperationsCount - 1),
    }));
  },

  // Submission
  requestSubmit: () => {
    void emitCheckoutEvent(CheckoutEvent.SubmitRequested, {});

    const state = get();
    const missing = computeMissingRequiredSections(state);
    if (missing.length > 0) {
      void emitCheckoutEvent(CheckoutEvent.SubmitBlocked, { missing });
      return;
    }

    void emitCheckoutEvent(CheckoutEvent.SubmitReady, {
      payload: state.sections,
    });
  },
}));
