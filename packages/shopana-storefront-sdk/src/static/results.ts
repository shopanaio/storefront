/**
 * The static site as a source of query answers in the browser. A client navigation of a static
 * document starts loading the data of its address (`/__static/data/*.json`, the Apollo state
 * the builder rendered the page with) and goes on at once: the page renders as it would from
 * the API, its sections under their skeletons, and each query is answered from that data
 * instead of the API when the data has it. Only the source of the answers changes, never what
 * the screen shows while they come.
 */
import {
  ApolloLink,
  Observable,
  type ApolloCache,
  type DocumentNode,
  type NormalizedCacheObject,
  type OperationVariables,
  type StoreObject,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { createApolloCache } from '../graphql/apollo/cache';
import {
  indexRequestResults,
  queryResultKey,
  type RequestQueryResult,
} from '../graphql/apollo/requestResultCache';
import { browserHasSession, showsViewerFields } from './viewer';

/** The Apollo state of a static page: a normalized cache, or the whole responses of its queries. */
export type StaticState = NormalizedCacheObject | readonly RequestQueryResult[];

/** Answers of one static state, each given once: a query asked again goes to the API. */
interface StaticAnswers {
  take(query: DocumentNode, variables: OperationVariables): unknown;
}

function answersOf(state: StaticState): StaticAnswers {
  const given = new Set<string>();
  const once = (
    query: DocumentNode,
    variables: OperationVariables,
    read: () => unknown
  ): unknown => {
    const key = queryResultKey(query, variables);
    if (!key || given.has(key)) return undefined;
    const data = read();
    if (data === undefined) return undefined;
    given.add(key);
    return data;
  };

  if (Array.isArray(state)) {
    const results = indexRequestResults(state);
    return {
      take: (query, variables) =>
        once(query, variables, () => {
          const key = queryResultKey(query, variables);
          return key ? results.get(key)?.d : undefined;
        }),
    };
  }

  // A normalized state answers any query whose fields it has in full, as the API would.
  const cache = createApolloCache();
  cache.restore(state as NormalizedCacheObject);
  return {
    take: (query, variables) =>
      once(query, variables, () => {
        const diff = cache.diff({
          query,
          variables,
          optimistic: false,
          returnPartialData: false,
        });
        return diff.complete ? (diff.result ?? undefined) : undefined;
      }),
  };
}

/** The static state of the address being opened, while there is one. */
let source: Promise<StaticAnswers | null> | null = null;

/**
 * Makes `state` (still loading) the source of the query answers of the screen being opened:
 * queries asked from now on wait for it and take their answer from it, or go to the API when
 * it has none. A failed or missing state is no source. The next call replaces it.
 */
export function provideStaticResults(state: Promise<StaticState | null>): void {
  const current: Promise<StaticAnswers | null> = state.then(
    (loaded) => (loaded ? answersOf(loaded) : null),
    () => null
  );
  source = current;
  void current.then((answers) => {
    if (!answers && source === current) source = null;
  });
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/**
 * Whether the fields of `value` the cache record has hold other values there. Fields under an
 * alias or with arguments are named otherwise in the record and are not compared; an entity
 * inside (a reference in the record) is compared on its own.
 */
function differs(
  value: Record<string, unknown>,
  record: Record<string, unknown>
): boolean {
  for (const [field, incoming] of Object.entries(value)) {
    if (!(field in record)) continue;
    const stored = record[field];
    if (!isRecord(incoming) && !Array.isArray(incoming)) {
      if (stored !== incoming) return true;
    } else if (isRecord(incoming) && isRecord(stored) && !('__ref' in stored)) {
      if (differs(incoming, stored)) return true;
    }
  }
  return false;
}

/**
 * Whether an answer of the static site would change an entity the cache holds already: what
 * the cache has came later than the build (the API, a newer page), so the API answers.
 */
function conflictsWithCache(cache: ApolloCache, data: unknown): boolean {
  const records = cache.extract() as NormalizedCacheObject;
  const seen = new Set<object>();
  const visit = (value: unknown): boolean => {
    if (!value || typeof value !== 'object' || seen.has(value)) return false;
    seen.add(value);
    if (Array.isArray(value)) return value.some(visit);
    const object = value as Record<string, unknown>;
    const id =
      typeof object.__typename === 'string'
        ? cache.identify(object as StoreObject)
        : undefined;
    const record = id ? records[id] : undefined;
    if (isRecord(record) && differs(object, record)) return true;
    return Object.values(object).some(visit);
  };
  return visit(data);
}

const isQuery = (operation: ApolloLink.Operation) => {
  const definition = getMainDefinition(operation.query);
  return (
    definition.kind === 'OperationDefinition' &&
    definition.operation === 'query'
  );
};

/**
 * Answers queries from the static source (`provideStaticResults`) when it has their answer;
 * every other operation, and every query it cannot answer, goes on to the API. So does an
 * answer that would change what the cache holds (it came after the build), and, for a buyer
 * with a session, one that shows the viewer's fields: theirs are not the guest's. Browser only.
 */
export function createStaticResultsLink(): ApolloLink {
  return new ApolloLink((operation, forward) => {
    const current = source;
    if (!current || !isQuery(operation)) return forward(operation);
    return new Observable((observer) => {
      let closed = false;
      let subscription: { unsubscribe(): void } | undefined;
      void current
        .then((answers) => {
          const data = answers?.take(operation.query, operation.variables);
          if (data === undefined) return undefined;
          if (browserHasSession() && showsViewerFields(data)) return undefined;
          return conflictsWithCache(operation.client.cache, data)
            ? undefined
            : data;
        })
        .catch(() => undefined)
        .then((data) => {
          if (closed) return;
          if (data !== undefined) {
            observer.next({ data: data as Record<string, unknown> });
            observer.complete();
            return;
          }
          subscription = forward(operation).subscribe(observer);
        });
      return () => {
        closed = true;
        subscription?.unsubscribe();
      };
    });
  });
}
