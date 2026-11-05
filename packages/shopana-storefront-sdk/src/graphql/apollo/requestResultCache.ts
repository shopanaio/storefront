import type { Cache, DocumentNode } from '@apollo/client';
import { ApolloCache, type ApolloClient } from '@apollo/client';
import {
  addTypenameToDocument,
  canonicalStringify,
  DocumentTransform,
  getMainDefinition,
} from '@apollo/client/utilities';

/** One query the server answered, as the document carries it to the browser. */
export interface RequestQueryResult {
  /** Operation name: the browser has the document itself once a hook asks for this query. */
  o: string;
  /** Variables; absent when there are none. */
  v?: Record<string, unknown>;
  d: unknown;
}

const operationNames = new WeakMap<DocumentNode, string | null>();

function queryName(query: DocumentNode): string | null {
  let name = operationNames.get(query);
  if (name === undefined) {
    const definition = getMainDefinition(query);
    name =
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'query'
        ? (definition.name?.value ?? null)
        : null;
    operationNames.set(query, name);
  }
  return name;
}

function resultKey(name: string, variables: unknown): string {
  return `${name}|${canonicalStringify(variables ?? {})}`;
}

/** The key of a query's result; null for what is not a whole named query from the root. */
export function queryResultKey(
  query: DocumentNode,
  variables: unknown,
  dataId?: string
): string | null {
  if (dataId && dataId !== 'ROOT_QUERY') return null;
  const name = queryName(query);
  return name ? resultKey(name, variables) : null;
}

/** Results by key, for the browser cache to write as hooks ask for them. */
export function indexRequestResults(
  results: readonly RequestQueryResult[]
): Map<string, RequestQueryResult> {
  return new Map(
    results.map((result) => [resultKey(result.o, result.v), result])
  );
}

const addTypename = new DocumentTransform(addTypenameToDocument);

/**
 * The cache of one server request: whole responses by operation and variables, not normalized.
 * The browser normalizes them (see `createApolloCache`). A query reads only its own response:
 * one that the normalized cache could answer from another query's data goes to the network,
 * and fragments are read from their parent's data (see `useFragment`).
 */
export class RequestResultCache extends ApolloCache {
  readonly #results = new Map<string, RequestQueryResult>();

  /** What the document carries to the browser, in the order the queries were answered. */
  results(): RequestQueryResult[] {
    return [...this.#results.values()];
  }

  #read(query: DocumentNode, variables: unknown, id?: string) {
    const key = queryResultKey(query, variables, id);
    return key ? this.#results.get(key) : undefined;
  }

  override read<TData>(options: Cache.ReadOptions<TData>) {
    const found = this.#read(
      options.query,
      options.variables,
      options.rootId ?? options.id
    );
    return (found ? found.d : null) as never;
  }

  override write<TData>(options: Cache.WriteOptions<TData>) {
    const key = queryResultKey(
      options.query,
      options.variables,
      options.dataId
    );
    const name = queryName(options.query);
    if (key && name) {
      const variables = options.variables as
        | Record<string, unknown>
        | undefined;
      this.#results.set(key, {
        o: name,
        ...(variables && Object.keys(variables).length > 0
          ? { v: variables }
          : {}),
        d: options.result,
      });
    }
    return undefined;
  }

  override diff<TData>(options: Cache.DiffOptions<TData>) {
    const found = this.#read(options.query, options.variables, options.id);
    return (
      found
        ? { result: found.d, complete: true }
        : { result: null, complete: false }
    ) as never;
  }

  override watch() {
    // Nothing changes under a render: a response arrives with the promise it waits for.
    return () => {};
  }

  override async reset() {
    this.#results.clear();
  }

  override evict() {
    return false;
  }

  override restore() {
    return this;
  }

  /** Empty: the document carries `results()`, this format holds none of the normalized state. */
  override extract() {
    return {};
  }

  override removeOptimistic() {}

  override fragmentMatches() {
    return true;
  }

  override performTransaction(transaction: (cache: ApolloCache) => void) {
    transaction(this);
  }

  override transformDocument(document: DocumentNode) {
    return addTypename.transformDocument(document);
  }
}

/** The responses of the client's cache; null when it normalizes them itself. */
export function readRequestResults(
  client: ApolloClient
): RequestQueryResult[] | null {
  return client.cache instanceof RequestResultCache
    ? client.cache.results()
    : null;
}
