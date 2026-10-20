import { model } from '../../../model/namespace';

/**
 * Session data structure. The access token is not part of it: the browser keeps it in memory
 * inside the session client and never in React state or cookies it can read.
 */
export interface Session {
  user: model.User | null;
  /** When the current access token expires (ISO 8601). */
  expiresAt?: string;
}
