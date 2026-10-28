import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { historyGateScript } from './historyGate';
import {
  getStorefrontHistory,
  subscribeStorefrontHistory,
  type StorefrontHistoryUpdate,
} from './storefrontHistory';

/** What Next's app router does at hydration: its own pushState/replaceState, a popstate listener. */
const frameworkPatch = vi.fn();
const frameworkPopState = vi.fn();

/** TanStack history writes in a microtask, jsdom traverses in a task. */
const settled = () => new Promise((resolve) => setTimeout(resolve, 20));

const path = () =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`;

describe('storefront history', () => {
  const updates: StorefrontHistoryUpdate[] = [];
  let stopListening = () => {};

  beforeAll(() => {
    window.history.replaceState(null, '', '/uk');
    // The gate script, in the document before any framework code.
    new Function(historyGateScript)();
    window.history.pushState = frameworkPatch;
    window.history.replaceState = frameworkPatch;
    window.addEventListener('popstate', frameworkPopState);
  });

  afterAll(() => stopListening());

  afterEach(() => {
    updates.length = 0;
    frameworkPatch.mockClear();
    frameworkPopState.mockClear();
  });

  it('keeps the framework router’s patch off the history', () => {
    expect(window.history.pushState).not.toBe(frameworkPatch);
    window.history.pushState({ __NA: true }, '', '/uk/early');
    expect(frameworkPatch).not.toHaveBeenCalled();
    // No storefront history yet: the write is dropped.
    expect(path()).toBe('/uk');
  });

  it('takes the history over on first use', () => {
    const history = getStorefrontHistory();
    expect(history?.location.href).toBe('/uk');
    expect(window.history.state.__TSR_index).toBe(0);
    stopListening = subscribeStorefrontHistory((update) => updates.push(update));
  });

  it('pushes entries with state, key and index', async () => {
    getStorefrontHistory()?.push('/uk/products/a', { screen: 1 });
    await settled();
    expect(path()).toBe('/uk/products/a');
    expect(window.history.state).toMatchObject({ screen: 1, __TSR_index: 1 });
    expect(updates).toMatchObject([{ action: { type: 'PUSH' }, fromOutside: false }]);
  });

  it('drops a framework write to the address it shows', async () => {
    const length = window.history.length;
    window.history.pushState({ __NA: true }, '', '/uk/products/a');
    window.history.replaceState({ __NA: true }, '', '/uk/products/a');
    await settled();
    expect(window.history.length).toBe(length);
    expect(updates).toEqual([]);
  });

  it('mirrors a framework move to another address, marked as not its own', async () => {
    window.history.pushState({ __NA: true }, '', '/uk/products/b');
    await settled();
    expect(path()).toBe('/uk/products/b');
    expect(window.history.state.__NA).toBeUndefined();
    expect(updates).toMatchObject([{ action: { type: 'PUSH' }, fromOutside: true }]);
  });

  it('drops the framework router writing its own last address over the app’s entry', async () => {
    getStorefrontHistory()?.push('/uk/products/c', { screen: 2 });
    await settled();
    window.history.replaceState({ __NA: true }, '', '/uk/products/b');
    await settled();
    expect(path()).toBe('/uk/products/c');
    getStorefrontHistory()?.back();
    await settled();
    updates.length = 0;
  });

  it('keeps the app’s state of an entry an outside writer replaces', async () => {
    window.history.replaceState({ analytics: true }, '', '/uk/products/b?utm=1');
    await settled();
    expect(path()).toBe('/uk/products/b?utm=1');
    expect(window.history.state).toMatchObject({ screen: 1, __TSR_index: 2 });
  });

  it('carries no scroll option of a move into an entry an outside writer makes from it', async () => {
    getStorefrontHistory()?.replace('/uk/products/b?utm=1', { screen: 1, scroll: false });
    await settled();
    window.history.replaceState({ analytics: true }, '', '/uk/products/b?utm=2');
    await settled();
    expect(window.history.state.scroll).toBeUndefined();
    expect(window.history.state).toMatchObject({ screen: 1 });
    window.history.replaceState({ analytics: true }, '', '/uk/products/b?utm=1');
    await settled();
    updates.length = 0;
  });

  it('hears back/forward, and the framework router never does', async () => {
    getStorefrontHistory()?.back();
    await settled();
    expect(path()).toBe('/uk/products/a');
    expect(frameworkPopState).not.toHaveBeenCalled();
    expect(updates).toMatchObject([
      { action: { type: 'BACK' }, location: { href: '/uk/products/a' } },
    ]);

    getStorefrontHistory()?.forward();
    await settled();
    expect(path()).toBe('/uk/products/b?utm=1');
    expect(frameworkPopState).not.toHaveBeenCalled();
  });

  it('counts a jump to an anchor as the next entry of the same page', async () => {
    const from = getStorefrontHistory()!.location;
    // What the browser does on `<a href="#reviews">`: its own entry, no state, then popstate.
    History.prototype.pushState.call(window.history, null, '', '#reviews');
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    await settled();
    expect(window.history.state).toMatchObject({
      screen: 1,
      __TSR_index: from.state.__TSR_index + 1,
    });
    expect(updates).toMatchObject([
      { action: { type: 'FORWARD' }, location: { hash: '#reviews' } },
    ]);
    expect(frameworkPopState).not.toHaveBeenCalled();
  });
});
