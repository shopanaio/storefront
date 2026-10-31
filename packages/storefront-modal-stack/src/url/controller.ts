import { modalStackRegistry } from '../registry/modal-registry';
import { useModalStackStore } from '../store/modals';
import {
  encodeModalEntries,
  readModalProjection,
  projectModalStack,
  reconcileModalStack,
  restoreModalEntries,
  withModalProjection,
} from './projection';
import type { IModalStackItem } from '../types';

interface ModalUrlLocation {
  read: () => URL;
  replace: (url: URL) => void;
  confirmLeave: () => Promise<boolean>;
}

/**
 * Other URL writers (page config, agent) call replaceState with Next's history state, which
 * bypasses router sync and never reaches syncLocation. Only the route and the modal projection
 * identify a modal navigation; percent-encoding differences of the projection are irrelevant.
 */
function modalLocationKey(url: URL): string {
  return `${url.pathname}?${new URLSearchParams(readModalProjection(url) ?? '').toString()}`;
}

/** Uses replace, so modal projection does not add entries to browser history. */
export function connectModalStackUrl(location: ModalUrlLocation) {
  let applying = false;
  let initialized = false;
  let disposed = false;
  let revision = 0;
  let lastLocation = '';

  const write = () => {
    const url = location.read();
    const raw = encodeModalEntries(
      projectModalStack(useModalStackStore.getState().items)
    );
    if (readModalProjection(url) === raw) {
      lastLocation = modalLocationKey(url);
      return;
    }
    const next = withModalProjection(url, raw);
    lastLocation = modalLocationKey(next);
    location.replace(next);
  };

  const apply = (items: IModalStackItem[], pathname: string) => {
    const retained = new Set(items.map((item) => item.uuid));
    const removed = useModalStackStore
      .getState()
      .items.filter((item) => !retained.has(item.uuid));
    applying = true;
    try {
      useModalStackStore.setState({ items, urlScope: pathname });
      removed.forEach((item) => item.onRemoved?.('closed'));
    } finally {
      applying = false;
    }
    write();
  };

  const syncLocation = async () => {
    if (disposed || !modalStackRegistry.isReady()) {
      return;
    }
    const url = location.read();
    if (initialized && modalLocationKey(url) === lastLocation) {
      return;
    }
    const request = ++revision;
    const state = useModalStackStore.getState();
    const scopeChanged =
      state.urlScope !== null && state.urlScope !== url.pathname;
    let restored: IModalStackItem[];
    try {
      restored = restoreModalEntries(readModalProjection(url));
      // Validate round-tripping before changing runtime state.
      projectModalStack(restored);
    } catch (error) {
      console.warn('[ModalStack] Invalid URL projection', error);
      restored = [];
    }
    const next = scopeChanged
      ? restored
      : reconcileModalStack(state.items, restored);
    const retained = new Set(next.map((item) => item.uuid));
    const removed = state.items.filter((item) => !retained.has(item.uuid));
    initialized = true;
    lastLocation = modalLocationKey(url);

    // A completed route change must not carry entities from the previous store/page.
    // Within the same route, URL navigation obeys the modal close guards.
    if (
      !scopeChanged &&
      removed.some((item) => item.isSaving || item.isDirty)
    ) {
      write();
      if (removed.some((item) => item.isSaving)) {
        return;
      }
      const expectedLocation = modalLocationKey(location.read());
      const approved = await location.confirmLeave();
      if (
        !approved ||
        disposed ||
        request !== revision ||
        modalLocationKey(location.read()) !== expectedLocation
      ) {
        return;
      }
      // Any intervening stack edit invalidates the requested transition.
      if (useModalStackStore.getState().items !== state.items) {
        return;
      }
    }
    apply(next, url.pathname);
  };

  const unsubscribeStore = useModalStackStore.subscribe((state, previous) => {
    if (applying || !initialized || state.items === previous.items) {
      return;
    }
    revision++;
    // Navigation takes precedence over a stale component's update.
    if (modalLocationKey(location.read()) !== lastLocation) {
      return;
    }
    write();
  });
  const unsubscribeRegistry = modalStackRegistry.subscribe(() => {
    void syncLocation();
  });
  void syncLocation();

  return {
    syncLocation,
    dispose: () => {
      disposed = true;
      revision++;
      unsubscribeStore();
      unsubscribeRegistry();
    },
  };
}
