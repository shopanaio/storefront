import { model } from '../../../model/namespace';

/**
 * Session data structure. The access token is not part of it: the browser keeps it in memory
 * inside the session client and never in React state or cookies it can read.
 */
/**
 * The identifier the buyer signed in with: an email (password, email code or a social provider)
 * or a phone (SMS code). Known for a headless sign-in only; a hosted storefront has none.
 */
export type LoginMethod = 'email' | 'phone';

export interface Session {
  user: model.User | null;
  /** When the current access token expires (ISO 8601). */
  expiresAt?: string;
  loginMethod?: LoginMethod;
}
