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
  /** When the inputs were last saved (ms), for dropping abandoned ones. */
  savedAt?: number;
}

const STORAGE_PREFIX = 'checkout-delivery-customer-input';

const storageKey = (deliveryGroupId: string) =>
  `${STORAGE_PREFIX}:${deliveryGroupId}`;

const EMPTY: CustomerInputsByHandle = {};

/** Inputs nobody touched for this long belong to an abandoned checkout. */
const ABANDONED_AFTER_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Groups this tab has shown or saved inputs for. Only these are dropped once they are gone:
 * a group this tab never saw may belong to a newer state of the checkout in another tab.
 */
const known = new Set<string>();

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
    const next: StoredGroupInputs = { scope, inputs, savedAt: Date.now() };
    known.add(deliveryGroupId);
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
 * Drops the inputs of groups the checkout no longer has. A group id is a hash of the group,
 * so a new split of the lines leaves the inputs of the old groups behind. Only groups this
 * tab knew are dropped, so a tab with an older state of the checkout never removes the
 * inputs of groups another tab already works with; inputs abandoned long ago go as well.
 */
export function pruneCustomerInputs(deliveryGroupIds: readonly string[]) {
  const ids = new Set(deliveryGroupIds);
  const gone = new Set([...known].filter((id) => !ids.has(id)));
  if (typeof window !== 'undefined') {
    const prefix = `${STORAGE_PREFIX}:`;
    const now = Date.now();
    for (const name of ['localStorage', 'sessionStorage'] as const) {
      try {
        const storage = window[name];
        const stale: string[] = [];
        for (let index = 0; index < storage.length; index += 1) {
          const key = storage.key(index);
          if (!key?.startsWith(prefix)) {
            continue;
          }
          const id = key.slice(prefix.length);
          if (ids.has(id)) {
            continue;
          }
          const savedAt = parse(storage.getItem(key))?.savedAt;
          if (gone.has(id) || savedAt === undefined || now - savedAt > ABANDONED_AFTER_MS) {
            stale.push(key);
          }
        }
        stale.forEach((key) => storage.removeItem(key));
      } catch {
        // Storage can be unavailable; nothing to clean then.
      }
    }
  }
  for (const id of gone) {
    known.delete(id);
    loaded.delete(id);
  }
  ids.forEach((id) => known.add(id));
  const { groups } = useCustomerInputStore.getState();
  if (Object.keys(groups).some((id) => gone.has(id))) {
    useCustomerInputStore.setState({
      groups: Object.fromEntries(Object.entries(groups).filter(([id]) => !gone.has(id))),
    });
  }
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
