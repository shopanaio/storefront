import { beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { modalStackRegistry } from '../registry/modal-registry';
import type { IModalStackItem } from '../types';
import { createModalStackUrl } from './share-url';
import {
  createModalUrlCodec,
  readModalProjection,
  restoreModalEntries,
} from './projection';

const codec = createModalUrlCodec({
  schema: z.object({ id: z.string().min(1) }),
  project: (payload) => ({ id: String(payload.entityId ?? '') }),
  restore: ({ id }) => ({ entityId: id }),
});

beforeEach(() => {
  modalStackRegistry.clear();
  for (const type of ['product', 'category', 'customer', 'customer-review']) {
    modalStackRegistry.register({ type, component: () => null, url: codec });
  }
});

describe('modal stack share URL', () => {
  it.each(['product', 'category', 'customer', 'customer-review'])(
    'SC-mup6: shares the first-level %s even when opened without URL projection',
    (type) => {
      const root: IModalStackItem = {
        uuid: 'root',
        type,
        payload: { entityId: 'gid+/==', onSaved: () => {} },
        url: false,
      };
      const items: IModalStackItem[] = [
        root,
        { uuid: 'form', type: 'unregistered-form', payload: {}, isDirty: true },
        {
          uuid: 'child',
          type: 'product',
          payload: { entityId: 'other' },
          url: true,
        },
      ];
      const original = new URL(
        'https://admin.test/store/products?filter[status][in]=ACTIVE#table'
      );
      const result = new URL(createModalStackUrl(original, items));
      expect(result.search).toBe(
        `?filter[status][in]=ACTIVE&modals[0][type]=${type}&modals[0][id]=gid%2B%2F%3D%3D`
      );
      expect(result.hash).toBe('#table');
      const restored = restoreModalEntries(readModalProjection(result));
      expect(restored).toHaveLength(1);
      expect(restored[0]).toMatchObject({
        type,
        payload: { entityId: 'gid+/==' },
      });
      expect(root.url).toBe(false);
      expect(items).toHaveLength(3);
      expect(items[1].isDirty).toBe(true);
      expect(original.search).toBe('?filter[status][in]=ACTIVE');
    }
  );

  it('replaces a stale or deeper URL projection with the current runtime root', () => {
    const url = new URL(
      'https://admin.test/products?q=hello%20world&modals[0][type]=product&modals[0][id]=stale&modals[1][type]=category&modals[1][id]=child'
    );
    const result = createModalStackUrl(url, [
      { uuid: 'root', type: 'customer', payload: { entityId: 'new' } },
    ]);
    expect(result).toBe(
      'https://admin.test/products?q=hello%20world&modals[0][type]=customer&modals[0][id]=new'
    );
  });

  it('SC-mup7: page headers outside modals copy the page without overlay state', () => {
    const url = new URL(
      'https://admin.test/org?sort=-name&modals[0][type]=product&modals[0][id]=other#details'
    );
    expect(createModalStackUrl(url, [])).toBe(
      'https://admin.test/org?sort=-name#details'
    );
  });
});
