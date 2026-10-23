import type { AuthErrorCode } from '../../core/types';
import { errorOf } from '../../testing';
import type { AuthContext } from '../screens/types';

/** The `context` control of a board: where the sign-in is shown. */
export const contextArgType = {
  control: 'inline-radio',
  options: [
    'store',
    'checkoutGuest',
    'checkoutRequired',
  ] satisfies AuthContext[],
} as const;

/**
 * The error a board state shows: the states named after an error code are that error; a
 * rate limit waits the seconds `rateLimits` gives the state.
 */
export function errorForState<State extends string>(
  state: State,
  codes: readonly AuthErrorCode[],
  rateLimits: Partial<Record<State, number>> = {}
) {
  const wait = rateLimits[state];
  if (wait !== undefined) return errorOf('rateLimited', wait);
  return (codes as readonly string[]).includes(state)
    ? errorOf(state as AuthErrorCode)
    : null;
}
