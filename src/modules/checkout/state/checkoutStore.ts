/**
 * Checkout Zustand store.
 * Holds aggregate validation state and method selections for Checkout module.
 * Emits typed events via checkoutBus on important state transitions.
 */
import { create } from 'zustand';
import { emitCheckoutEvent } from '@src/modules/checkout/state/checkoutBus';
import type { SectionDtoFor, StaticSectionKey } from '@src/modules/checkout/state/checkoutBus';
import type { SectionDtoMap, ShippingSectionDto } from '@src/modules/checkout/core/contracts/dto';

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
 * Dynamic shipping section key bound to a specific delivery group.
 */
export type ShippingSectionId = `shipping:${DeliveryGroupId}`;

/**
 * Union of all section keys.
 */
export type SectionKey = SectionId | ShippingSectionId;

/**
 * Provider type domain: shipping or payment.
 */
export type ProviderType = 'shipping' | 'payment';

/**
 * Provider identifiers:
 * - Shipping provider is coupled with a delivery group: `shipping:${vendor}@${groupId}`
 * - Payment provider is global: `payment:${vendor}`
 */
export type ShippingProviderId = `shipping:${string}@${DeliveryGroupId}`;
export type PaymentProviderId = `payment:${string}`;
export type ProviderId = ShippingProviderId | PaymentProviderId;

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
 * Provider aggregate entry held in the store.
 */
export interface ProviderEntry {
  data: unknown | null;
  status: ValidationStatus;
  errors?: Record<string, string>;
  type: ProviderType;
  active: boolean;
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
  providers: Partial<Record<ProviderId, ProviderEntry>>;
  selectedShippingMethodByGroup: Partial<
    Record<DeliveryGroupId, SelectedMethod | null>
  >;
  selectedPaymentMethod: SelectedMethod | null;

  // Section actions
  registerSection: (id: SectionKey, required: boolean) => void;
  unregisterSection: (id: SectionKey) => void;
  sectionValid: <K extends SectionKey>(id: K, dto: SectionDtoFor<K>) => void;
  sectionInvalid: <K extends SectionKey>(id: K, dto?: SectionDtoFor<K>, errors?: Record<string, string>) => void;
  resetSection: (id: SectionKey) => void;
  setSectionBusy: (id: SectionKey, busy: boolean) => void;

  // Provider actions
  registerProvider: (id: ProviderId, type: ProviderType) => void;
  unregisterProvider: (id: ProviderId) => void;
  activateProvider: (id: ProviderId) => void;
  deactivateProvider: (id: ProviderId) => void;
  providerValid: (id: ProviderId, data: unknown) => void;
  providerInvalid: (id: ProviderId, errors?: Record<string, string>) => void;
  resetProvider: (id: ProviderId) => void;
  setProviderBusy: (id: ProviderId, busy: boolean) => void;

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

  // Submission
  requestSubmit: () => void;
}

/**
 * Extract groupId from a dynamic shipping section key.
 */
function getGroupIdFromShippingSection(
  sectionKey: ShippingSectionId
): DeliveryGroupId {
  return sectionKey.slice('shipping:'.length);
}

/**
 * Extract groupId from a shipping provider id.
 */
function getGroupIdFromShippingProvider(
  providerId: ShippingProviderId
): DeliveryGroupId {
  const atIndex = providerId.lastIndexOf('@');
  return providerId.slice(atIndex + 1);
}

/**
 * Determine provider type by its id.
 */
function getProviderTypeById(providerId: ProviderId): ProviderType {
  return providerId.startsWith('shipping:') ? 'shipping' : 'payment';
}

/**
 * Build a shipping provider id for a given vendor and group id.
 */
function makeShippingProviderId(
  vendorCode: string,
  groupId: DeliveryGroupId
): ShippingProviderId {
  return `shipping:${vendorCode}@${groupId}`;
}

/**
 * Build a payment provider id for a given vendor code.
 */
function makePaymentProviderId(vendorCode: string): PaymentProviderId {
  return `payment:${vendorCode}`;
}

/**
 * Determine if a section is valid in the current state.
 * Shipping/payment sections are validated against selected method and active provider status.
 */
