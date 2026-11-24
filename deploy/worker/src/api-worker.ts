/**
 * Worker API на `<хост темы>/graphql*` (plans/storefront-cdn-worker-cache.ru.md, раздел 2).
 *
 * Worker ничего не хранит: кешируемый POST анонимного публичного `query` он переводит в
 * GET-подзапрос на тот же хост, а хранит ответ кеш зоны (Cache Rule `theme_graphql_cdn`, Smart
 * Tiered Cache). Ключ — URL целиком: хеш документа, имя операции, канонические переменные,
 * публичный токен, первый тег языка и класс `Accept`. Текст документа идёт заголовком подзапроса
 * `shopana-cdn-document` и в ключ не входит. Решение о кешируемости принимает только шлюз —
 * заголовками `Cloudflare-CDN-Cache-Control` и `Cache-Tag`.
 *
 * Всё остальное (мутации, покупатель, приватный токен, пакеты, multipart, чужой origin, тестовый
 * трафик) — исходный POST к шлюзу как есть.
 */
import { Kind, parse, stripIgnoredCharacters, visit, type DocumentNode } from 'graphql';

/** Версия состава ключа; `__cdn=<KEY_VERSION>.<KEY_CONTRACT>`. */
export const KEY_VERSION = '1';
/** Параметры CDN-запроса в фиксированном порядке: кеш зоны различает строку запроса посимвольно. */
export const KEY_COMPONENTS = ['documentId', 'operationName', 'variables', 't', 'l', 'a'];
/** Заголовки подзапроса: ключевые входы — в URL, остальные заголовки клиента не передаются. */
export const HEADER_WHITELIST = [
  'accept',
  'shopana-cdn-document',
  'user-agent',
  'x-shopana-storefront-visitor-id',
];
export const MAX_BODY_BYTES = 64 * 1024;
export const MAX_URL_BYTES = 8 * 1024;
const MAX_LANGUAGE_TAG = 64;
const DOCUMENT_CACHE_SIZE = 500;
/**
 * Заполнение из origin (`miss` или `expired`) дольше задержки purge шлюза
 * (`cache.cdn.purge.delay_ms`): оно могло пережить purge (метрика `slow-fill`).
 */
const SLOW_FILL_MS = 5000;

const ACCEPT_GRAPHQL_RESPONSE = 'application/graphql-response+json';
const ACCEPT_JSON = 'application/json';

export interface AnalyticsDataset {
  writeDataPoint(point: {
    blobs?: string[];
    doubles?: number[];
    indexes?: string[];
  }): void;
}

export interface ApiWorkerEnv {
  /** `on` — CDN-путь; `off` — только POST как есть. */
  CDN_MODE?: string;
  /** Хеш состава ключа и белого списка заголовков; совпадает с `CDN_KEY_CONTRACT` шлюза. */
  KEY_CONTRACT: string;
  /** Равен `gateway.storefront.max_document_bytes` шлюза. */
  MAX_DOCUMENT_BYTES?: string;
  ANALYTICS?: AnalyticsDataset;
}

export interface ApiWorkerContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException?(): void;
}

export interface ApiWorkerDeps {
  fetch?: typeof fetch;
  now?: () => number;
}

/** Документ после разбора: тип выбранной операции, минифицированный текст и его `sha256`. */
interface ParsedDocument {
  readonly error?: 'parse-error' | 'ambiguous';
  readonly operations: ReadonlyMap<string, string>;
  readonly single?: string;
  readonly incremental: boolean;
  readonly minified: string;
  readonly documentId: string;
}

/** LRU изолята по `sha256` исходного текста: один документ разбирается один раз. */
const documents = new Map<string, ParsedDocument>();

type Decision =
  | { readonly kind: 'bypass'; readonly reason: string; readonly body?: BodySource }
  | {
      readonly kind: 'cdn';
      readonly url: string;
      readonly headers: Headers;
      readonly body: BodySource;
      readonly language: string;
    };

/** Тело запроса, прочитанное до решения: буфер и, при превышении предела, остаток потока. */
interface BodySource {
  readonly buffer: Uint8Array;
  readonly rest?: ReadableStreamDefaultReader<Uint8Array>;
}

function hex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(text: string): Promise<string> {
  return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
}

