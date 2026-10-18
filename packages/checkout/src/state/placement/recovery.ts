import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client/react';
import { checkoutPlacementQuery } from '#checkout/api/queries/checkoutPlacementQuery.shopana';
import { CombinedGraphQLErrors } from '@apollo/client';
import {
  isDefiniteRejection,
  isSettledOutcome,
  mapPlacementPayload,
  placementPollDelay,
  resolvePlacementOutcome,
} from '#checkout/state/placement/outcome';
import { attemptLocator } from '#checkout/state/placement/attemptJournal';
import type { PlacementAttempt } from '#checkout/state/placement/attemptJournal';
import type {
  PaymentFlow,
  PlacementLocator,
  PlacementOutcome,
  PlacementResult,
} from '#checkout/state/placement/types';

/**
 * Placement recovery layer (plan, section 2).
 *
 * Everything that knows how a placement is found and read lives here: the return URL template,
 * the URL parameters, and the read operation.
 */

/**
 * Return URL query parameters. `placement` and `token` are placeholders the backend fills in
 * once the placement exists (B4); `checkout` names the attempt journal of this browser.
 */
export const RETURN_PARAM_CHECKOUT = 'checkout';
export const RETURN_PARAM_PLACEMENT = 'placement';
export const RETURN_PARAM_TOKEN = 'token';

export type ReadPlacement = (locator: PlacementLocator) => Promise<PlacementResult | null>;

export interface ReturnParams {
  checkoutId: string | null;
  locator: PlacementLocator | null;
}

/** Longest return URL the payment providers take (LiqPay `result_url`). */
export const RETURN_URL_MAX_LENGTH = 510;

/** Placeholders the backend substitutes; they must stay unencoded, as whole parameter values. */
export const PLACEMENT_ID_PLACEHOLDER = '{placementId}';
export const PLACEMENT_TOKEN_PLACEHOLDER = '{placementToken}';

/**
 * Builds the return URL template once per attempt; it is stored in the journal and resent
 * byte-for-byte, because the template is part of the idempotency request hash. The backend puts
 * the placement id and token into it, so the return page works in any browser or device.
 */
export function buildReturnUrl(origin: string, returnPath: string, checkoutId: string): string {
  const url = new URL(returnPath, origin);
  url.search = '';
  url.hash = '';
  url.searchParams.set(RETURN_PARAM_CHECKOUT, checkoutId);
  const returnUrl =
    `${url.toString()}&${RETURN_PARAM_PLACEMENT}=${PLACEMENT_ID_PLACEHOLDER}` +
    `&${RETURN_PARAM_TOKEN}=${PLACEMENT_TOKEN_PLACEHOLDER}`;
  if (returnUrl.length > RETURN_URL_MAX_LENGTH) {
    // A provider would reject the payment after the order is placed; fail before placing it.
    throw new Error(
      `The checkout return URL is ${returnUrl.length} characters long, over ${RETURN_URL_MAX_LENGTH}.`
    );
  }
  return returnUrl;
}

/**
 * Codes of a placement read that will not change on retry: no such placement, no access, or
 * a request the API rejected before running it.
 */
const PLACEMENT_MISSING_CODES: ReadonlySet<string> = new Set([
  'NOT_FOUND',
  'CHECKOUT_PLACEMENT_NOT_FOUND',
]);

/** Whether a read error proves the placement cannot be read: polling it again is useless. */
function isFinalReadError(error: unknown): boolean {
  if (!CombinedGraphQLErrors.is(error)) return false;
  return (
    isDefiniteRejection(error.errors) ||
    (error.errors.length > 0 &&
      error.errors.every((item) => {
        const code = item.extensions?.code;
        return typeof code === 'string' && PLACEMENT_MISSING_CODES.has(code);
      }))
  );
}

export function readReturnParams(search: string): ReturnParams {
  const params = new URLSearchParams(search);
  const placementId = filled(params.get(RETURN_PARAM_PLACEMENT), PLACEMENT_ID_PLACEHOLDER);
  return {
    checkoutId: params.get(RETURN_PARAM_CHECKOUT),
    locator: placementId
      ? {
          placementId,
          placementToken: filled(params.get(RETURN_PARAM_TOKEN), PLACEMENT_TOKEN_PLACEHOLDER),
        }
      : null,
  };
}

