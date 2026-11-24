import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  HEADER_WHITELIST,
  KEY_COMPONENTS,
  KEY_VERSION,
  acceptClass,
  canonicalJson,
  firstLanguageTag,
  handleApiRequest,
  type ApiWorkerEnv,
} from './api-worker';

/** Контракт шлюза (`infra/federation/cdn/contract.ts`): хеш состава ключа и белого списка. */
const KEY_CONTRACT = createHash('sha256')
  .update(`${KEY_COMPONENTS.join(',')}|${HEADER_WHITELIST.join(',')}`)
  .digest('hex')
  .slice(0, 8);
const env: ApiWorkerEnv = { CDN_MODE: 'on', KEY_CONTRACT, MAX_DOCUMENT_BYTES: '32768' };
const ctx = { waitUntil: () => undefined };
const PRODUCTS = 'query Products($first: Int!) {\n  products(first: $first) { id }\n}';
const MINIFIED = 'query Products($first:Int!){products(first:$first){id}}';
const sha256 = (text: string) => createHash('sha256').update(text).digest('hex');

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://pet.test/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-shopana-storefront-access-token': 'pub-token',
      'x-shopana-storefront-visitor-id': 'visitor-0123456789',
      'accept-language': 'uk-UA,uk;q=0.9,en;q=0.5',
      accept: 'application/graphql-response+json,application/json;q=0.9',
      'user-agent': 'browser',
      cookie: 'session=secret',
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

/** Шлюз за Worker: записывает запросы и отвечает заданным ответом. */
function origin(respond: (request: Request) => Response = () => cached('MISS')) {
  const requests: Request[] = [];
  const fetcher = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init);
    requests.push(request);
    return respond(request);
  }) as typeof fetch;
  return { requests, fetcher };
}

function cached(status: string, extra: Record<string, string> = {}) {
  return new Response('{"data":{}}', {
    headers: {
      'content-type': 'application/graphql-response+json',
      'content-language': 'uk',
      'cf-cache-status': status,
      'set-cookie': 'x=1',
      'cache-tag': 'sabc',
      ...extra,
    },
  });
}