/** Канонический JSON: ключи объектов отсортированы, без пробелов (`canonicalJson` шлюза). */
export function canonicalJson(value: unknown): string {
  const visitValue = (v: unknown): unknown => {
    if (v === undefined) {
      return null;
    }
    if (v === null || typeof v !== 'object') {
      return v;
    }
    if (Array.isArray(v)) {
      return v.map(visitValue);
    }
    return Object.fromEntries(
      Object.keys(v as object)
        .sort()
        .map((k) => [k, visitValue((v as Record<string, unknown>)[k])])
    );
  };
  return JSON.stringify(visitValue(value));
}

/**
 * Первый тег `Accept-Language` без `q`, в нижнем регистре: шлюз выбирает язык по нему на обоих
 * путях. `undefined` — тега нет или он некорректен; `null` — длиннее 64 символов.
 */
export function firstLanguageTag(header: string | null): string | undefined | null {
  const tag = header?.split(',', 1)[0]?.split(';', 1)[0]?.trim().toLowerCase();
  if (!tag) {
    return undefined;
  }
  if (tag.length > MAX_LANGUAGE_TAG) {
    return null;
  }
  return /^[a-z]{1,8}(?:-[a-z0-9]{1,8})*$/.test(tag) ? tag : undefined;
}

/** Класс `Accept`: `gr`, если клиент предпочитает `application/graphql-response+json`. */
export function acceptClass(header: string | null): 'gr' | 'json' {
  let best: { type: 'gr' | 'json'; q: number } | undefined;
  for (const part of (header ?? '').split(',')) {
    const [type, ...params] = part.split(';').map((value) => value.trim().toLowerCase());
    const kind =
      type === ACCEPT_GRAPHQL_RESPONSE ? 'gr' : type === ACCEPT_JSON ? 'json' : undefined;
    if (!kind) {
      continue;
    }
    const qParam = params.find((param) => param.startsWith('q='));
    const q = qParam ? Number(qParam.slice(2)) : 1;
    if (Number.isFinite(q) && q > 0 && (!best || q > best.q)) {
      best = { type: kind, q };
    }
  }
  return best?.type ?? 'json';
}

function wantsStream(header: string | null): boolean {
  const accept = (header ?? '').toLowerCase();
  return accept.includes('text/event-stream') || accept.includes('multipart/mixed');
}

function isPrintableAscii(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 0x20 || code > 0x7e) {
      return false;
    }
  }
  return true;
}

async function parseDocument(query: string): Promise<ParsedDocument> {
  const key = await sha256(query);
  const cached = documents.get(key);
  if (cached) {
    documents.delete(key);
    documents.set(key, cached);
    return cached;
  }
  let parsed: ParsedDocument;
  try {
    const document: DocumentNode = parse(query);
    const operations = new Map<string, string>();
    let single: string | undefined;
    let count = 0;
    for (const definition of document.definitions) {
      if (definition.kind === Kind.OPERATION_DEFINITION) {
        count++;
        single = definition.operation;
        if (definition.name) {
          operations.set(definition.name.value, definition.operation);
        }
      }
    }
    let incremental = false;
    visit(document, {
      Directive(node) {
        if (node.name.value === 'defer' || node.name.value === 'stream') {
          incremental = true;
        }
      },
    });
    const minified = stripIgnoredCharacters(query);
    parsed = {
      operations,
      ...(count === 1 ? { single } : {}),
      incremental,
      minified,
      documentId: await sha256(minified),
    };
  } catch {
    parsed = {
      error: 'parse-error',
      operations: new Map(),
      incremental: false,
      minified: '',
      documentId: '',
    };
  }
  documents.set(key, parsed);
  if (documents.size > DOCUMENT_CACHE_SIZE) {
    documents.delete(documents.keys().next().value!);
  }
  return parsed;
}

/** Заголовки клиента без `shopana-cdn-*`: их ставит только Worker. */
function forwardedHeaders(request: Request): Headers {
  const headers = new Headers(request.headers);
  for (const name of [...headers.keys()]) {
    if (name.startsWith('shopana-cdn-')) {
      headers.delete(name);
    }
  }
  return headers;
}

/**
 * Тело до 64 КБ. С `content-length` больше предела тело не читается; без него читается поток до
 * 64 КБ + 1 байт, и превышение даёт буфер с остатком потока.
 */
