import { AsyncLocalStorage } from 'node:async_hooks';
import { expect, it } from 'vitest';
import {
  createServerRequestScope,
  provideServerRequestStorage,
  type ServerRequestScope,
} from '@shopana/storefront-sdk/server/requestScope';
import { cookies, getRequestContext, headers } from './headers';

const storage = new AsyncLocalStorage<ServerRequestScope>();
provideServerRequestStorage(storage);

const inRequest = <T>(fn: () => Promise<T>) =>
  storage.run(
    createServerRequestScope(
      new URL('https://shop.test/uk/products/socks?size=m'),
      new Headers({
        host: 'shop.test',
        cookie: 'cart=abc; note=hello%20world; broken',
      })
    ),
    fn
  );

it('reads the request of the scope', async () => {
  const context = await inRequest(getRequestContext);
  expect(context).toMatchObject({
    url: 'https://shop.test/uk/products/socks?size=m',
    pathname: '/uk/products/socks',
    search: '?size=m',
    host: 'shop.test',
  });
  expect(context.searchParams.get('size')).toBe('m');
  expect((await inRequest(headers)).get('host')).toBe('shop.test');

  const jar = await inRequest(cookies);
  expect(jar.get('note')).toEqual({ name: 'note', value: 'hello world' });
  expect(jar.has('cart')).toBe(true);
  expect(jar.getAll().map((cookie) => cookie.name)).toEqual(['cart', 'note']);
});

it('refuses to read a request outside of one', async () => {
  await expect(getRequestContext()).rejects.toThrow(/inside a request/);
});
