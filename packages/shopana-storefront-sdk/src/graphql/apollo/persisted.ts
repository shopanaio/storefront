/**
 * Persisted documents of the SDK: every operation has an id, the SHA-256 of its printed
 * document (the operation and the fragments it uses), and the gateway knows them by a manifest
 * built with the SDK (`dist/persisted-documents.json`). The guest queries of the allow-list
 * below are sent as `GET /graphql?locale=…&documentId=…&variables=…`, without a session or a
 * visitor id: the gateway answers them with `Cache-Control: public, s-maxage=…` and the CDN
 * (or the gateway's response cache) serves one answer to every guest.
 */
import {
  ApolloLink,
  Observable,
  type DocumentNode,
  type OperationVariables,
} from '@apollo/client';
import {
  addTypenameToDocument,
  getMainDefinition,
} from '@apollo/client/utilities';
import { print } from 'graphql';

/** How long the gateway lets a class of guest answers be cached. */
export type CacheableClass =
  /** Stock, availability, prices of variants: 30 s. */
  | 'volatile'
  /** Texts of promotions: until their `validUntil`, at most 600 s. */
  | 'promotions'
  /** Listings and search: 120 s. */
  | 'listing'
  /** Variants, questions, reviews: 300 s. */
  | 'content';

/** Guest queries answered the same for every guest, by operation name. */
export const GUEST_CACHEABLE_OPERATIONS: Readonly<
  Record<string, CacheableClass>
> = {
  SdkVolatileCards: 'volatile',
  SdkVolatileVariant: 'volatile',
  SdkStorefrontPromotions: 'promotions',
};

/** A context flag: the operation is the viewer's, never a guest's cached answer. */
export const VIEWER_CONTEXT = 'shopanaViewer';

/**
 * A document as the client sends it: Apollo adds `__typename` to every selection before the
 * links see the operation, so the manifest has the document with them, and the link hashes
 * what it is given.
 */
export function persistedDocumentOf(document: DocumentNode): DocumentNode {
  return addTypenameToDocument(document);
}

const texts = new WeakMap<DocumentNode, string>();
const ids = new WeakMap<DocumentNode, Promise<string>>();

/** The text of a document as the manifest has it. */
export function persistedDocumentText(document: DocumentNode): string {
  let text = texts.get(document);
  if (text === undefined) {
    text = print(document);
    texts.set(document, text);
  }
  return text;
}

async function sha256(text: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text)
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}

/** The id of a persisted document. */
export function persistedDocumentId(document: DocumentNode): Promise<string> {
  let id = ids.get(document);
  if (!id) {
    id = sha256(persistedDocumentText(document));
    ids.set(document, id);
  }
  return id;
}

/** JSON with the keys of every object sorted: one set of variables, one URL. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

/** The address of a guest query: the locale in the query string, as the CDN keys by it. */
export async function persistedGetUrl(
  endpoint: string,
  document: DocumentNode,
  variables: OperationVariables | undefined,
  locale: string | undefined
): Promise<string> {
  const base =
    typeof window === 'undefined'
      ? endpoint
      : new URL(endpoint, window.location.href).toString();
  const url = new URL(base);
  if (locale) url.searchParams.set('locale', locale);
  url.searchParams.set('documentId', await persistedDocumentId(document));
  if (variables && Object.keys(variables).length > 0) {
    url.searchParams.set('variables', canonicalJson(variables));
  }
  return url.toString();
}

/** Whether an operation goes as a guest's cached `GET`. */
export function isGuestCacheable(operation: ApolloLink.Operation): boolean {
  const definition = getMainDefinition(operation.query);
  return (
    definition.kind === 'OperationDefinition' &&
    definition.operation === 'query' &&
    Boolean(
      operation.operationName &&
      GUEST_CACHEABLE_OPERATIONS[operation.operationName]
    ) &&
    !operation.getContext()[VIEWER_CONTEXT]
  );
}

/**
 * Sends the guest queries of the allow-list as `GET` with their document id: no
 * `Authorization`, no visitor id, no cookies, the language in the query string and in
 * `Accept-Language`. Every other operation goes on.
 */
export function createPersistedGetLink({
  uri,
  apiKeyHeader,
  apiKey,
  locale,
  fetch: fetchImpl,
}: {
  uri: string;
  apiKeyHeader: string;
  apiKey: string;
  locale?: string;
  fetch?: typeof fetch;
}): ApolloLink {
  return new ApolloLink((operation, forward) => {
    if (!isGuestCacheable(operation)) return forward(operation);
    return new Observable((observer) => {
      const controller = new AbortController();
      void persistedGetUrl(uri, operation.query, operation.variables, locale)
        .then((url) =>
          (fetchImpl ?? fetch)(url, {
            method: 'GET',
            credentials: 'omit',
            signal: controller.signal,
            headers: {
              Accept: 'application/graphql-response+json, application/json',
              [apiKeyHeader]: apiKey,
              ...(locale ? { 'Accept-Language': locale } : {}),
            },
          })
        )
        .then(async (response) => {
          const body = (await response.json()) as ApolloLink.Result;
          if (!response.ok && !body?.data) {
            throw new Error(`The gateway answered ${response.status}`);
          }
          observer.next(body);
          observer.complete();
        })
        .catch((error: unknown) => {
          if (!controller.signal.aborted) observer.error(error);
        });
      return () => controller.abort();
    });
  });
}
