import { moduleRegistry } from '@shopana/storefront-sdk/registry';
import type { ProviderModuleType } from '#checkout/vendors/types';
import { logError } from '@shopana/storefront-sdk/utils/logger';

/**
 * Loads the checkout renders with React `use`: the code of vendor modules and their messages.
 * Each is loaded once for the app and read by every component that needs it, so what was
 * loaded before renders at once, also after a remount.
 *
 * A failed load stays failed for RETRY_AFTER_MS, so the components reading it show the failure
 * instead of loading again on every render; then, or on `retryFailedLoads` (the "Retry" of
 * `LoadingBoundary`), the next read loads again.
 */
const RETRY_AFTER_MS = 10_000;

/**
 * A load as React `use` reads it. The status fields follow the protocol React itself uses for
 * thenables (an internal of React): with them a settled load is read without suspending.
 */
export type Load<T> = Promise<T> & {
  status?: 'pending' | 'fulfilled' | 'rejected';
  value?: T;
  reason?: unknown;
  failedAt?: number;
};

/** Failure of a load, told apart from other errors by `LoadingBoundary`. */
export class LoadError extends Error {
  constructor(what: string, options: { cause: unknown }) {
    super(`Failed to load ${what}`, options);
    this.name = 'LoadError';
  }
}

function track<T>(promise: Promise<T>): Load<T> {
  const load = promise as Load<T>;
  load.status = 'pending';
  promise.then(
    (value) => {
      load.status = 'fulfilled';
      load.value = value;
    },
    (reason) => {
      load.status = 'rejected';
      load.reason = reason;
      load.failedAt = Date.now();
    }
  );
  return load;
}

/** Starts a load whose failure is a `LoadError`, reported once. */
function start<T>(what: string, run: () => T | Promise<T>): Load<T> {
  return track(
    Promise.resolve()
      .then(run)
      .catch((error: unknown) => {
        logError(`Failed to load ${what}`, { error, component: 'loadCache' });
        throw new LoadError(what, { cause: error });
      })
  );
}

const expired = (load: Load<unknown>) =>
  load.status === 'rejected' &&
  Date.now() - (load.failedAt ?? 0) >= RETRY_AFTER_MS;

/** Modules by the loader of their registration: a module registered again loads again. */
let modules = new WeakMap<object, Load<unknown>>();
/** Messages by their loader and locale. */
let messages = new WeakMap<
  object,
  Map<string, Load<Record<string, unknown>>>
>();
/** Every load started, for `retryFailedLoads`. */
let started = new Set<() => void>();

/** Whether a module is registered under `type`/`slug`; nothing is loaded. */
export const hasModule = (type: ProviderModuleType, slug: string) =>
  Boolean(moduleRegistry.resolve(type, slug));

/**
 * Loads the module registered under `type`/`slug`. `null` when nothing is registered there;
 * the load fails with a `LoadError` when the module could not be loaded.
 */
export function loadModule<T>(
  type: ProviderModuleType,
  slug: string
): Load<T> | null {
  const loader = moduleRegistry.resolve<T>(type, slug);
  if (!loader) {
    return null;
  }
  let load = modules.get(loader);
  if (!load || expired(load)) {
    load = start(`the ${type} module "${slug}"`, () => loader());
    modules.set(loader, load);
    const evict = () => {
      if (modules.get(loader)?.status === 'rejected') modules.delete(loader);
    };
    started.add(evict);
  }
  return load as Load<T>;
}

/** Loads messages of a module for the locale; a failure is a `LoadError`. */
export function loadMessages(
  scope: string,
  locale: string,
  load: (locale: string) => Promise<Record<string, unknown>>
): Load<Record<string, unknown>> {
  let byLocale = messages.get(load);
  if (!byLocale) {
    byLocale = new Map();
    messages.set(load, byLocale);
  }
  let loaded = byLocale.get(locale);
  if (!loaded || expired(loaded)) {
    loaded = start(`the "${scope}" messages`, () => load(locale));
    byLocale.set(locale, loaded);
    const entries = byLocale;
    started.add(() => {
      if (entries.get(locale)?.status === 'rejected') entries.delete(locale);
    });
  }
  return loaded;
}

/** Forgets every failed load, so the next read loads again. */
export function retryFailedLoads() {
  started.forEach((evict) => evict());
}

/** Forgets every load (tests). */
export function resetLoads() {
  modules = new WeakMap();
  messages = new WeakMap();
  started = new Set();
}