describe('CDN-запрос', () => {
  it('передаёт документ размером 32 КиБ в заголовке GET', async () => {
    const query = '{' + 'a'.repeat(32_768 - '{:__typename}'.length) + ':__typename}';
    const { requests, fetcher } = origin();
    await handleApiRequest(post({ query }), env, ctx, { fetch: fetcher });
    expect(requests[0]?.method).toBe('GET');
    expect(requests[0]?.headers.get('shopana-cdn-document')).toBe(query);
  });

  it('строит GET с фиксированным порядком параметров и белым списком заголовков', async () => {
    const { requests, fetcher } = origin();
    const response = await handleApiRequest(
      post({ query: PRODUCTS, variables: { first: 4 }, operationName: 'Products' }),
      env,
      ctx,
      { fetch: fetcher }
    );
    expect(requests).toHaveLength(1);
    const sub = requests[0]!;
    expect(sub.method).toBe('GET');
    const url = new URL(sub.url);
    expect([...url.searchParams.keys()]).toEqual(['__cdn', ...KEY_COMPONENTS]);
    expect(url.searchParams.get('__cdn')).toBe(`${KEY_VERSION}.${KEY_CONTRACT}`);
    expect(url.searchParams.get('documentId')).toBe(sha256(MINIFIED));
    expect(url.searchParams.get('variables')).toBe('{"first":4}');
    expect(url.searchParams.get('t')).toBe('pub-token');
    expect(url.searchParams.get('l')).toBe('uk-ua');
    expect(url.searchParams.get('a')).toBe('gr');
    expect(sub.headers.get('shopana-cdn-document')).toBe(MINIFIED);
    expect([...sub.headers.keys()].sort()).toEqual([
      'accept',
      'shopana-cdn-document',
      'user-agent',
      'x-shopana-storefront-visitor-id',
    ]);
    expect(sub.headers.get('accept')).toBe('application/graphql-response+json');
    expect(response.headers.get('shopana-cdn')).toBe('miss');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('content-language')).toBe('uk');
    // Ответ строится по списку: cookie, Cache-Tag и прочие заголовки не передаются.
    expect(response.headers.get('set-cookie')).toBeNull();
    expect(response.headers.get('cache-tag')).toBeNull();
    expect(await response.text()).toBe('{"data":{}}');
  });

  it('одинаковый документ с разными отступами и порядком ключей переменных — один URL', async () => {
    const urls: string[] = [];
    for (const [query, variables] of [
      [PRODUCTS, { first: 4, after: null }],
      ['query Products($first:Int!){ products ( first : $first ) { id } }', { after: null, first: 4 }],
    ] as const) {
      const { requests, fetcher } = origin(() => cached('HIT'));
      await handleApiRequest(post({ query, variables }), env, ctx, { fetch: fetcher });
      urls.push(requests[0]!.url);
    }
    expect(urls[0]).toBe(urls[1]);
  });

  it('кириллица в переменных идёт в URL; в литерале документа — POST как есть', async () => {
    const { requests, fetcher } = origin(() => cached('HIT'));
    const response = await handleApiRequest(
      post({ query: 'query S($q:String){search(query:$q){id}}', variables: { q: 'корм' } }),
      env,
      ctx,
      { fetch: fetcher }
    );
    expect(response.headers.get('shopana-cdn')).toBe('hit');
    expect(new URL(requests[0]!.url).searchParams.get('variables')).toBe('{"q":"корм"}');

    const literal = origin();
    const bypass = await handleApiRequest(
      post({ query: 'query S{search(query:"корм"){id}}' }),
      env,
      ctx,
      { fetch: literal.fetcher }
    );
    expect(bypass.headers.get('shopana-cdn')).toBe('bypass:non-ascii-document');
    expect(literal.requests[0]!.method).toBe('POST');
  });

  it('статусы кеша зоны и причина шлюза', async () => {
    for (const [status, extra, expected] of [
      ['HIT', {}, 'hit'],
      ['EXPIRED', {}, 'expired'],
      ['DYNAMIC', { 'shopana-cdn-bypass': 'stage-mode-off' }, 'bypass:stage-mode-off'],
      // Некешируемый ответ на запрос под Cache Rule: Cloudflare пишет MISS, решает шлюз.
      ['MISS', { 'shopana-cdn-bypass': 'stale-version' }, 'bypass:stale-version'],
    ] as const) {
      const { fetcher } = origin(() => cached(status, extra));
      const response = await handleApiRequest(post({ query: PRODUCTS }), env, ctx, {
        fetch: fetcher,
      });
      expect(response.headers.get('shopana-cdn')).toBe(expected);
    }
  });

  it('5xx CDN-запроса уходит клиенту без повтора POST', async () => {
    const { requests, fetcher } = origin(() => new Response('down', { status: 502 }));
    const response = await handleApiRequest(post({ query: PRODUCTS }), env, ctx, {
      fetch: fetcher,
    });
    expect(response.status).toBe(502);
    expect(requests).toHaveLength(1);
  });

  it('промах дольше задержки purge отмечается slow-fill', async () => {
    const points: string[][] = [];
    let time = 0;
    const { fetcher } = origin(() => {
      time = 6000;
      return cached('MISS');
    });
    await handleApiRequest(
      post({ query: PRODUCTS }),
      { ...env, ANALYTICS: { writeDataPoint: (p) => points.push(p.blobs ?? []) } },
      ctx,
      { fetch: fetcher, now: () => time }
    );
    expect(points[0]?.slice(0, 2)).toEqual(['miss', 'slow-fill']);
  });
});