async function readBody(request: Request): Promise<BodySource | 'too-large'> {
  const declared = request.headers.get('content-length');
  if (declared !== null && Number(declared) > MAX_BODY_BYTES) {
    return 'too-large';
  }
  const reader = request.body?.getReader();
  if (!reader) {
    return { buffer: new Uint8Array() };
  }
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size <= MAX_BODY_BYTES) {
    const { done, value } = await reader.read();
    if (done) {
      return { buffer: concat(chunks, size) };
    }
    chunks.push(value);
    size += value.byteLength;
  }
  return { buffer: concat(chunks, size), rest: reader };
}

function concat(chunks: readonly Uint8Array[], size: number): Uint8Array {
  const out = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

function bodyStream(body: BodySource): BodyInit {
  if (!body.rest) {
    return body.buffer as Uint8Array<ArrayBuffer>;
  }
  const rest = body.rest;
  let first = true;
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (first) {
        first = false;
        controller.enqueue(body.buffer);
        return;
      }
      const { done, value } = await rest.read();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
    cancel(reason) {
      return rest.cancel(reason);
    },
  });
}

function singleHeader(request: Request, name: string): string | undefined {
  const value = request.headers.get(name)?.trim();
  return value && !value.includes(',') ? value : undefined;
}

/** Условия раздела 2.1 сверху вниз; тело читается только после метода и `content-type`. */
async function decide(request: Request, env: ApiWorkerEnv, url: URL): Promise<Decision> {
  const bypass = (reason: string, body?: BodySource): Decision => ({
    kind: 'bypass',
    reason,
    ...(body ? { body } : {}),
  });
  const contentType = request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase();
  if (request.method !== 'POST' || contentType !== 'application/json') {
    return bypass(request.method !== 'POST' ? 'method' : 'content-type');
  }
  const origin = request.headers.get('origin');
  if (origin !== null) {
    let host: string | undefined;
    try {
      host = new URL(origin).host;
    } catch {
      host = undefined;
    }
    if (host !== url.host) {
      return bypass('cross-origin');
    }
  }
  const body = await readBody(request);
  if (body === 'too-large') {
    return bypass('large-body');
  }
  if (body.rest) {
    return bypass('large-body', body);
  }
  try {
    return await decideBody(request, env, url, body);
  } catch {
    // Исключение после чтения тела: исходный POST с телом из буфера.
    return bypass('error', body);
  }
}

