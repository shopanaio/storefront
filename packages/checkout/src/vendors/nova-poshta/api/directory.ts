import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Settlement, Street, Warehouse } from '../types';
import {
  createCarrierDirectory,
  directoryError,
  type DirectoryError,
  type NovaPoshtaDirectory,
} from './carrier';

export { directoryError, type DirectoryError } from './carrier';

/**
 * Nova Poshta directory hooks of the checkout. The browser reads the carrier API itself
 * (see `carrier.ts`), independent of the checkout and its delivery options.
 */

const SETTLEMENTS_LIMIT = 20;
const WAREHOUSES_LIMIT = 50;
const STREETS_LIMIT = 20;
/**
 * Pages read in one go while none of their rows is of the wanted kind: the query has no
 * kind filter, and in a big city the first pages can be branches only.
 */
const MAX_PAGES_PER_LOAD = 5;
/** Longer search text is cut: the carrier finds nothing by it anyway. */
const MAX_QUERY_LENGTH = 100;
/** Settlements, streets and a point read by its ref are reused this long. */
const CACHE_TTL_MS = 10 * 60 * 1000;

let carrierDirectory: NovaPoshtaDirectory | null = null;

/** The carrier directory, made on the first read, so the server never makes one. */
const defaultDirectory = () => (carrierDirectory ??= createCarrierDirectory());

const DirectoryContext = createContext<NovaPoshtaDirectory | null>(null);

/** Gives the hooks another directory than the carrier's: stories and tests. */
export function NovaPoshtaDirectoryProvider({
  directory,
  children,
}: {
  directory: NovaPoshtaDirectory;
  children: ReactNode;
}) {
  return createElement(
    DirectoryContext.Provider,
    { value: directory },
    children
  );
}

function useDirectory() {
  return useContext(DirectoryContext) ?? defaultDirectory();
}

const searchText = (value: string) => value.trim().slice(0, MAX_QUERY_LENGTH);

interface CacheEntry {
  expiresAt: number;
  promise: Promise<unknown>;
  /** Set once the answer arrives, so a cached answer shows without a loading frame. */
  settled?: { value: unknown };
}

/** Answers by directory, so a story never reads the answers of another one. */
const caches = new WeakMap<NovaPoshtaDirectory, Map<string, CacheEntry>>();

function cacheOf(directory: NovaPoshtaDirectory) {
  let cache = caches.get(directory);
  if (!cache) {
    cache = new Map();
    caches.set(directory, cache);
  }
  return cache;
}

function cachedEntry(directory: NovaPoshtaDirectory, key: string) {
  const entry = cacheOf(directory).get(key);
  return entry && entry.expiresAt > Date.now() ? entry : null;
}

function load<T>(
  directory: NovaPoshtaDirectory,
  key: string,
  read: (directory: NovaPoshtaDirectory) => Promise<T>
): Promise<T> {
  const cached = cachedEntry(directory, key);
  if (cached) {
    return cached.promise as Promise<T>;
  }
  const cache = cacheOf(directory);
  const entry: CacheEntry = {
    expiresAt: Date.now() + CACHE_TTL_MS,
    promise: read(directory),
  };
  entry.promise.then(
    (value) => {
      entry.settled = { value };
    },
    // A failure is not kept, so a retry asks the carrier again.
    () => {
      if (cache.get(key) === entry) {
        cache.delete(key);
      }
    }
  );
  cache.set(key, entry);
  return entry.promise as Promise<T>;
}

interface QueryState<T> {
  key: string | null;
  value: T | undefined;
  error: DirectoryError | null;
}

/**
 * Answer of the directory for `key`, cached; `null` key reads nothing. `read` is memoized on
 * what the key is made of. Answers to a previous key are dropped.
 */
