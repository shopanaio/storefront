import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client/react';
import { checkoutPlacementQuery } from '#checkout/api/queries/checkoutPlacementQuery.shopana';
import {
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
 * Everything that knows how a placement is found and read lives here, so that the switch to the
 * placement token (B4) changes only this module: the return URL template, the URL parameters,
 * and the read operation.
 */

/** Return URL query parameters. `placement` and `token` are filled in by the backend after B4. */
export const RETURN_PARAM_CHECKOUT = 'checkout';
export const RETURN_PARAM_PLACEMENT = 'placement';
export const RETURN_PARAM_TOKEN = 'token';

export type ReadPlacement = (locator: PlacementLocator) => Promise<PlacementResult | null>;

export interface ReturnParams {
  checkoutId: string | null;
  locator: PlacementLocator | null;
}

/**
 * Builds the return URL once per attempt; it is stored in the journal and resent byte-for-byte.
 * Until B4 it names the checkout, whose attempt journal holds the placement.
 */
export function buildReturnUrl(origin: string, returnPath: string, checkoutId: string): string {
  const url = new URL(returnPath, origin);
  url.search = '';
  url.hash = '';
  url.searchParams.set(RETURN_PARAM_CHECKOUT, checkoutId);
  return url.toString();
}

export function readReturnParams(search: string): ReturnParams {
  const params = new URLSearchParams(search);
  const placementId = params.get(RETURN_PARAM_PLACEMENT);
  return {
    checkoutId: params.get(RETURN_PARAM_CHECKOUT),
    locator: placementId
      ? { placementId, placementToken: params.get(RETURN_PARAM_TOKEN) }
      : null,
  };
}

/** Removes the placement token from the address bar right after it was read (section 2.7). */
export function stripReturnToken(location: Location, history: History): void {
  const url = new URL(location.href);
  if (!url.searchParams.has(RETURN_PARAM_TOKEN)) return;
  url.searchParams.delete(RETURN_PARAM_TOKEN);
  history.replaceState(history.state, '', url.toString());
}

/** The URL wins over the journal: it works in any tab and on any device after B4. */
export function resolveRecoveryLocator(
  params: ReturnParams,
  attempt: PlacementAttempt | null
): PlacementLocator | null {
  return params.locator ?? attemptLocator(attempt);
}

/**
 * Reads a placement through `checkoutPlacement(id)`. The token is not sent yet: the current API
 * reads placements of the same visitor only (B4 adds `checkoutPlacement(id, token)`).
 */
export function useReadPlacement(): ReadPlacement {
  const client = useApolloClient();
  return useCallback(
    async (locator: PlacementLocator) => {
      const { data } = await client.query({
        query: checkoutPlacementQuery,
        variables: { placementId: locator.placementId },
        fetchPolicy: 'network-only',
      });
      const payload = data?.checkoutPlacement;
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
