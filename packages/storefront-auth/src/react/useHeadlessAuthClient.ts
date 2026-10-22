'use client';

import {
  useSessionContext,
  type StorefrontSessionClient,
} from '@shopana/storefront-sdk/modules/session';
import { HeadlessAuthClient } from '../core/HeadlessAuthClient';

/** One client per session client, so the configuration is read once per tab. */
const clients = new WeakMap<StorefrontSessionClient, HeadlessAuthClient>();

/**
 * The headless sign-in client of this tab. A completed sign-in is adopted by the session
 * provider and marks the sign-in pending, so the account cart is attached (design F1).
 */
export function useHeadlessAuthClient(): HeadlessAuthClient {
  const { sessionClient, store } = useSessionContext();
  let client = clients.get(sessionClient);
  if (!client) {
    client = new HeadlessAuthClient({
      session: sessionClient,
      onSignedIn: () => store.getState().setSignInPending(true),
    });
    clients.set(sessionClient, client);
  }
  return client;
}
