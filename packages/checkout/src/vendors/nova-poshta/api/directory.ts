import { CombinedGraphQLErrors } from '@apollo/client';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  StorefrontNovaPoshtaSettlementStreetsQueryDocument,
  StorefrontNovaPoshtaSettlementsQueryDocument,
  StorefrontNovaPoshtaWarehouseQueryDocument,
  StorefrontNovaPoshtaWarehousesQueryDocument,
} from '#checkout/graphql/operations';
import type { Street, Warehouse } from '../types';

/**
 * Nova Poshta directory through the storefront queries of the Nova Poshta app: a thin
 * wrapper over the carrier API, independent of the checkout and its delivery options.
 */

const SETTLEMENTS_LIMIT = 20;
const WAREHOUSES_LIMIT = 50;
const STREETS_LIMIT = 20;
/**
 * Pages read in one go while none of their rows is of the wanted kind: the query has no
 * kind filter, and in a big city the first pages can be branches only.
 */
const MAX_PAGES_PER_LOAD = 5;
/** The app rejects longer search text with `DIRECTORY_QUERY_INVALID`. */
const MAX_QUERY_LENGTH = 100;

/**
 * Directory failure the UI tells apart: `unavailable` — the carrier did not answer
 * (`PROVIDER_UNAVAILABLE`, worth retrying); `invalid` — the query was rejected
 * (`DIRECTORY_QUERY_INVALID`); `failed` — anything else.
 */
export type DirectoryError = 'unavailable' | 'invalid' | 'failed';

export function directoryError(error: unknown): DirectoryError | null {
  if (!error) {
    return null;
  }
  const codes = CombinedGraphQLErrors.is(error)
    ? error.errors.map((item) => item.extensions?.code)
    : [];
  if (codes.includes('PROVIDER_UNAVAILABLE')) {
    return 'unavailable';
  }
  if (codes.includes('DIRECTORY_QUERY_INVALID')) {
    return 'invalid';
  }
  return 'failed';
}

const searchText = (value: string) => value.trim().slice(0, MAX_QUERY_LENGTH);

/** Settlements matching the search text (name or postal code). */
export function useSettlementSearch(text: string) {
  const query = searchText(text);
  const result = useQuery(StorefrontNovaPoshtaSettlementsQueryDocument, {
    variables: { query, page: 1, limit: SETTLEMENTS_LIMIT },
    skip: query.length === 0,
  });
  return {
    items: (query ? result.data?.novaPoshtaSettlements.items : null) ?? [],
    loading: result.loading,
    error: directoryError(result.error),
    retry: () => void result.refetch(),
  };
}

/** Streets of a settlement matching the search text. */
export function useStreetSearch(settlementRef: string | null, text: string) {
  const query = searchText(text);
  const skip = !settlementRef || query.length === 0;
  const result = useQuery(StorefrontNovaPoshtaSettlementStreetsQueryDocument, {
    variables: {
      settlementRef: settlementRef ?? '',
      query,
      limit: STREETS_LIMIT,
    },
    skip,
  });
  return {
    items: ((skip ? null : result.data?.novaPoshtaSettlementStreets.items) ??
      []) as Street[],
    loading: result.loading,
    error: directoryError(result.error),
    retry: () => void result.refetch(),
  };
}

/**
 * Branch or postomat by its ref, for a point picked earlier whose display state this browser
 * does not have: the checkout returns only `warehouseRef`. `warehouse` is `null` while
 * loading, when the carrier does not know the point, or on a failure; `loading` tells the
 * first of these apart.
 */
export function useWarehouse(ref: string | null) {
  const result = useQuery(StorefrontNovaPoshtaWarehouseQueryDocument, {
    variables: { ref: ref ?? '' },
    skip: !ref,
  });
  return {
    warehouse:
      (ref ? result.data?.novaPoshtaWarehouses.items[0] : null) ?? null,
    loading: Boolean(ref) && result.loading,
  };
}

interface WarehouseListState {
  /** Settlement and search text the rows were loaded for. */
  key: string;
  items: Warehouse[];
  page: number;
  hasNextPage: boolean;
  loading: boolean;
  error: DirectoryError | null;
}

const emptyList = (key: string): WarehouseListState => ({
  key,
  items: [],
  page: 0,
  hasNextPage: false,
  loading: false,
  error: null,
});

/**
 * Branches or postomats of a settlement, page by page. The carrier filters by text
 * (number or address); the list keeps the carrier order and every row of the wanted kind,
 * and unselectable points are shown disabled. Rows of a previous settlement or search
 * text are never shown: a new search hides them at once and drops the answers still in
 * flight.
 */
export function useWarehouseList(
  settlementRef: string | null,
  text: string,
  enabled: boolean,
  kind: Warehouse['kind']
) {
  const client = useApolloClient();
  const query = searchText(text);
  const key =
    enabled && settlementRef ? `${settlementRef}|${kind}|${query}` : '';
  const [state, setState] = useState<WarehouseListState>(() => emptyList(''));
  const request = useRef(0);

  const load = useCallback(
    async (page: number) => {
      if (!settlementRef || !key) {
        return;
      }
      const id = ++request.current;
      setState((current) => ({
        ...(page === 1 || current.key !== key ? emptyList(key) : current),
        loading: true,
        error: null,
      }));
      try {
        // Pages with no row of the kind are skipped, so "nothing found" or "load more"
        // never follows an empty list that still has matching points further on.
        const rows: Warehouse[] = [];
        let next = page;
        let result;
        for (let read = 0; read < MAX_PAGES_PER_LOAD; read++) {
          const { data } = await client.query({
            query: StorefrontNovaPoshtaWarehousesQueryDocument,
            // Point status (`selectable`) changes; every opening reads the carrier again.
            fetchPolicy: 'network-only',
            variables: {
              settlementRef,
              query: query || null,
              page: next,
              limit: WAREHOUSES_LIMIT,
            },
          });
          if (id !== request.current || !data) {
            return;
          }
          result = data.novaPoshtaWarehouses;
          rows.push(...result.items.filter((item) => item.kind === kind));
          if (rows.length > 0 || !result.hasNextPage) {
            break;
          }
          next = result.page + 1;
        }
        if (!result) {
          return;
        }
        const { page: lastPage, hasNextPage } = result;
        setState((current) => ({
          key,
          items:
            page === 1 || current.key !== key
              ? rows
              : [...current.items, ...rows],
          page: lastPage,
          hasNextPage,
          loading: false,
          error: null,
        }));
      } catch (error) {
        if (id === request.current) {
          setState((current) => ({
            ...current,
            loading: false,
            error: directoryError(error),
          }));
        }
      }
    },
    [client, settlementRef, query, kind, key]
  );

  useEffect(() => {
    if (!key) {
      return;
    }
    const timer = setTimeout(() => void load(1), query ? 300 : 0);
    return () => {
      clearTimeout(timer);
      // Answers to the previous settlement or search text are dropped. The ref is a
      // request counter, not a DOM node, so reading it in the cleanup is intended.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      request.current++;
    };
  }, [key, query, load]);

  // Until the rows of the current key arrive, the list is empty and loading.
  const current =
    state.key === key ? state : { ...emptyList(key), loading: !!key };

  return {
    items: current.items,
    page: current.page,
    hasNextPage: current.hasNextPage,
    loading: current.loading,
    error: current.error,
    loadMore: () => void load(current.page + 1),
    retry: () =>
      void load(
        current.page > 0 && current.items.length > 0 ? current.page + 1 : 1
      ),
  };
}
