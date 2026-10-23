import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const session = vi.hoisted(() => ({
  status: 'anonymous' as 'loading' | 'anonymous' | 'authenticated',
}));

vi.mock('@shopana/storefront-sdk/modules/session/react', () => ({
  useSessionStatus: () => session.status,
}));

import {
  AuthActionProvider,
  discardPendingAuthAction,
  useAuthAction,
  type AuthActionOptions,
  type AuthSignInRequest,
} from './authActions';

const STORAGE_KEY = 'shopana:pending-auth-action';

let requestSignIn: ReturnType<
  typeof vi.fn<(request: AuthSignInRequest) => void>
>;

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthActionProvider requestSignIn={requestSignIn}>
    {children}
  </AuthActionProvider>
);

function renderAction<Payload extends string | undefined>(
  key: string,
  handler: (payload: Payload) => void,
  options?: AuthActionOptions
) {
  return renderHook(
    ({ actionKey }: { actionKey: string }) =>
      useAuthAction<Payload>(actionKey, handler, options),
    { wrapper, initialProps: { actionKey: key } }
  );
}

const signIn = (rerender: () => void) => {
  session.status = 'authenticated';
  act(() => rerender());
};

beforeEach(() => {
  session.status = 'anonymous';
  requestSignIn = vi.fn<(request: AuthSignInRequest) => void>();
  sessionStorage.clear();
  discardPendingAuthAction();
  window.history.replaceState(null, '', '/en/products/kibble');
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useAuthAction', () => {
  it('runs at once for a signed-in buyer', () => {
    session.status = 'authenticated';
    const handler = vi.fn();
    const { result } = renderAction('wishlist-add:p1', handler);

    act(() => result.current('variant-1'));

    expect(handler).toHaveBeenCalledWith('variant-1');
    expect(requestSignIn).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('defers the action to the sign-in and runs it once signed in', () => {
    const handler = vi.fn();
    const { result, rerender } = renderAction('wishlist-add:p1', handler, {
      screen: 'signUp',
    });

    act(() => result.current('variant-1'));

    expect(handler).not.toHaveBeenCalled();
    expect(requestSignIn).toHaveBeenCalledWith({ screen: 'signUp' });

    signIn(() => rerender({ actionKey: 'wishlist-add:p1' }));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('variant-1');
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();

    // A later render does not run it again.
    act(() => rerender({ actionKey: 'wishlist-add:p1' }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('runs a guest action at once without a session', () => {
    const handler = vi.fn();
    const { result } = renderAction('question-create:p1', handler, {
      guest: true,
    });

    act(() => result.current(undefined));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(requestSignIn).not.toHaveBeenCalled();
  });

  it('does nothing while the session is loading', () => {
    session.status = 'loading';
    const handler = vi.fn();
    const { result } = renderAction('wishlist-add:p1', handler);

    act(() => result.current('variant-1'));

    expect(handler).not.toHaveBeenCalled();
    expect(requestSignIn).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('drops the action when the sign-in is closed without signing in', () => {
    const handler = vi.fn();
    const { result, rerender } = renderAction('wishlist-add:p1', handler);

    act(() => result.current('variant-1'));
    discardPendingAuthAction();
    signIn(() => rerender({ actionKey: 'wishlist-add:p1' }));

    expect(handler).not.toHaveBeenCalled();
  });

  it('runs the action only in the component of its key', () => {
    const asked = vi.fn();
    const other = vi.fn();
    const { result, rerender } = renderAction('wishlist-add:p1', asked);
    const second = renderAction('comparison-add:p1', other);

    act(() => result.current('variant-1'));
    session.status = 'authenticated';
    act(() => second.rerender({ actionKey: 'comparison-add:p1' }));

    expect(other).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(STORAGE_KEY)).not.toBeNull();

    act(() => rerender({ actionKey: 'wishlist-add:p1' }));
    expect(asked).toHaveBeenCalledWith('variant-1');
  });

  it('runs a shared key once', () => {
    const first = vi.fn();
    const second = vi.fn();
    const header = renderAction('open-account', first);
    const drawer = renderAction('open-account', second);

    act(() => header.result.current('/en/account'));
    session.status = 'authenticated';
    act(() => {
      header.rerender({ actionKey: 'open-account' });
      drawer.rerender({ actionKey: 'open-account' });
    });

    expect(first.mock.calls.length + second.mock.calls.length).toBe(1);
  });

  it('runs the action after the page loads again, as after a social sign-in', () => {
    const before = vi.fn();
    const { result, unmount } = renderAction('wishlist-add:p1', before);
    act(() => result.current('variant-1'));
    unmount();

    // The page comes back from the provider with the session.
    session.status = 'loading';
    const after = vi.fn();
    const { rerender } = renderAction('wishlist-add:p1', after);
    expect(after).not.toHaveBeenCalled();

    signIn(() => rerender({ actionKey: 'wishlist-add:p1' }));

    expect(before).not.toHaveBeenCalled();
    expect(after).toHaveBeenCalledWith('variant-1');
  });

  it('drops an action asked for on another page', () => {
    const handler = vi.fn();
    const { result, rerender } = renderAction('open-account', handler);
    act(() => result.current('/en/account'));

    window.history.replaceState(null, '', '/en/collections/dogs');
    signIn(() => rerender({ actionKey: 'open-account' }));

    expect(handler).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('drops an action whose sign-in took too long', () => {
    vi.useFakeTimers({ now: new Date('2026-10-23T10:00:00.000Z') });
    const handler = vi.fn();
    const { result, rerender } = renderAction('wishlist-add:p1', handler);
    act(() => result.current('variant-1'));

    vi.setSystemTime(new Date('2026-10-23T10:16:00.000Z'));
    signIn(() => rerender({ actionKey: 'wishlist-add:p1' }));

    expect(handler).not.toHaveBeenCalled();
  });

  it('ignores a stored value it did not write', () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ key: 'wishlist-add:p1' })
    );
    session.status = 'authenticated';
    const handler = vi.fn();

    renderAction('wishlist-add:p1', handler);

    expect(handler).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