function useDirectoryQuery<T>(
  key: string | null,
  read: (directory: NovaPoshtaDirectory) => Promise<T>
) {
  const directory = useDirectory();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<QueryState<T>>({
    key: null,
    value: undefined,
    error: null,
  });

  useEffect(() => {
    if (!key) {
      return;
    }
    let active = true;
    load(directory, key, read).then(
      (value) => active && setState({ key, value, error: null }),
      (error) =>
        active &&
        setState({ key, value: undefined, error: directoryError(error) })
    );
    return () => {
      active = false;
    };
  }, [directory, key, read, attempt]);

  const settled = key ? cachedEntry(directory, key)?.settled : undefined;
  const current: QueryState<T> =
    state.key === key && key
      ? state
      : { key, value: settled?.value as T | undefined, error: null };
  return {
    value: current.value,
    loading: Boolean(key) && current.value === undefined && !current.error,
    error: current.error,
    retry: () => {
      // The failure is hidden at once: the list shows loading until the new answer.
      setState({ key, value: undefined, error: null });
      setAttempt((count) => count + 1);
    },
  };
}

/** Settlements matching the search text (name or postal code). */
export function useSettlementSearch(text: string) {
  const query = searchText(text);
  const read = useCallback(
    async (directory: NovaPoshtaDirectory) =>
      (
        await directory.settlements({
          query,
          page: 1,
          limit: SETTLEMENTS_LIMIT,
        })
      ).items,
    [query]
  );
  const result = useDirectoryQuery<Settlement[]>(
    query ? `settlements|${query}` : null,
    read
  );
  return {
    items: result.value ?? [],
    loading: result.loading,
    error: result.error,
    retry: result.retry,
  };
}

/** Streets of a settlement matching the search text. */
export function useStreetSearch(settlementRef: string | null, text: string) {
  const query = searchText(text);
  const read = useCallback(
    (directory: NovaPoshtaDirectory) =>
      directory.streets({
        settlementRef: settlementRef ?? '',
        query,
        limit: STREETS_LIMIT,
      }),
    [settlementRef, query]
  );
  const result = useDirectoryQuery<Street[]>(
    settlementRef && query ? `streets|${settlementRef}|${query}` : null,
    read
  );
  return {
    items: result.value ?? [],
    loading: result.loading,
    error: result.error,
    retry: result.retry,
  };
}

/**
 * Branch or postomat by its ref, for a point picked earlier whose display state this browser
 * does not have: the checkout returns only `warehouseRef`. `warehouse` is `null` while
 * loading, when the carrier does not know the point, or on a failure; `loading` tells the
 * first of these apart.
 */
export function useWarehouse(ref: string | null) {
  const read = useCallback(
    async (directory: NovaPoshtaDirectory) =>
      (await directory.warehouses({ ref: ref ?? '', page: 1, limit: 1 }))
        .items[0] ?? null,
    [ref]
  );
  const result = useDirectoryQuery<Warehouse | null>(
    ref ? `warehouse|${ref}` : null,
    read
  );
  return {
    warehouse: result.value ?? null,
    loading: result.loading,
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
  const directory = useDirectory();
  const query = searchText(text);
  const key =
    enabled && settlementRef ? `${settlementRef}|${kind}|${query}` : '';
  const [state, setState] = useState<WarehouseListState>(() => emptyList(''));
  const request = useRef(0);

  const loadPage = useCallback(
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
        // Point status (`selectable`) changes, so every opening reads the carrier again.
        const rows: Warehouse[] = [];
        let next = page;
        let result;
        for (let read = 0; read < MAX_PAGES_PER_LOAD; read++) {
          result = await directory.warehouses({
            settlementRef,
            query: query || undefined,
            page: next,
            limit: WAREHOUSES_LIMIT,
          });
          if (id !== request.current) {
            return;
          }
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
    [directory, settlementRef, query, kind, key]
  );

  useEffect(() => {
    if (!key) {
      return;
    }
    const timer = setTimeout(() => void loadPage(1), query ? 300 : 0);
    // The request counter, not a DOM node: the cleanup bumps the same counter.
    const requests = request;
    return () => {
      clearTimeout(timer);
      // Answers to the previous settlement or search text are dropped.
      requests.current++;
    };
  }, [key, query, loadPage]);

  // Until the rows of the current key arrive, the list is empty and loading.
  const current =
    state.key === key ? state : { ...emptyList(key), loading: !!key };

  return {
    items: current.items,
    page: current.page,
    hasNextPage: current.hasNextPage,
    loading: current.loading,
    error: current.error,
    loadMore: () => void loadPage(current.page + 1),
    retry: () =>
      void loadPage(
        current.page > 0 && current.items.length > 0 ? current.page + 1 : 1
      ),
  };
}