describe('POST как есть', () => {
  const cases: [string, Request, string][] = [
    ['мутация', post({ query: 'mutation M{addToCart{id}}' }), 'bypass:mutation'],
    ['подписка', post({ query: 'subscription S{events{id}}' }), 'bypass:subscription'],
    ['покупатель', post({ query: PRODUCTS }, { authorization: 'Bearer x' }), 'bypass:customer'],
    [
      'адрес покупателя',
      post({ query: PRODUCTS }, { 'shopana-storefront-buyer-ip': '1.1.1.1' }),
      'bypass:customer',
    ],
    [
      'приватный токен',
      post({ query: PRODUCTS }, { 'shopana-storefront-private-token': 'p' }),
      'bypass:private',
    ],
    ['тестовый трафик', post({ query: PRODUCTS }, { 'x-shopana-e2e-test': '1' }), 'bypass:test'],
    [
      'два токена',
      post({ query: PRODUCTS }, { 'x-shopana-storefront-access-token': 'a, b' }),
      'bypass:no-token',
    ],
    ['пакет', post([{ query: PRODUCTS }]), 'bypass:batch'],
    ['плохой JSON', post('{'), 'bypass:bad-json'],
    [
      'extensions',
      post({ query: PRODUCTS, extensions: { persistedQuery: { version: 1 } } }),
      'bypass:extensions',
    ],
    ['documentId', post({ documentId: 'x' }), 'bypass:document-id'],
    ['ошибка разбора', post({ query: 'query {' }), 'bypass:parse-error'],
    ['неоднозначная операция', post({ query: 'query A{a} query B{b}' }), 'bypass:ambiguous'],
    ['@defer', post({ query: 'query A{... @defer {a}}' }), 'bypass:stream'],
    ['поток', post({ query: PRODUCTS }, { accept: 'multipart/mixed' }), 'bypass:stream'],
    ['чужой origin', post({ query: PRODUCTS }, { origin: 'https://evil.test' }), 'bypass:cross-origin'],
    [
      'длинный документ',
      post({ query: '{__typename}'.padEnd(32_769) }),
      'bypass:long-document',
    ],
    [
      'длинный URL',
      post({ query: PRODUCTS, variables: { q: 'я'.repeat(2000) } }),
      'bypass:long-url',
    ],
    [
      'multipart',
      new Request('https://pet.test/graphql', {
        method: 'POST',
        headers: { 'content-type': 'multipart/form-data; boundary=x' },
        body: '--x--',
      }),
      'bypass:content-type',
    ],
  ];
  for (const [label, request, marker] of cases) {
    it(label, async () => {
      const { requests, fetcher } = origin(() => new Response('ok'));
      const response = await handleApiRequest(request, env, ctx, { fetch: fetcher });
      expect(response.headers.get('shopana-cdn')).toBe(marker);
      expect(requests).toHaveLength(1);
      expect(requests[0]!.method).toBe(request.method);
      // Клиентские `shopana-cdn-*` не пересылаются; cookie POST-пути — как есть.
      expect(requests[0]!.headers.get('shopana-cdn-document')).toBeNull();
    });
  }

  it('клиентские shopana-cdn-* удаляются на обоих путях', async () => {
    const forged = { 'shopana-cdn-document': 'forged', 'shopana-cdn-x': '1' };
    const bypassed = origin(() => new Response('ok'));
    await handleApiRequest(
      post({ query: 'mutation M{m}' }, forged),
      env,
      ctx,
      { fetch: bypassed.fetcher }
    );
    expect(bypassed.requests[0]!.method).toBe('POST');
    expect(bypassed.requests[0]!.headers.get('shopana-cdn-document')).toBeNull();
    expect(bypassed.requests[0]!.headers.get('shopana-cdn-x')).toBeNull();
    const cdn = origin();
    await handleApiRequest(post({ query: PRODUCTS }, forged), env, ctx, { fetch: cdn.fetcher });
    expect(cdn.requests[0]!.method).toBe('GET');
    expect(cdn.requests[0]!.headers.get('shopana-cdn-document')).toBe(MINIFIED);
    expect(cdn.requests[0]!.headers.get('shopana-cdn-x')).toBeNull();
  });

  it('некорректные привязки — как режим off', async () => {
    for (const broken of [{ KEY_CONTRACT: '' }, { MAX_DOCUMENT_BYTES: 'x' }, { MAX_DOCUMENT_BYTES: '' }]) {
      const { requests, fetcher } = origin(() => new Response('ok'));
      const response = await handleApiRequest(post({ query: PRODUCTS }), { ...env, ...broken }, ctx, {
        fetch: fetcher,
      });
      expect(response.headers.get('shopana-cdn')).toBe('bypass:off');
      expect(requests[0]!.method).toBe('POST');
    }
  });

  it('порядок проверок: GET не читает тело и не разбирается', async () => {
    const { requests, fetcher } = origin(() => new Response('ok'));
    const response = await handleApiRequest(new Request('https://pet.test/graphql'), env, ctx, {
      fetch: fetcher,
    });
    expect(response.headers.get('shopana-cdn')).toBe('bypass:method');
    expect(requests[0]!.method).toBe('GET');
  });

  it('тело без content-length больше 64 КБ пересылается целиком', async () => {
    const large = JSON.stringify({ query: PRODUCTS, pad: 'x'.repeat(70 * 1024) });
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const bytes = new TextEncoder().encode(large);
        for (let i = 0; i < bytes.length; i += 4096) {
          controller.enqueue(bytes.slice(i, i + 4096));
        }
        controller.close();
      },
    });
    const request = new Request('https://pet.test/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-shopana-storefront-access-token': 't' },
      body: stream,
      duplex: 'half',
    } as RequestInit);
    const { requests, fetcher } = origin(() => new Response('ok'));
    const response = await handleApiRequest(request, env, ctx, { fetch: fetcher });
    expect(response.headers.get('shopana-cdn')).toBe('bypass:large-body');
    expect(await requests[0]!.text()).toBe(large);
  });

  it('режим off пересылает всё как есть', async () => {
    const { requests, fetcher } = origin(() => new Response('ok'));
    const response = await handleApiRequest(post({ query: PRODUCTS }), { ...env, CDN_MODE: 'off' }, ctx, {
      fetch: fetcher,
    });
    expect(response.headers.get('shopana-cdn')).toBe('bypass:off');
    expect(requests[0]!.method).toBe('POST');
    expect(await requests[0]!.text()).toBe(JSON.stringify({ query: PRODUCTS }));
  });

  it('внешний запрос с __cdn и путь /graphql/… — 404', async () => {
    const { requests, fetcher } = origin();
    for (const url of ['https://pet.test/graphql?__cdn=1.x&documentId=a', 'https://pet.test/graphql/x']) {
      const response = await handleApiRequest(new Request(url), env, ctx, { fetch: fetcher });
      expect(response.status).toBe(404);
    }
    expect(requests).toHaveLength(0);
  });

  it('отказ подзапроса до ответа — исходный POST с телом из буфера', async () => {
    let calls = 0;
    const bodies: string[] = [];
    const fetcher = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = new Request(input, init);
      calls++;
      if (request.method === 'GET') {
        throw new Error('network');
      }
      bodies.push(await request.text());
      return new Response('ok');
    }) as typeof fetch;
    const response = await handleApiRequest(post({ query: PRODUCTS }), env, ctx, { fetch: fetcher });
    expect(calls).toBe(2);
    expect(response.headers.get('shopana-cdn')).toBe('error');
    expect(bodies).toEqual([JSON.stringify({ query: PRODUCTS })]);
  });
});

describe('нормализация ключа', () => {
  it('канонический JSON сортирует ключи', () => {
    expect(canonicalJson({ b: 1, a: { d: [1, { z: 1, y: 2 }], c: null } })).toBe(
      '{"a":{"c":null,"d":[1,{"y":2,"z":1}]},"b":1}'
    );
  });

  it('первый тег языка без q, в нижнем регистре', () => {
    expect(firstLanguageTag('ru-RU;q=0.9, en')).toBe('ru-ru');
    expect(firstLanguageTag(null)).toBeUndefined();
    expect(firstLanguageTag('*')).toBeUndefined();
    expect(firstLanguageTag(`a-${'b'.repeat(70)}`)).toBeNull();
  });

  it('класс Accept', () => {
    expect(acceptClass('application/graphql-response+json, application/json;q=0.9')).toBe('gr');
    expect(acceptClass('application/json, application/graphql-response+json;q=0.5')).toBe('json');
    expect(acceptClass('*/*')).toBe('json');
  });

  it('контракт ключа совпадает с шлюзом', () => {
    expect(KEY_CONTRACT).toBe('80bfe35a');
  });
});