/** A parameter the backend left unsubstituted counts as missing. */
function filled(value: string | null, placeholder: string): string | null {
  return value && value !== placeholder ? value : null;
}

/** Removes the placement token from the address bar right after it was read (section 2.7). */
export function stripReturnToken(location: Location, history: History): void {
  const url = new URL(location.href);
  if (!url.searchParams.has(RETURN_PARAM_TOKEN)) return;
  url.searchParams.delete(RETURN_PARAM_TOKEN);
  history.replaceState(history.state, '', url.toString());
}

/**
 * The URL wins over the journal: it works in any tab and on any device. After a reload the URL
 * no longer has the token (section 2.7); the journal of this browser still has it for the same
 * placement.
 */
export function resolveRecoveryLocator(
  params: ReturnParams,
  attempt: PlacementAttempt | null
): PlacementLocator | null {
  const journal = attemptLocator(attempt);
  if (!params.locator) return journal;
  if (!params.locator.placementToken && journal?.placementId === params.locator.placementId) {
    return { ...params.locator, placementToken: journal.placementToken };
  }
  return params.locator;
}

/**
 * Reads a placement through `checkoutPlacement`. The buyer who placed it reads it without the
 * token first: only that read returns the customer action (a redirect to continue, a client
 * SDK). When the buyer read finds nothing or is not allowed (another browser or device, no
 * `CHECKOUT_READ`), the token reads the status alone.
 */
export function useReadPlacement(): ReadPlacement {
  const client = useApolloClient();
  return useCallback(
    async (locator: PlacementLocator) => {
      const read = async (token: string | null) => {
        const { data } = await client.query({
          query: checkoutPlacementQuery,
          variables: { placementId: locator.placementId, token },
          fetchPolicy: 'network-only',
        });
        return data?.checkoutPlacement ?? null;
      };
      // A final error (no such placement, no access) reads as `null`, so polling stops;
      // network and server errors are thrown and retried.
      const readOrMissing = async (token: string | null) => {
        try {
          return await read(token);
        } catch (error) {
          if (isFinalReadError(error)) return null;
          throw error;
        }
      };
      let payload: Awaited<ReturnType<typeof read>> = null;
      try {
        payload = await readOrMissing(null);
      } catch (error) {
        if (!locator.placementToken) throw error;
      }
      if (!payload && locator.placementToken) {
        payload = await readOrMissing(locator.placementToken);
      }
      if (!payload) return null;
      const result = mapPlacementPayload(payload);
      return {
        ...result,
        placementId: result.placementId ?? locator.placementId,
        placementToken: result.placementToken ?? locator.placementToken,
      };
    },
    [client]
  );
}

export interface PollPlacementOptions {
  read: ReadPlacement;
  locator: PlacementLocator;
  flow: PaymentFlow | null;
  signal: AbortSignal;
  /** Called with every read result, settled or not. */
  onResult: (result: PlacementResult, outcome: PlacementOutcome) => void;
  /** Called when the placement cannot be read at all (`null`): no access or no such placement. */
  onMissing: () => void;
  wait?: (ms: number, signal: AbortSignal) => Promise<void>;
}

/**
 * Polls the placement until its outcome settles. No hard limit (decision 1.9): the delay grows
 * from 2 to 30 seconds and stays there; a failed read is retried on the same schedule.
 */
export async function pollPlacement({
  read,
  locator,
  flow,
  signal,
  onResult,
  onMissing,
  wait = abortableDelay,
}: PollPlacementOptions): Promise<void> {
  for (let attempt = 0; !signal.aborted; attempt += 1) {
    let result: PlacementResult | null | undefined;
    try {
      result = await read(locator);
    } catch {
      result = undefined;
    }
    if (signal.aborted) return;
    if (result === null) {
      onMissing();
      return;
    }
    if (result) {
      const outcome = resolvePlacementOutcome(result, flow, locator);
      onResult(result, outcome);
      if (isSettledOutcome(outcome)) return;
    }
    await wait(placementPollDelay(attempt), signal);
  }
}

function abortableDelay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(done, ms);
    function done() {
      clearTimeout(timer);
      signal.removeEventListener('abort', done);
      resolve();
    }
    signal.addEventListener('abort', done, { once: true });
  });
}
