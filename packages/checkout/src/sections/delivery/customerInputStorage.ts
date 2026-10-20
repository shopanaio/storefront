import { create } from 'zustand';
import type { DeliveryAddress, DeliveryMethod } from './types';
import { methodKey } from './shipments';

/** Customer input of one delivery option with the display state of its module. */
export interface StoredCustomerInput {
  input: unknown;
  view?: unknown;
  /** The API accepted exactly this input; false while it is still to be saved. */
  synced: boolean;
}

/**
 * Inputs of a group by method (`methodKey`: carrier and service code). The option handle is
 * not used: it changes with every new quote of the same method (BR-5rgw).
 */
export type CustomerInputsByMethod = Record<string, StoredCustomerInput>;

/** The method an input belongs to. */
export type InputMethod = Pick<DeliveryMethod, 'provider' | 'code'>;

/** Stored input of `method` among the inputs of a group. */
export const storedInputOf = (
  inputs: CustomerInputsByMethod,
  method: InputMethod
): StoredCustomerInput | undefined => inputs[methodKey(method)];

interface StoredGroupInputs {
  /** Address the inputs were entered for; see `addressScope`. */
  scope: string;
  inputs: CustomerInputsByMethod;
  /** When the inputs were last saved (ms), for dropping abandoned ones. */
  savedAt?: number;
}

const STORAGE_PREFIX = 'checkout-delivery-customer-input';

const storageKey = (deliveryGroupId: string) =>
  `${STORAGE_PREFIX}:${deliveryGroupId}`;

const EMPTY: CustomerInputsByMethod = {};

/**
 * Inputs nobody touched for this long belong to an abandoned checkout. They hold
 * personal data (addresses, branches), so they are not kept longer than a checkout lives.
 */
const ABANDONED_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

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
 * server is shared by them as well. They are removed once the order is accepted
 * (`clearCustomerInputs`) or abandoned (`pruneCustomerInputs`).
 */
function load(deliveryGroupId: string): StoredGroupInputs | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return parse(window.localStorage.getItem(storageKey(deliveryGroupId)));
  } catch {
    return null;
  }
}

function persist(deliveryGroupId: string, stored: StoredGroupInputs) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(
      storageKey(deliveryGroupId),
      JSON.stringify(stored)
    );
  } catch {
    // Storage can be unavailable or full; the in-memory store still works.
  }
}

/** A delivery group as the stored inputs know it: its id and the ids it replaced. */
export interface InputGroup {
  id: string;
  replacesGroupIds?: readonly string[];
}

/** Groups read from localStorage, so repeated reads return the same object. */
const loaded = new Map<string, StoredGroupInputs | null>();

interface CustomerInputStore {
  /** Inputs by delivery group; filled from localStorage on first read. */
  groups: Record<string, StoredGroupInputs | null>;
  /** Stores (or with `undefined` removes) the input of a method for the given address. */
  remember: (
    group: InputGroup,
    scope: string,
    method: InputMethod,
    stored: StoredCustomerInput | undefined
  ) => void;
  /** Marks the stored input as saved, unless it changed since `input` was sent. */
  markSynced: (
    group: InputGroup,
    scope: string,
    method: InputMethod,
    input: unknown
  ) => void;
}

/** JSON with object keys sorted, so equal values read the same whatever their key order. */
const canonicalJson = (value: unknown): string =>
  JSON.stringify(value, (_key, item: unknown) =>
    item && typeof item === 'object' && !Array.isArray(item)
      ? Object.fromEntries(
          Object.entries(item as Record<string, unknown>).sort(([a], [b]) =>
            a < b ? -1 : a > b ? 1 : 0
          )
        )
      : item
  );

/**
 * Whether two inputs are the same value. The API returns the saved input from `jsonb`, which
 * orders the keys its own way, so the key order does not count.
 */
export const sameInput = (a: unknown, b: unknown) =>
  canonicalJson(a) === canonicalJson(b);

/**
 * Customer input entered in the delivery section, kept in localStorage as well. The checkout
 * returns the input saved for the selected method (`selection.customerInput`) and the server
 * wins once it holds another input; the stored input keeps what the buyer typed until the API
 * accepted it, the input of methods that are not selected, and the display state of the
 * module (the picked branch), which the API does not return.
 */
export const useCustomerInputStore = create<CustomerInputStore>((set, get) => ({
  groups: {},
  remember: (group, scope, method, stored) => {
    const deliveryGroupId = group.id;
    const inputs = { ...readCustomerInputs(group, scope) };
    const key = methodKey(method);
    if (stored === undefined) {
      delete inputs[key];
    } else {
      inputs[key] = stored;
    }
    const next: StoredGroupInputs = { scope, inputs, savedAt: Date.now() };
    known.add(deliveryGroupId);
    persist(deliveryGroupId, next);
    loaded.set(deliveryGroupId, next);
    set({ groups: { ...get().groups, [deliveryGroupId]: next } });
  },
  markSynced: (group, scope, method, input) => {
    const stored = storedInputOf(readCustomerInputs(group, scope), method);
    if (stored && !stored.synced && sameInput(stored.input, input)) {
      get().remember(group, scope, method, { ...stored, synced: true });
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

/**
 * Inputs of a group entered for the given address scope, by method. A group gets a new id when
 * its lines change; the inputs typed under an id it replaced still belong to it.
 */
export function readCustomerInputs(
  group: InputGroup | undefined,
  scope: string,
  groups: CustomerInputStore['groups'] = useCustomerInputStore.getState().groups
): CustomerInputsByMethod {
  if (!group) {
    return EMPTY;
  }
  for (const id of [group.id, ...(group.replacesGroupIds ?? [])]) {
    const stored = groupOf(groups, id);
    if (stored) {
      return stored.scope === scope ? stored.inputs : EMPTY;
    }
  }
  return EMPTY;
}

/**
 * Drops the inputs of groups the checkout no longer has, `deliveryGroupIds` being the ids of
 * its groups and the ids they replaced. A new split of the lines leaves the inputs of the old
 * groups behind. Only groups this
 * tab knew are dropped, so a tab with an older state of the checkout never removes the
 * inputs of groups another tab already works with; inputs abandoned long ago go as well.
 */
export function pruneCustomerInputs(deliveryGroupIds: readonly string[]) {
  const ids = new Set(deliveryGroupIds);
  const gone = new Set([...known].filter((id) => !ids.has(id)));
  if (typeof window !== 'undefined') {
    const prefix = `${STORAGE_PREFIX}:`;
    const now = Date.now();
    try {
      const storage = window.localStorage;
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
        if (
          gone.has(id) ||
          savedAt === undefined ||
          now - savedAt > ABANDONED_AFTER_MS
        ) {
          stale.push(key);
        }
      }
      stale.forEach((key) => storage.removeItem(key));
    } catch {
      // Storage can be unavailable; nothing to clean then.
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
      groups: Object.fromEntries(
        Object.entries(groups).filter(([id]) => !gone.has(id))
      ),
    });
  }
}

/**
 * Removes every stored customer input. Called once an order is accepted: the inputs
 * belong to the placed checkout and hold personal data nobody needs any more.
 */
export function clearCustomerInputs() {
  if (typeof window !== 'undefined') {
    const prefix = `${STORAGE_PREFIX}:`;
    try {
      const storage = window.localStorage;
      const keys: string[] = [];
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key?.startsWith(prefix)) {
          keys.push(key);
        }
      }
      keys.forEach((key) => storage.removeItem(key));
    } catch {
      // Storage can be unavailable; nothing to clean then.
    }
  }
  known.clear();
  loaded.clear();
  useCustomerInputStore.setState({ groups: {} });
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
