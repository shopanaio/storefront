import { readServerAuthState } from '../../server';
import type { Session } from '../../core/types';

export interface LoadSessionServerQueryOptions {
  serverCookies?: string;
}

/** Reads the signed-in user of this request from the encrypted session cookie. */
export async function loadSessionServerQuery({
  serverCookies,
}: LoadSessionServerQueryOptions): Promise<Session | null> {
  try {
    return (await readServerAuthState(serverCookies)).session;
  } catch {
    return null;
  }
}
