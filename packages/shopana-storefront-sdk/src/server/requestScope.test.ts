import { AsyncLocalStorage } from 'node:async_hooks';
import { expect, it, vi } from 'vitest';
import {
  cacheForRequest,
  createServerRequestScope,
  getServerRequestScope,
  provideServerRequestStorage,
  readServerRequestHeaders,
  type ServerRequestScope,
} from './requestScope';

const storage = new AsyncLocalStorage<ServerRequestScope>();
provideServerRequestStorage(storage);

function runInRequest<T>(cookie: string, fn: () => T): T {
  const scope = createServerRequestScope(
    new URL('https://shop.test/uk/products/socks'),
    new Headers({ cookie })
  );
  return storage.run(scope, fn);
}

it('reads the headers of the request running now', async () => {
  const [first, second] = await Promise.all([
    runInRequest('a=1', async () =>
      (await readServerRequestHeaders()).get('cookie')
    ),
    runInRequest('b=2', async () =>
      (await readServerRequestHeaders()).get('cookie')
    ),
  ]);
  expect(first).toBe('a=1');
  expect(second).toBe('b=2');
  expect(getServerRequestScope()).toBeUndefined();
});

it('computes a request value once per request and key', async () => {
  const load = vi.fn(async (handle: string) => ({ handle }));
  const cached = cacheForRequest(load, (handle) => handle);

  const results = await runInRequest('', async () => [
    await cached('socks'),
    await cached('socks'),
    await cached('hats'),
  ]);
  expect(results[0]).toBe(results[1]);
  expect(results[2]).toEqual({ handle: 'hats' });
  expect(load).toHaveBeenCalledTimes(2);

  await runInRequest('', () => cached('socks'));
  expect(load).toHaveBeenCalledTimes(3);
});