async function decideBody(
  request: Request,
  env: ApiWorkerEnv,
  url: URL,
  body: BodySource
): Promise<Decision> {
  const bypass = (reason: string, source: BodySource): Decision => ({
    kind: 'bypass',
    reason,
    body: source,
  });
  let payload: unknown;
  try {
    payload = JSON.parse(new TextDecoder().decode(body.buffer));
  } catch {
    return bypass('bad-json', body);
  }
  if (Array.isArray(payload)) {
    return bypass('batch', body);
  }
  if (!payload || typeof payload !== 'object') {
    return bypass('bad-json', body);
  }
  const params = payload as Record<string, unknown>;
  if (typeof params.query !== 'string' || !params.query) {
    return bypass(params.documentId !== undefined ? 'document-id' : 'bad-json', body);
  }
  if (params.documentId !== undefined) {
    return bypass('document-id', body);
  }
  if (
    params.extensions !== undefined &&
    params.extensions !== null &&
    (typeof params.extensions !== 'object' || Object.keys(params.extensions).length > 0)
  ) {
    return bypass('extensions', body);
  }
  if (params.operationName !== undefined && params.operationName !== null && typeof params.operationName !== 'string') {
    return bypass('bad-json', body);
  }
  if (
    params.variables !== undefined &&
    params.variables !== null &&
    (typeof params.variables !== 'object' || Array.isArray(params.variables))
  ) {
    return bypass('bad-json', body);
  }
  if (
    request.headers.has('authorization') ||
    [...request.headers.keys()].some((name) => name.startsWith('shopana-storefront-buyer-'))
  ) {
    return bypass('customer', body);
  }
  if (request.headers.has('shopana-storefront-private-token')) {
    return bypass('private', body);
  }
  if (request.headers.has('x-shopana-e2e-test')) {
    return bypass('test', body);
  }
  const token = singleHeader(request, 'x-shopana-storefront-access-token');
  if (!token) {
    return bypass('no-token', body);
  }
  if (wantsStream(request.headers.get('accept'))) {
    return bypass('stream', body);
  }
  const query = params.query;
  // Привязка проверена до решения (`cdnConfigured`).
  const maxDocument = maxDocumentBytes(env)!;
  if (new TextEncoder().encode(query).byteLength > maxDocument) {
    // Шлюз отклоняет такой документ на всех путях; своей ошибки у Worker нет.
    return bypass('long-document', body);
  }
  const document = await parseDocument(query);
  if (document.error) {
    return bypass(document.error, body);
  }
  const operationName = typeof params.operationName === 'string' ? params.operationName : '';
  const type = operationName ? document.operations.get(operationName) : document.single;
  if (!type) {
    return bypass(operationName ? 'parse-error' : 'ambiguous', body);
  }
  if (type !== 'query') {
    return bypass(type, body);
  }
  if (document.incremental) {
    return bypass('stream', body);
  }
  if (!isPrintableAscii(document.minified)) {
    return bypass('non-ascii-document', body);
  }
  const language = firstLanguageTag(request.headers.get('accept-language'));
  if (language === null) {
    return bypass('long-language', body);
  }
  const accept = acceptClass(request.headers.get('accept'));
  const variables =
    params.variables && Object.keys(params.variables as object).length
      ? canonicalJson(params.variables)
      : '';
  const values: Record<string, string> = {
    documentId: document.documentId,
    operationName,
    variables,
    t: token,
    l: language ?? '',
    a: accept,
  };
  const search = [
    `__cdn=${encodeURIComponent(`${KEY_VERSION}.${env.KEY_CONTRACT}`)}`,
    ...KEY_COMPONENTS.map((name) => `${name}=${encodeURIComponent(values[name]!)}`),
  ].join('&');
  const target = `${url.origin}/graphql?${search}`;
  if (new TextEncoder().encode(target).byteLength > MAX_URL_BYTES) {
    return bypass('long-url', body);
  }
  // Заголовки подзапроса строятся по белому списку, который входит в `KEY_CONTRACT`.
  const headers = new Headers();
  for (const name of HEADER_WHITELIST) {
    const value =
      name === 'accept'
        ? accept === 'gr'
          ? ACCEPT_GRAPHQL_RESPONSE
          : ACCEPT_JSON
        : name === 'shopana-cdn-document'
          ? document.minified
          : request.headers.get(name);
    if (value !== null) {
      headers.set(name, value);
    }
  }
  return { kind: 'cdn', url: target, headers, body, language: language ?? '' };
}

/** Предел документа из привязки; `undefined` — привязка некорректна. */
function maxDocumentBytes(env: ApiWorkerEnv): number | undefined {
  const value = Number(env.MAX_DOCUMENT_BYTES ?? 32768);
  return Number.isInteger(value) && value > 0 ? value : undefined;
}

/** Привязки CDN-пути корректны: иначе Worker работает как в режиме `off`. */
function cdnConfigured(env: ApiWorkerEnv): boolean {
  return /^[0-9a-f]{8}$/.test(env.KEY_CONTRACT ?? '') && maxDocumentBytes(env) !== undefined;
}

/**
 * Итог CDN-запроса. Явный обход шлюза важнее `cf-cache-status`: некешируемый ответ на
 * кешируемый по Cache Rule запрос Cloudflare помечает `MISS`. Копия в кеше заголовка обхода не
 * несёт — шлюз ставит его только на некешируемый ответ.
 */
function cdnStatus(response: Response): string {
  const bypass = response.headers.get('shopana-cdn-bypass');
  if (bypass) {
    return `bypass:${bypass}`;
  }
  switch (response.headers.get('cf-cache-status')?.toUpperCase()) {
    case 'HIT':
    case 'REVALIDATED':
    case 'UPDATING':
    case 'STALE':
      return 'hit';
    case 'MISS':
      return 'miss';
    case 'EXPIRED':
      return 'expired';
    default:
      return 'bypass:origin';
  }
}

