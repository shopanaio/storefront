import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { StorefrontSessionClient } from '@shopana/storefront-sdk/modules/session';
import { AuthError } from './AuthError';
import { HeadlessAuthClient } from './HeadlessAuthClient';

const session = { adopt: vi.fn() } as unknown as StorefrontSessionClient;
const credentials = { email: 'buyer@example.test', password: 'correct horse' };

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('HeadlessAuthClient', () => {
  it('sends a step requested while another runs only once', async () => {
    let answer!: (response: Response) => void;
    fetchMock.mockReturnValue(new Promise<Response>((resolve) => (answer = resolve)));
    const client = new HeadlessAuthClient({ session });

    const first = client.passwordSignIn(credentials);
    const second = client.passwordSignIn(credentials);
    answer(jsonResponse(200, { type: 'signInRequired' }));

    expect(await first).toEqual({ type: 'signInRequired' });
    expect(await second).toEqual({ type: 'signInRequired' });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fetchMock.mockResolvedValue(jsonResponse(200, { type: 'signInRequired' }));
    await client.passwordSignIn(credentials);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('reports a code the forms do not know as unavailable', async () => {
    fetchMock.mockResolvedValue(jsonResponse(403, { error: 'forbidden' }));

    const failure = await new HeadlessAuthClient({ session })
      .passwordSignIn(credentials)
      .catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(AuthError);
    expect(failure).toMatchObject({ code: 'unavailable', status: 403 });
  });

  it('keeps a known code and its retry delay', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(429, { error: 'rateLimited', message: 'Slow down', retryAfter: 30 })
    );

    const failure = await new HeadlessAuthClient({ session })
      .passwordSignIn(credentials)
      .catch((error: unknown) => error);

    expect(failure).toMatchObject({ code: 'rateLimited', retryAfter: 30, message: 'Slow down' });
  });

  it('rejects a successful answer without a body', async () => {
    fetchMock.mockResolvedValue(new Response('<html>', { status: 200 }));

    const failure = await new HeadlessAuthClient({ session })
      .passwordSignIn(credentials)
      .catch((error: unknown) => error);

    expect(failure).toMatchObject({ code: 'unavailable' });
  });
});
