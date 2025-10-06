/**
 * Checkout Zustand store.
 * Holds aggregate validation state and method selections for Checkout module.
 * Emits typed events via checkoutBus on important state transitions.
 */
import { create } from 'zustand';
import { emitCheckoutEvent } from '@src/modules/checkout/state/checkoutBus';
import type { SectionDtoFor, StaticSectionKey } from '@src/modules/checkout/state/checkoutBus';
import type { SectionDtoMap, DeliverySectionDto } from '@src/modules/checkout/core/contracts/dto';

/**
 * Validation status for sections and providers.
 */
export type ValidationStatus = 'idle' | 'valid' | 'invalid';

/**
 * Unique identifier of a delivery group.
 */
export type DeliveryGroupId = string;

/**
 * Static section identifiers present regardless of delivery grouping.
 */
export type SectionId =
  | 'contact'
  | 'recipient'
  | 'address'
  | 'payment'
  | 'promo'
  | 'comment';

/**
 * Dynamic delivery section key bound to a specific delivery group.
 */
export type DeliverySectionId = `delivery:${DeliveryGroupId}`;

/**
 * Union of all section keys.
 */
export type SectionKey = SectionId | DeliverySectionId;

/**
 * Section aggregate entry held in the store.
 */
export interface SectionEntry {
  data: unknown | null;
  status: ValidationStatus;
  errors?: Record<string, string>;
  required: boolean;
  busy: boolean;
}

/**
 * Selected method shape.
 */
export interface SelectedMethod {
  code: string;
  vendor: string;
}

/**
 * Public store interface with state and actions.
 */
export interface CheckoutState {
  sections: Partial<Record<SectionKey, SectionEntry>>;
  selectedDeliveryMethodByGroup: Partial<
    Record<DeliveryGroupId, SelectedMethod | null>
  >;
  selectedPaymentMethod: SelectedMethod | null;
  activeOperationsCount: number;

  // Section actions
  registerSection: (id: SectionKey, required: boolean) => void;
  unregisterSection: (id: SectionKey) => void;
  sectionValid: <K extends SectionKey>(id: K, dto: SectionDtoFor<K>) => void;
  sectionInvalid: <K extends SectionKey>(id: K, dto?: SectionDtoFor<K>, errors?: Record<string, string>) => void;
  resetSection: (id: SectionKey) => void;
  setSectionBusy: (id: SectionKey, busy: boolean) => void;

  // Method selection
  selectShippingMethod: (
    groupId: DeliveryGroupId,
    selection: { code: string; vendor: string } | null
  ) => void;
  selectPaymentMethod: (
    selection: { code: string; vendor: string } | null
  ) => void;

  // Invalidation
  invalidateShippingProvidersByGroup: (groupId: DeliveryGroupId) => void;

  // Active operations tracking
  incrementActiveOperations: () => void;
  decrementActiveOperations: () => void;

  // Submission
  requestSubmit: () => void;
}

/**
 * Extract groupId from a dynamic delivery section key.
 */
function getGroupIdFromDeliverySection(
  sectionKey: DeliverySectionId
): DeliveryGroupId {
  return sectionKey.slice('delivery:'.length);
}

/**
 * Determine if a section is valid in the current state.
 * Delivery/payment sections are validated against selected method and active provider status.
 */
export function isSectionValid(
  state: CheckoutState,
  sectionKey: SectionKey
): boolean {
  const entry = state.sections[sectionKey];
  if (!entry) return false;

  const isDeliverySection = sectionKey.startsWith('delivery:');
  if (isDeliverySection) {
    const groupId = getGroupIdFromDeliverySection(
      sectionKey as DeliverySectionId
    );
    const selection = state.selectedDeliveryMethodByGroup[groupId] ?? null;
    if (!selection?.code) return false;
    // Check that the provider form is also valid
    return entry.status === 'valid';
  }

  if (sectionKey === 'payment') {
    const sel = state.selectedPaymentMethod;
    if (!sel?.code) return false;
    // Check that the provider form is also valid
    return entry.status === 'valid';
  }

  return entry.status === 'valid';
}

/**
 * Compute list of missing required sections considering delivery groups and providers state.
 */
export function computeMissingRequiredSections(
  state: CheckoutState
): SectionKey[] {
  const missing: SectionKey[] = [];

  for (const [key, entry] of Object.entries(state.sections)) {
    if (!entry) continue;
    if (!entry.required) continue;
    const sectionKey = key as SectionKey;
    if (!isSectionValid(state, sectionKey)) missing.push(sectionKey);
  }

  return missing;
}

/**
 * Returns true when there are no missing required sections.
 */