export function isSectionValid(
  state: CheckoutState,
  sectionKey: SectionKey
): boolean {
  const entry = state.sections[sectionKey];
  if (!entry) return false;

  const isShippingSection = sectionKey.startsWith('shipping:');
  if (isShippingSection) {
    const groupId = getGroupIdFromShippingSection(
      sectionKey as ShippingSectionId
    );
    const selection = state.selectedShippingMethodByGroup[groupId] ?? null;
    if (!selection?.code) return false;
    const providerId = makeShippingProviderId(selection.vendor, groupId);
    const provider = state.providers[providerId];
    return Boolean(provider && provider.active && provider.status === 'valid');
  }

  if (sectionKey === 'payment') {
    const sel = state.selectedPaymentMethod;
    if (!sel?.code) return false;
    const providerId = makePaymentProviderId(sel.vendor);
    const provider = state.providers[providerId];
    return Boolean(provider && provider.active && provider.status === 'valid');
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
  return computeMissingRequiredSections(state).length === 0;
}

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  sections: {},
  providers: {},
  selectedShippingMethodByGroup: {},
  selectedPaymentMethod: null,

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
    if ((id as string).startsWith('shipping:')) {
      void emitCheckoutEvent('section/valid', { sectionId: id as ShippingSectionId, dto: dto as ShippingSectionDto });
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
    if ((id as string).startsWith('shipping:')) {
      void emitCheckoutEvent('section/invalid', { sectionId: id as ShippingSectionId, dto: dto as ShippingSectionDto, errors });
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

  // Providers
  registerProvider: (id, type) => {
    set((state) => ({
      providers: {
        ...state.providers,
        [id]: { data: null, status: 'idle', type, active: false, busy: false },
      },
    }));
    void emitCheckoutEvent('provider/registered', {
      providerId: id,
      providerType: type,
    });
  },
  unregisterProvider: (id) => {
    set((state) => {
      const rest = { ...state.providers } as Record<
        ProviderId,
        ProviderEntry | undefined
      >;
      delete rest[id as ProviderId];
      return { providers: rest as Partial<Record<ProviderId, ProviderEntry>> };
    });
    void emitCheckoutEvent('provider/unregistered', { providerId: id });
  },
  activateProvider: (id) => {
    const type = getProviderTypeById(id);
    set((state) => {
      const nextProviders: Partial<Record<ProviderId, ProviderEntry>> = {
        ...state.providers,
      };

      if (type === 'shipping') {
        const groupId = getGroupIdFromShippingProvider(
          id as ShippingProviderId
        );
        for (const [pid, entry] of Object.entries(nextProviders)) {
          if (!entry) continue;
          if (pid.startsWith('shipping:')) {
            const sameGroup =
              getGroupIdFromShippingProvider(pid as ShippingProviderId) ===
              groupId;
            if (sameGroup) {
              if (pid === id) {
                nextProviders[pid as ProviderId] = { ...entry, active: true };
              } else if (entry.active) {
                nextProviders[pid as ProviderId] = {
                  ...entry,
                  active: false,
                  status: 'idle',
                  data: null,
                  errors: undefined,
                  busy: false,
                };
                void emitCheckoutEvent('provider/deactivated', {
                  providerId: pid as ProviderId,
                });
              } else {
                nextProviders[pid as ProviderId] = { ...entry, active: false };
              }
            }
          }
        }
      } else {
        for (const [pid, entry] of Object.entries(nextProviders)) {
          if (!entry) continue;
          if (!pid.startsWith('shipping:')) {
            if (pid === id) {
              nextProviders[pid as ProviderId] = { ...entry, active: true };
            } else if (entry.active) {
              nextProviders[pid as ProviderId] = {
                ...entry,
                active: false,
                status: 'idle',
                data: null,
                errors: undefined,
                busy: false,
              };
              void emitCheckoutEvent('provider/deactivated', {
                providerId: pid as ProviderId,
              });
            } else {
              nextProviders[pid as ProviderId] = { ...entry, active: false };
            }
          }
        }
      }

      return { providers: nextProviders };
    });
    void emitCheckoutEvent('provider/activated', { providerId: id });
  },
  deactivateProvider: (id) => {
    set((state) => ({
      providers: {
        ...state.providers,
        [id]: {
          ...(state.providers[id] as ProviderEntry | undefined),
          active: false,
          status: 'idle',
          data: null,
          errors: undefined,
          type: (state.providers[id]?.type ??
            getProviderTypeById(id)) as ProviderType,
          busy: false,
        },
      },
    }));
    void emitCheckoutEvent('provider/deactivated', { providerId: id });
  },
  providerValid: (id, data) => {
    set((state) => ({
      providers: {
        ...state.providers,
        [id]: {
          ...(state.providers[id] as ProviderEntry | undefined),
          data,
          status: 'valid',
          type: (state.providers[id]?.type ??
            getProviderTypeById(id)) as ProviderType,
          active: state.providers[id]?.active ?? false,
          busy: state.providers[id]?.busy ?? false,
        },
      },
    }));
    void emitCheckoutEvent('provider/valid', { providerId: id, data });
  },
  providerInvalid: (id, errors) => {
    set((state) => ({
      providers: {
        ...state.providers,
        [id]: {
          ...(state.providers[id] as ProviderEntry | undefined),
          status: 'invalid',
          errors,
          type: (state.providers[id]?.type ??
            getProviderTypeById(id)) as ProviderType,
          active: state.providers[id]?.active ?? false,
          data: state.providers[id]?.data ?? null,
          busy: state.providers[id]?.busy ?? false,
        },
      },
    }));
    void emitCheckoutEvent('provider/invalid', { providerId: id, errors });
  },
  resetProvider: (id) => {
    set((state) => ({
      providers: {
        ...state.providers,
        [id]: {
          ...(state.providers[id] as ProviderEntry | undefined),
          status: 'idle',
          data: null,
          errors: undefined,
          type: (state.providers[id]?.type ??
            getProviderTypeById(id)) as ProviderType,
          active: state.providers[id]?.active ?? false,
          busy: false,
        },
      },
    }));
  },
  setProviderBusy: (id, busy) => {
    set((state) => ({
      providers: {
        ...state.providers,
        [id]: {
          ...(state.providers[id] as ProviderEntry | undefined),
          busy,
          type: (state.providers[id]?.type ??
            getProviderTypeById(id)) as ProviderType,
          active: state.providers[id]?.active ?? false,
          data: state.providers[id]?.data ?? null,
          status: state.providers[id]?.status ?? 'idle',
        },
      },
    }));
  },

  // Method selection
  selectShippingMethod: (groupId, selection) => {
    set((state) => ({
      selectedShippingMethodByGroup: {
        ...state.selectedShippingMethodByGroup,
        [groupId]: selection
          ? { code: selection.code, vendor: selection.vendor }
          : null,
      },
    }));
    void emitCheckoutEvent('method/shipping-selected', {
      groupId,
      code: selection?.code ?? null,
    });

    // Activate the selected provider within the group; deactivate others in the same group
    if (selection) {
      const providerId = makeShippingProviderId(selection.vendor, groupId);
      // Ensure provider exists with correct type if not registered
      if (!get().providers[providerId]) {
        get().registerProvider(providerId, 'shipping');
      }
      get().activateProvider(providerId);
    } else {
      // Deactivate all providers in the group
      const providers = get().providers;
      for (const pid of Object.keys(providers)) {
        if (
          pid.startsWith('shipping:') &&
          getGroupIdFromShippingProvider(pid as ShippingProviderId) === groupId
        ) {
          get().deactivateProvider(pid as ProviderId);
        }
      }
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
      const providerId = makePaymentProviderId(selection.vendor);
      if (!get().providers[providerId]) {
        get().registerProvider(providerId, 'payment');
      }
      get().activateProvider(providerId);
    } else {
      const providers = get().providers;
      for (const pid of Object.keys(providers)) {
        if (!pid.startsWith('shipping:')) {
          get().deactivateProvider(pid as ProviderId);
        }
      }
    }
  },

  // Invalidation
  invalidateShippingProvidersByGroup: (groupId) => {
    set((state) => {
      const nextProviders: Partial<Record<ProviderId, ProviderEntry>> = {
        ...state.providers,
      };
      for (const [pid, entry] of Object.entries(nextProviders)) {
        if (!entry) continue;
        if (
          pid.startsWith('shipping:') &&
          getGroupIdFromShippingProvider(pid as ShippingProviderId) === groupId
        ) {
          nextProviders[pid as ProviderId] = {
            ...entry,
            status: 'idle',
            data: null,
            errors: undefined,
          };
        }
      }
      return { providers: nextProviders };
    });
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
      state.selectedShippingMethodByGroup
    )) {
      if (!selection) continue;
      const methodCode = selection.code;
      const providerId = makeShippingProviderId(selection.vendor, groupId);
      const provider = state.providers[providerId];
      if (provider)
        deliveries.push({ groupId, methodCode, data: provider.data });
    }

    const payload = {
      contact: state.sections.contact?.data,
      recipient: state.sections.recipient?.data,
      address: state.sections.address?.data,
      deliveries: deliveries.length > 0 ? deliveries : undefined,
      payment: state.selectedPaymentMethod
        ? {
            methodCode: state.selectedPaymentMethod.code,
            data: state.providers[
              makePaymentProviderId(state.selectedPaymentMethod.vendor)
            ]?.data,
          }
        : undefined,
      promo: state.sections.promo?.data,
      comment: state.sections.comment?.data as string | undefined,
    } as const;

    void emitCheckoutEvent('submit/ready', { payload });
  },
}));
