import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { modalStackRegistry } from '../registry/modal-registry';
import { useModalStackStore } from '../store/modals';
import { connectModalStackUrl } from './controller';
import {
  createModalUrlCodec,
  encodeModalEntries,
  readModalProjection,
  restoreModalEntries,
  withModalProjection,
  projectModalStack,
} from './projection';

const codec = createModalUrlCodec({
  schema: z.object({ id: z.string().min(1) }),
  project: (payload) => ({ id: String(payload.entityId ?? '') }),
  restore: ({ id }) => ({ entityId: id }),
});
const store = () => useModalStackStore.getState();
let connection: ReturnType<typeof connectModalStackUrl> | undefined;

function setup(raw: string | null = null, ready = true) {
  let url = new URL('https://admin.test/store/products?filter=active#table');
  url = withModalProjection(url, raw);
  const replace = vi.fn((next: URL) => {
    url = next;
  });
  const confirmLeave = vi.fn(async () => false);
  if (ready) {
    modalStackRegistry.markReady();
  }
  connection = connectModalStackUrl({ read: () => url, replace, confirmLeave });
  return {
    read: () => url,
    replace,
    confirmLeave,
    navigate: async (raw: string | null) => {
      url = withModalProjection(url, raw);
      await connection!.syncLocation();
    },
    /** replaceState with Next's history state: no router sync, no syncLocation. */
    externalReplace: (search: string) => {
      url = new URL(url);
      url.search = search;
    },
    changeRoute: async (path: string) => {
      url = new URL(path, url);
      await connection!.syncLocation();
    },
  };
}

beforeEach(() => {
  modalStackRegistry.clear();
  useModalStackStore.setState({ items: [], urlScope: null });
  for (const type of ['product', 'picker']) {
    modalStackRegistry.register({ type, component: () => null, url: codec });
  }
  modalStackRegistry.register({ type: 'form', component: () => null });
});

afterEach(() => {
  connection?.dispose();
  connection = undefined;
  vi.restoreAllMocks();
});

