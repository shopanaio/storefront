import { create } from 'zustand';
import type { DeliveryAddress } from './types';

/** Customer input of one delivery option with the display state of its module. */
export interface StoredCustomerInput {
  input: unknown;
  view?: unknown;
  /** The API accepted exactly this input; false while it is still to be saved. */
  synced: boolean;
}

export type CustomerInputsByHandle = Record<string, StoredCustomerInput>;

interface StoredGroupInputs {
  /** Address the inputs were entered for; see `addressScope`. */
  scope: string;
  inputs: CustomerInputsByHandle;
}

const STORAGE_PREFIX = 'checkout-delivery-customer-input';

const storageKey = (deliveryGroupId: string) =>
  `${STORAGE_PREFIX}:${deliveryGroupId}`;

const EMPTY: CustomerInputsByHandle = {};

/**
 * Identity of the address the customer input belongs to: country, city and carrier
 * hints. A branch or a street picked for one settlement means nothing for another, so
 * inputs stored for a different scope are dropped.
 */
export const addressScope = (address: DeliveryAddress | null): string =>
  address
    ? JSON.stringify([address.countryCode, address.city, address.data ?? null])
    : '';

const parse = (value: string | null): StoredGroupInputs | null => {
  try {
    return value ? (JSON.parse(value) as StoredGroupInputs) : null;
  } catch {
    return null;
  }
};

/**
 * Inputs are kept in localStorage, shared by the tabs of the browser: the selection on the
 * server is shared by them as well. Inputs of an earlier version live in sessionStorage
 * and are still read.
 */
function load(deliveryGroupId: string): StoredGroupInputs | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const key = storageKey(deliveryGroupId);
    return parse(
      window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key)
    );
  } catch {
    return null;
  }
}

function persist(deliveryGroupId: string, stored: StoredGroupInputs) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(storageKey(deliveryGroupId), JSON.stringify(stored));
  } catch {
    // Storage can be unavailable or full; the in-memory store still works.
  }
}

/** Groups read from localStorage, so repeated reads return the same object. */
const loaded = new Map<string, StoredGroupInputs | null>();

interface CustomerInputStore {
  /** Inputs by delivery group; filled from localStorage on first read. */
  groups: Record<string, StoredGroupInputs | null>;
  /** Stores (or with `undefined` removes) the input of an option for the given address. */
  remember: (
    deliveryGroupId: string,
    scope: string,
    handle: string,
    stored: StoredCustomerInput | undefined
  ) => void;
  /** Marks the stored input as saved, unless it changed since `input` was sent. */
  markSynced: (
    deliveryGroupId: string,
    scope: string,
    handle: string,
    input: unknown
  ) => void;
}

const sameInput = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Customer input entered in the delivery section. The API does not return it, so it is
 * kept here (and in localStorage) for the form and for the section validation.
 */
export const useCustomerInputStore = create<CustomerInputStore>((set, get) => ({
  groups: {},
  remember: (deliveryGroupId, scope, handle, stored) => {
    const inputs = { ...readCustomerInputs(deliveryGroupId, scope) };
    if (stored === undefined) {
      delete inputs[handle];
    } else {
      inputs[handle] = stored;
    }
    const next: StoredGroupInputs = { scope, inputs };
    persist(deliveryGroupId, next);
    loaded.set(deliveryGroupId, next);
    set({ groups: { ...get().groups, [deliveryGroupId]: next } });
  },
  markSynced: (deliveryGroupId, scope, handle, input) => {
    const stored = readCustomerInputs(deliveryGroupId, scope)[handle];
    if (stored && !stored.synced && sameInput(stored.input, input)) {
      get().remember(deliveryGroupId, scope, handle, { ...stored, synced: true });
    }
  },
}));

function groupOf(
  groups: CustomerInputStore['groups'],
  deliveryGroupId: string
): StoredGroupInputs | null {
  if (deliveryGroupId in groups) {
    return groups[deliveryGroupId];
  }
  if (!loaded.has(deliveryGroupId)) {
    loaded.set(deliveryGroupId, load(deliveryGroupId));
  }
  return loaded.get(deliveryGroupId) ?? null;
}

/** Inputs of a group entered for the given address scope. */
export function readCustomerInputs(
  deliveryGroupId: string | undefined,
  scope: string,
  groups: CustomerInputStore['groups'] = useCustomerInputStore.getState().groups
): CustomerInputsByHandle {
  if (!deliveryGroupId) {
    return EMPTY;
  }
  const stored = groupOf(groups, deliveryGroupId);
  return stored?.scope === scope ? stored.inputs : EMPTY;
}

/**
 * Another tab saved an input: this tab follows it, so it never shows a branch as saved
 * while the order would go with the one picked in the other tab.
 */
function followOtherTabs(event: StorageEvent) {
  const prefix = `${STORAGE_PREFIX}:`;
  if (!event.key?.startsWith(prefix)) {
    return;
  }
  const deliveryGroupId = event.key.slice(prefix.length);
  const next = parse(event.newValue);
  loaded.set(deliveryGroupId, next);
  useCustomerInputStore.setState((state) => ({
    groups: { ...state.groups, [deliveryGroupId]: next },
  }));
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', followOtherTabs);
}