/** Исходный POST к шлюзу: тело — нетронутый поток или прочитанный буфер с остатком. */
async function forward(
  request: Request,
  upstream: typeof fetch,
  marker: string,
  body?: BodySource
): Promise<Response> {
  const init: RequestInit = {
    method: request.method,
    headers: forwardedHeaders(request),
    redirect: 'manual',
  };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = body ? bodyStream(body) : request.body;
    (init as { duplex?: string }).duplex = 'half';
  }
  const response = await upstream(new Request(request.url, init));
  const copy = new Response(response.body, response);
  copy.headers.set('Shopana-Cdn', marker);
  return copy;
}

function record(
  env: ApiWorkerEnv,
  request: Request,
  result: string,
  reason: string,
  durationMs: number,
  language = ''
) {
  try {
    const colo = (request as { cf?: { colo?: string } }).cf?.colo ?? '';
    env.ANALYTICS?.writeDataPoint({
      blobs: [result, reason, colo, language],
      doubles: [durationMs],
      indexes: [result],
    });
  } catch {
    // Метрика не меняет ответ.
  }
}

export async function handleApiRequest(
  request: Request,
  env: ApiWorkerEnv,
  ctx: ApiWorkerContext,
  deps: ApiWorkerDeps = {}
): Promise<Response> {
  const upstream = deps.fetch ?? fetch;
  const now = deps.now ?? (() => Date.now());
  const started = now();
  const url = new URL(request.url);
  const early = (reason: string) => {
    record(env, request, 'bypass', reason, now() - started);
    return forward(request, upstream, `bypass:${reason}`);
  };
  if (url.pathname !== '/graphql') {
    if (url.pathname.startsWith('/graphql/')) {
      record(env, request, 'bypass', 'not-found', now() - started);
      return new Response('Not found', { status: 404 });
    }
    return early('path');
  }
  // CDN-запрос строит только Worker: снаружи на этом пути он не принимается.
  if (url.searchParams.has('__cdn')) {
    record(env, request, 'bypass', 'cdn-external', now() - started);
    return new Response('Not found', { status: 404 });
  }
  if (url.search) {
    return early('query');
  }
  if (env.CDN_MODE !== 'on') {
    return early('off');
  }
  if (!cdnConfigured(env)) {
    record(env, request, 'error', 'config', now() - started);
    return forward(request, upstream, 'bypass:off');
  }
  let decision: Decision;
  try {
    decision = await decide(request, env, url);
  } catch {
    record(env, request, 'error', 'decide', now() - started);
    // Исключение при чтении тела: поток уже занят, повторить исходный POST нельзя.
    if (request.bodyUsed || request.body?.locked) {
      return new Response('Bad gateway', {
        status: 502,
        headers: { 'Cache-Control': 'private, no-store', 'Shopana-Cdn': 'error' },
      });
    }
    return forward(request, upstream, 'error');
  }
  if (decision.kind === 'bypass') {
    const failed = decision.reason === 'error';
    record(env, request, failed ? 'error' : 'bypass', decision.reason, now() - started);
    return forward(
      request,
      upstream,
      failed ? 'error' : `bypass:${decision.reason}`,
      decision.body
    );
  }
  let response: Response;
  try {
    response = await upstream(
      new Request(decision.url, { method: 'GET', headers: decision.headers, redirect: 'manual' })
    );
  } catch {
    record(env, request, 'error', 'subrequest', now() - started, decision.language);
    return forward(request, upstream, 'error', decision.body);
  }
  // 5xx уходит клиенту как есть: повтор POST удвоил бы нагрузку при отказе шлюза.
  const status = cdnStatus(response);
  const duration = now() - started;
  const result = status.startsWith('bypass:') ? 'bypass' : status;
  const reason =
    (status === 'miss' || status === 'expired') && duration > SLOW_FILL_MS
      ? 'slow-fill'
      : status.startsWith('bypass:')
        ? status.slice('bypass:'.length)
        : 'ok';
  record(env, request, result, reason, duration, decision.language);
  const headers = new Headers({ 'Cache-Control': 'private, no-store', 'Shopana-Cdn': status });
  for (const name of ['content-type', 'content-language']) {
    const value = response.headers.get(name);
    if (value !== null) {
      headers.set(name, value);
    }
  }
  return new Response(response.body, { status: response.status, headers });
}

export default {
  fetch(request: Request, env: ApiWorkerEnv, ctx: ApiWorkerContext): Promise<Response> {
    ctx.passThroughOnException?.();
    return handleApiRequest(request, env, ctx);
  },
};