describe('modal URL projection', () => {
  it('writes flat readable qs parameters without JSON or a params wrapper', () => {
    const location = setup();
    store().push('product', { entityId: 'gid==', mode: 'view' }, { url: true });
    expect(location.read().search).toBe(
      '?filter=active&modals[0][type]=product&modals[0][id]=gid%3D%3D'
    );
  });

  it('preserves repeated types, order and encoded IDs after restoration', () => {
    const raw = encodeModalEntries([
      { type: 'product', params: { id: 'one+/==' } },
      { type: 'product', params: { id: 'two' } },
    ]);
    setup(raw);
    expect(store().items.map((item) => item.payload.entityId)).toEqual([
      'one+/==',
      'two',
    ]);
  });

  it('replaces only modal keys alongside nested page-config filters', () => {
    const original = new URL(
      'https://admin.test/products?q=hello%20world&sort=-title&sort=id&filter[status][in]=ACTIVE&modals[0][type]=product&modals[0][id]=one#table'
    );
    const next = withModalProjection(original, null);
    expect(next.href).toBe(
      'https://admin.test/products?q=hello%20world&sort=-title&sort=id&filter[status][in]=ACTIVE#table'
    );
    // usePageConfig can re-encode the brackets of unrelated keys via URLSearchParams.
    const encoded = new URL(original);
    encoded.search = encoded.searchParams.toString();
    expect(
      restoreModalEntries(readModalProjection(encoded))[0].payload.entityId
    ).toBe('one');
  });

  it('SC-mup1: selects individual instances and preserves unrelated URL state', () => {
    const location = setup();
    store().push(
      'product',
      { entityId: 'one', onSave: () => {} },
      { url: true }
    );
    store().push('product', { entityId: 'temporary' });
    store().push('form', { onSave: () => {} });
    store().push('picker', { entityId: 'two' }, { url: true });
    expect(
      projectModalStack(
        restoreModalEntries(readModalProjection(location.read()))
      )
    ).toEqual([
      { type: 'product', params: { id: 'one' } },
      { type: 'picker', params: { id: 'two' } },
    ]);
    expect(location.read().searchParams.get('filter')).toBe('active');
    expect(location.read().hash).toBe('#table');
  });

  it('SC-mup2: restores only projected instances after reload with fresh runtime state', () => {
    const location = setup();
    const original = store().push(
      'product',
      { entityId: 'one' },
      { url: true }
    );
    store().setDirty(original, true);
    store().push('form');
    store().push('picker', { entityId: 'two' }, { url: true });
    const raw = readModalProjection(location.read());
    connection!.dispose();
    useModalStackStore.setState({ items: [], urlScope: null });
    setup(raw);
    expect(store().items.map((item) => item.type)).toEqual([
      'product',
      'picker',
    ]);
    expect(store().items[0]).toMatchObject({
      payload: { entityId: 'one' },
      url: true,
      isDirty: false,
    });
    expect(store().items[0].uuid).not.toBe(original);
  });

  it('waits for complete registration without erasing the initial URL', () => {
    const raw = encodeModalEntries([
      { type: 'product', params: { id: 'one' } },
    ]);
    const location = setup(raw, false);
    expect(store().items).toEqual([]);
    expect(location.replace).not.toHaveBeenCalled();
    modalStackRegistry.markReady();
    expect(store().items[0].payload.entityId).toBe('one');
  });

  it('SC-mup3: rejects unsupported projection and invalid parameters before changing state', () => {
    setup();
    expect(() => store().push('form', {}, { url: true })).toThrow(
      'no URL codec'
    );
    expect(() => store().push('product', {}, { url: true })).toThrow();
    expect(store().items).toEqual([]);
  });

  it.each([
    'modals=broken',
    'modals[0][type]=missing',
    'modals[0][type]=product&modals[0][id][nested]=invalid',
  ])('SC-mup3: safely removes invalid URL input %s', (raw) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const location = setup(raw);
    expect(store().items).toEqual([]);
    expect(Boolean(readModalProjection(location.read()))).toBe(false);
    expect(location.read().searchParams.get('filter')).toBe('active');
  });

  it('closing an ancestor removes projected descendants and the final query parameter', () => {
    const location = setup();
    const id = store().push('product', { entityId: 'one' }, { url: true });
    store().push('form');
    store().push('picker', { entityId: 'two' }, { url: true });
    store().pop(id);
    expect(store().items).toEqual([]);
    expect(Boolean(readModalProjection(location.read()))).toBe(false);
  });

  it('clears the projection on close after another writer changed unrelated parameters', () => {
    const location = setup();
    const id = store().push('product', { entityId: 'one' }, { url: true });
    // page-config and agent re-serialize the query, including the modal brackets.
    location.externalReplace(
      `${location.read().searchParams.toString()}&search=shoes`
    );
    store().pop(id);
    expect(Boolean(readModalProjection(location.read()))).toBe(false);
    expect(location.read().searchParams.get('search')).toBe('shoes');
    expect(location.read().searchParams.get('filter')).toBe('active');
  });

  it('preserves the common mounted prefix on external URL changes', async () => {
    const location = setup();
    store().push('product', { entityId: 'one' }, { url: true });
    const parent = store().items[0];
    const onRemoved = vi.fn();
    store().push('form', {}, { onRemoved });
    await location.navigate(
      encodeModalEntries([
        { type: 'product', params: { id: 'one' } },
        { type: 'picker', params: { id: 'two' } },
      ])
    );
    expect(store().items[0]).toBe(parent);
    expect(onRemoved).toHaveBeenCalledExactlyOnceWith('closed');
  });

  it('SC-mup4: guards dirty transient descendants during URL navigation', async () => {
    const location = setup();
    store().push('product', { entityId: 'one' }, { url: true });
    const form = store().push('form');
    store().setDirty(form, true);
    await location.navigate(null);
    expect(location.confirmLeave).toHaveBeenCalledOnce();
    expect(store().items).toHaveLength(2);
    expect(Boolean(readModalProjection(location.read()))).toBe(true);
    location.confirmLeave.mockResolvedValue(true);
    await location.navigate(null);
    expect(store().items).toEqual([]);
  });

  it('blocks URL removal while saving, without asking for confirmation', async () => {
    const location = setup();
    const id = store().push('product', { entityId: 'one' }, { url: true });
    store().setSaving(id, true);
    await location.navigate(null);
    expect(location.confirmLeave).not.toHaveBeenCalled();
    expect(store().items).toHaveLength(1);
    expect(Boolean(readModalProjection(location.read()))).toBe(true);
  });

  it('does not write when only temporary modals or runtime flags change', () => {
    const location = setup();
    const id = store().push('form');
    store().setDirty(id, true);
    store().pop();
    expect(location.replace).not.toHaveBeenCalled();
  });

  it('SC-mup5: clears entities when navigation changes the route', async () => {
    const location = setup();
    store().push('product', { entityId: 'one' }, { url: true });
    await location.changeRoute('/another-store/products');
    expect(store().items).toEqual([]);
    expect(Boolean(readModalProjection(location.read()))).toBe(false);
  });

  it('validates payload updates atomically', () => {
    setup();
    const id = store().push('product', { entityId: 'one' }, { url: true });
    expect(() => store().updatePayload(id, { entityId: '' })).toThrow();
    expect(projectModalStack(store().items)[0].params).toEqual({ id: 'one' });
  });

  it('keeps projecting after unrelated query parameters use percent-encoded spaces', async () => {
    const location = setup();
    await location.changeRoute('/store/products?search=hello%20world#table');
    store().push('product', { entityId: 'one' }, { url: true });
    expect(Boolean(readModalProjection(location.read()))).toBe(true);
    expect(location.read().searchParams.get('search')).toBe('hello world');
    expect(location.read().hash).toBe('#table');
  });

  it('does not apply a stale confirmation after another modal opens', async () => {
    const location = setup();
    const id = store().push('product', { entityId: 'one' }, { url: true });
    store().setDirty(id, true);
    let approve!: (value: boolean) => void;
    location.confirmLeave.mockImplementation(
      () =>
        new Promise((resolve) => {
          approve = resolve;
        })
    );
    const pending = location.navigate(null);
    store().push('picker', { entityId: 'two' }, { url: true });
    approve(true);
    await pending;
    expect(store().items.map((item) => item.type)).toEqual([
      'product',
      'picker',
    ]);
    expect(
      projectModalStack(
        restoreModalEntries(readModalProjection(location.read()))
      )
    ).toHaveLength(2);
  });
});