export function canSubmit(state: CheckoutState): boolean {
  return Object.entries(state.sections).every(([id, entry]) => {
    if (entry?.required && entry.status !== 'valid') return false;
    return true;
  });
}

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  sections: {},
  selectedDeliveryMethodByGroup: {},
  selectedPaymentMethod: null,
  activeOperationsCount: 0,

  // Sections
  registerSection: (id, required) => {
    set((state) => ({
      sections: {
        ...state.sections,
        [id]: { data: null, status: 'idle', required, busy: false },
      },
    }));
    void emitCheckoutEvent('section/registered', { sectionId: id, required });
  },
  unregisterSection: (id) => {
    set((state) => {
      const rest = { ...state.sections } as Record<
        SectionKey,
        SectionEntry | undefined
      >;
      delete rest[id as SectionKey];
      return { sections: rest as Partial<Record<SectionKey, SectionEntry>> };
    });
    void emitCheckoutEvent('section/unregistered', { sectionId: id });
  },
  sectionValid: (id, dto) => {
    set((state) => ({
      sections: {
        ...state.sections,
        [id]: {
          ...(state.sections[id] as SectionEntry | undefined),
          data: dto,
          status: 'valid',
          required: state.sections[id]?.required ?? true,
          busy: state.sections[id]?.busy ?? false,
        },
      },
    }));
    if ((id as string).startsWith('delivery:')) {
      void emitCheckoutEvent('section/valid', { sectionId: id as DeliverySectionId, dto: dto as DeliverySectionDto });
    } else {
      void emitCheckoutEvent('section/valid', { sectionId: id as StaticSectionKey, dto: dto as SectionDtoMap[StaticSectionKey] });
    }
  },
  sectionInvalid: (id, dto, errors) => {
    set((state) => ({
      sections: {
        ...state.sections,
        [id]: {
          ...(state.sections[id] as SectionEntry | undefined),
          status: 'invalid',
          errors,
          required: state.sections[id]?.required ?? true,
          data: dto ?? state.sections[id]?.data ?? null,
          busy: state.sections[id]?.busy ?? false,
        },
      },
    }));
    if ((id as string).startsWith('delivery:')) {
      void emitCheckoutEvent('section/invalid', { sectionId: id as DeliverySectionId, dto: dto as DeliverySectionDto, errors });
    } else {
      void emitCheckoutEvent('section/invalid', { sectionId: id as StaticSectionKey, dto: dto as SectionDtoMap[StaticSectionKey], errors });
    }
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
    void emitCheckoutEvent('section/reset', { sectionId: id });
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

  // Method selection
  selectShippingMethod: (groupId, selection) => {
    set((state) => ({
      selectedDeliveryMethodByGroup: {
        ...state.selectedDeliveryMethodByGroup,
        [groupId]: selection
          ? { code: selection.code, vendor: selection.vendor }
          : null,
      },
    }));
    void emitCheckoutEvent('method/delivery-selected', {
      groupId,
      code: selection?.code ?? null,
    });

    // Activate the selected provider within the group; deactivate others in the same group
    if (selection) {
      // The logic for provider activation/deactivation is now handled by the section controller
      // We just need to ensure the selection is valid
    } else {
      // Deactivate all providers in the group
      // The logic for provider deactivation is now handled by the section controller
    }
  },
  selectPaymentMethod: (selection) => {
    set({
      selectedPaymentMethod: selection
        ? { code: selection.code, vendor: selection.vendor }
        : null,
    });
    void emitCheckoutEvent('method/payment-selected', {
      code: selection?.code ?? null,
    });

    if (selection) {
      // The logic for provider activation/deactivation is now handled by the section controller
    } else {
      // The logic for provider deactivation is now handled by the section controller
    }
  },

  // Invalidation
  invalidateShippingProvidersByGroup: (groupId) => {
    // The logic for provider invalidation is now handled by the section controller
    // Reset the section for the group
    get().resetSection(`delivery:${groupId}` as DeliverySectionId);
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
    void emitCheckoutEvent('submit/requested', {});

    const state = get();
    const missing = computeMissingRequiredSections(state);
    if (missing.length > 0) {
      void emitCheckoutEvent('submit/blocked', { missing });
      return;
    }

    // Build payload
    const deliveries: Array<{
      groupId: DeliveryGroupId;
      methodCode: string;
      data: unknown;
    }> = [];
    for (const [groupId, selection] of Object.entries(
      state.selectedDeliveryMethodByGroup
    )) {
      if (!selection) continue;
      const methodCode = selection.code;
      // The logic for provider data retrieval is now handled by the section controller
      // We just need to ensure the selection is valid
      if (selection) {
        deliveries.push({ groupId, methodCode, data: null }); // Placeholder for data
      }
    }

    const payload = {
      contact: state.sections.contact?.data,
      recipient: state.sections.recipient?.data,
      address: state.sections.address?.data,
      deliveries: deliveries.length > 0 ? deliveries : undefined,
      payment: state.selectedPaymentMethod
        ? {
            methodCode: state.selectedPaymentMethod.code,
            data: null, // Placeholder for data
          }
        : undefined,
      promo: state.sections.promo?.data,
      comment: state.sections.comment?.data as string | undefined,
    } as const;

    void emitCheckoutEvent('submit/ready', { payload });
  },
}));
