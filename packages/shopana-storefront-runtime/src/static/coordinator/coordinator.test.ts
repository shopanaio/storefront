import { generateKeyPairSync, sign, type KeyObject } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  EventFeedError,
  STATIC_ASPECTS,
  STATIC_DEP_KINDS,
  type EventFeedClient,
  type StaticPageDep,
} from '@shopana/storefront-sdk/static';
import { createFsStore } from '../store';
import { openCoordinatorDb } from './db';
import { Dispatcher } from './dispatcher';
import { EventFeedLoop } from './feed';
import {
  dispatchWorkflow,
  githubAppTokens,
  githubOidcVerifier,
} from './github';
import { createCoordinatorApp } from './http';
import { PurgeQueue } from './purgeQueue';
import { restoreSnapshot, takeSnapshot } from './snapshots';
import {
  CoordinatorState,
  FULL_TARGET,
  PRIORITY,
  type LeaseResult,
} from './state';

const { entity, list } = STATIC_DEP_KINDS;
const { content, pricing, availability, membership } = STATIC_ASPECTS;

let clock: { now: number };
let state: CoordinatorState;

beforeEach(() => {
  clock = { now: Date.parse('2026-11-07T10:00:00Z') };
  state = new CoordinatorState(
    openCoordinatorDb(':memory:'),
    { eagerTop: 1 },
    () => clock.now
  );
});

const tick = (ms: number) => {
  clock.now += ms;
};

/** A published page with its dependencies, through a lease as a run would return it. */
function publish(
  pages: Array<{
    path: string;
    locale?: string;
    route?: string;
    owner?: string;
    deps: StaticPageDep[];
    layout?: string[];
    validUntil?: string | null;
  }>,
  renderStartedAt = clock.now
) {
  const { leaseId } = state.lease({ capacity: 0 });
  state.recordResults(
    leaseId,
    pages.map(
      (page): LeaseResult => ({
        jobIds: [],
        locale: page.locale ?? 'en',
        path: page.path,
        route: page.route ?? 'product',
        ownerKey: page.owner ?? null,
        outcome: 'published',
        htmlHash: `h-${page.path}`,
        dataHash: `d-${page.path}`,
        deps: page.deps,
        layout: page.layout ?? [],
        validUntil: page.validUntil ?? null,
        renderStartedAt,
      })
    )
  );
  state.complete(leaseId, {});
}

const jobs = () =>
  state.db
    .prepare(
      'SELECT locale, target, priority, state, reasons FROM jobs ORDER BY id'
    )
    .all() as Array<{
    locale: string;
    target: string;
    priority: number;
    state: string;
    reasons: string;
  }>;

const dirty = () =>
  (
    state.db
      .prepare(
        'SELECT path FROM pages WHERE dirty_since IS NOT NULL ORDER BY path'
      )
      .all() as Array<{ path: string }>
  ).map((row) => row.path);

const clearJobs = () => state.db.exec('DELETE FROM jobs');

/** A catalog: a product page, a popular category listing it, a rare vendor listing it. */
function seedCatalog() {
  publish([
    {
      path: '/products/a',
      owner: 'Product:a',
      deps: [
        {
          key: 'Product:a',
          kind: entity,
          aspects: content | pricing | availability,
        },
      ],
    },
    {
      path: '/categories/c',
      route: 'category',
      owner: 'Category:c',
      deps: [
        {
          key: 'Product:a',
          kind: entity,
          aspects: content | pricing | availability,
        },
        {
          key: 'Category:c#products',
          kind: list,
          aspects: membership | pricing,
        },
      ],
    },
    {
      path: '/vendors/v',
      route: 'vendor',
      deps: [
        {
          key: 'Product:a',
          kind: entity,
          aspects: content | pricing | availability,
        },
      ],
    },
    {
      path: '/products/b',
      owner: 'Product:b',
      // A in breadcrumbs only.
      deps: [{ key: 'Product:a', kind: entity, aspects: content }],
    },
    {
      path: '/',
      route: 'home',
      deps: [],
      layout: ['Store:s', 'OnlineStoreNavigationMenu:m'],
    },
  ]);
  // The category is the most visited page.
  state.recordHits({
    'categories/c/index.html': 50,
    'vendors/v/index.html': 1,
  });
  state.recomputeHits();
  clearJobs();
}

const productUpdated = (eventId: string, reasons: string[]) => ({
  eventId,
  topic: 'productUpdated',
  envelope: {
    id: eventId,
    topic: 'productUpdated',
    data: { productId: 'gid://shopana/Product/a', reasons },
  },
});

describe('events', () => {
  it('renders the own page and the popular ones at once, marks the rest stale', () => {
    seedCatalog();
    const applied = state.applyEvents(
      [productUpdated('e1', ['pricing'])],
      'c1'
    );
    expect(applied).toMatchObject({
      events: 1,
      eager: 2,
      dirty: 1,
      full: false,
    });
    expect(jobs().map((job) => [job.target, job.priority])).toEqual([
      ['owner:Product:a', PRIORITY.own],
      ['path:/categories/c', PRIORITY.popular],
    ]);
    // The vendor listing is stale; the product in breadcrumbs is not touched by pricing.
    expect(dirty()).toEqual(['/vendors/v']);
    expect(state.cursor()).toBe('c1');
  });

  it('only marks stock stale, never renders it at once', () => {
    seedCatalog();
    state.applyEvents([productUpdated('e1', ['inventory'])], 'c1');
    expect(jobs()).toEqual([]);
    expect(dirty()).toEqual(['/categories/c', '/products/a', '/vendors/v']);
  });

  it('takes an event once and keeps the cursor with its jobs', () => {
    seedCatalog();
    state.applyEvents([productUpdated('e1', ['content'])], 'c1');
    const first = jobs().length;
    const again = state.applyEvents([productUpdated('e1', ['content'])], 'c2');
    expect(again).toMatchObject({ events: 0, duplicates: 1 });
    expect(jobs()).toHaveLength(first);
    expect(state.cursor()).toBe('c2');
  });

  it('builds everything for the layout and for menus', () => {
    seedCatalog();
    state.applyEvents(
      [
        {
          eventId: 'e1',
          topic: 'navigationMenuUpdated',
          envelope: { id: 'e1', topic: 'navigationMenuUpdated', data: {} },
        },
      ],
      'c1'
    );
    expect(jobs().map((job) => job.target)).toEqual([FULL_TARGET]);
  });

  it('queues the new page of a new product in every language', () => {
    seedCatalog();
    publish([{ path: '/uk', locale: 'uk', route: 'home', deps: [] }]);
    clearJobs();
    state.applyEvents(
      [
        {
          eventId: 'e1',
          topic: 'productCreated',
          envelope: {
            id: 'e1',
            topic: 'productCreated',
            data: { productId: 'gid://shopana/Product/new' },
          },
        },
      ],
      'c1'
    );
    expect(
      jobs()
        .filter((job) => job.target === 'owner:Product:new')
        .map((job) => job.locale)
    ).toEqual(['en', 'uk']);
  });

  it('renders no page for a discount and purges with a CDN', () => {
    seedCatalog();
    const withCdn = new CoordinatorState(
      state.db,
      { purge: true },
      () => clock.now
    );
    withCdn.applyEvents(
      [
        {
          eventId: 'e1',
          topic: 'discountUpdated',
          envelope: { id: 'e1', topic: 'discountUpdated', data: { id: 'd' } },
        },
      ],
      'c1'
    );
    expect(jobs()).toEqual([]);
    expect(dirty()).toEqual([]);
    expect(withCdn.purgeBatch(100)).toEqual(['sf-promo', 'sf-vol']);
    // Without a CDN the queue stays empty.
    state.applyEvents([{ ...productUpdated('e2', ['pricing']) }], 'c2');
    expect(state.purgeBatch(100)).toEqual(['sf-promo', 'sf-vol']);
  });
});

describe('hits and misses', () => {
  it('queues a stale page someone opens, counts a fresh one, renders a missed address', () => {
    seedCatalog();
    state.applyEvents([productUpdated('e1', ['inventory'])], 'c1');
    state.recordHits({ 'vendors/v/index.html': 1, 'index.html': 3 }, [
      'products/unknown/index.html',
    ]);
    expect(jobs().map((job) => [job.target, job.priority])).toEqual([
      ['path:/vendors/v', PRIORITY.popular],
      ['path:/products/unknown', PRIORITY.timer],
    ]);
  });
});

describe('results', () => {
  it('clears a stale mark set before the render, keeps one set during it', () => {
    seedCatalog();
    state.applyEvents([productUpdated('e1', ['inventory'])], 'c1');
    const startedBefore = clock.now - 1;
    tick(10);
    publish([{ path: '/vendors/v', route: 'vendor', deps: [] }], startedBefore);
    expect(dirty()).toContain('/vendors/v');
    publish([{ path: '/vendors/v', route: 'vendor', deps: [] }], clock.now + 1);
    expect(dirty()).not.toContain('/vendors/v');
  });

  it('collapses jobs of a page and takes those queued before its render', () => {
    seedCatalog();
    state.enqueue({
      locale: 'en',
      target: 'path:/vendors/v',
      priority: PRIORITY.sweep,
      reason: { topic: 'a' },
    });
    state.enqueue({
      locale: 'en',
      target: 'path:/vendors/v',
      priority: PRIORITY.popular,
      reason: { topic: 'b' },
    });
    expect(jobs()).toHaveLength(1);
    expect(jobs()[0].priority).toBe(PRIORITY.popular);
    expect(JSON.parse(jobs()[0].reasons)).toEqual([
      { topic: 'a' },
      { topic: 'b' },
    ]);
    tick(5);
    publish([{ path: '/vendors/v', route: 'vendor', deps: [] }]);
    expect(jobs()).toEqual([]);
  });

  it('sends failed jobs back, three times, then to dead jobs', () => {
    state.enqueue({
      locale: 'en',
      target: 'path:/x',
      priority: 0,
      reason: { topic: 't' },
    });
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const lease = state.lease({ capacity: 10 });
      expect(lease.jobs).toHaveLength(1);
      state.recordResults(lease.leaseId, [
        {
          jobIds: [lease.jobs[0].id],
          locale: 'en',
          path: '/x',
          route: 'product',
          ownerKey: null,
          outcome: 'failed',
          htmlHash: null,
          dataHash: null,
          deps: [],
          validUntil: null,
          renderStartedAt: clock.now,
          error: 'API down',
        },
      ]);
      state.complete(lease.leaseId, {});
      tick(5 * 60_000);
    }
    expect(jobs()).toEqual([]);
    expect(state.status().deadJobs).toBe(1);
  });

  it('returns the jobs of an expired lease to the queue', () => {
    state.enqueue({
      locale: 'en',
      target: 'path:/x',
      priority: 0,
      reason: { topic: 't' },
    });
    const lease = state.lease({ capacity: 10 });
    expect(state.heartbeat(lease.leaseId)).toBe(true);
    tick(4 * 60_000);
    expect(state.heartbeat(lease.leaseId)).toBe(false);
    expect(jobs()[0].state).toBe('queued');
    expect(state.recordResults(lease.leaseId, [])).toBe(false);
  });

  it('turns the pages a full build did not see into gone and clears every stale mark', () => {
    seedCatalog();
    state.applyEvents([productUpdated('e1', ['inventory'])], 'c1');
    state.enqueue({
      locale: 'en',
      target: 'path:/vendors/v',
      priority: 2,
      reason: { topic: 'x' },
    });
    state.enqueueFull({ topic: 'manual' });
    tick(10);
    const lease = state.lease({ capacity: 10 });
    expect(lease.mode).toBe('full');
    state.complete(lease.leaseId, {
      fullBuild: true,
      seenPages: [
        { locale: 'en', path: '/products/a' },
        { locale: 'en', path: '/categories/c' },
        { locale: 'en', path: '/' },
      ],
    });
    expect(dirty()).toEqual([]);
    expect(jobs()).toEqual([]);
    expect(state.pageByPath('/vendors/v')?.status).toBe('gone');
    expect(
      state.pagesByDep('Product:a').map((page) => page.path)
    ).not.toContain('/vendors/v');
  });

  it('queues a page whose content changes by itself at its moment', () => {
    publish([
      {
        path: '/collections/s',
        route: 'collection',
        deps: [],
        validUntil: new Date(clock.now + 1000).toISOString(),
      },
    ]);
    clearJobs();
    expect(state.enqueueExpired()).toBe(0);
    tick(2000);
    expect(state.enqueueExpired()).toBe(1);
    expect(jobs()[0]).toMatchObject({
      target: 'path:/collections/s',
      priority: PRIORITY.timer,
    });
  });
});

describe('the sweep', () => {
  it('queues stale pages only when nothing is queued or leased, at most every 5 minutes', () => {
    seedCatalog();
    state.applyEvents([productUpdated('e1', ['inventory'])], 'c1');
    state.enqueue({
      locale: 'en',
      target: 'path:/other',
      priority: 1,
      reason: { topic: 't' },
    });
    expect(state.sweep()).toBe(0);
    clearJobs();
    const lease = state.lease({ capacity: 1 });
    expect(state.sweep()).toBe(0);
    state.complete(lease.leaseId, {});
    expect(state.sweep()).toBe(3);
    expect(jobs().every((job) => job.priority === PRIORITY.sweep)).toBe(true);
    clearJobs();
    tick(60_000);
    expect(state.sweep()).toBe(0);
    tick(5 * 60_000);
    expect(state.sweep()).toBe(3);
  });
});

describe('dispatches', () => {
  it('waits 20 s, keeps 60 s apart, one unclaimed at a time, none for the sweep', async () => {
    const runs: Array<{ requestId: string; reason: string }> = [];
    const dispatcher = new Dispatcher(
      state,
      async (run) => void runs.push(run),
      {},
      () => clock.now,
      { info: () => {}, warn: () => {} }
    );
    state.enqueue({
      locale: 'en',
      target: 'path:/s',
      priority: PRIORITY.sweep,
      reason: { topic: 'sweep' },
    });
    expect(await dispatcher.tick()).toBe('idle');
    state.enqueue({
      locale: 'en',
      target: 'path:/a',
      priority: 0,
      reason: { topic: 'productUpdated' },
    });
    expect(await dispatcher.tick()).toBe('accumulating');
    tick(10_000);
    state.enqueue({
      locale: 'en',
      target: 'path:/b',
      priority: 1,
      reason: { topic: 'productUpdated' },
    });
    expect(await dispatcher.tick()).toBe('accumulating');
    tick(10_000);
    expect(await dispatcher.tick()).toBe('dispatched');
    expect(runs[0].reason).toBe('productUpdated×2');
    expect(runs[0].requestId).toMatch(/^d-20261107-1000\d\d-[0-9a-f]{4}$/);
    tick(70_000);
    expect(await dispatcher.tick()).toBe('unclaimed');
    // The run claims it with its first lease and takes the jobs.
    const lease = state.lease({
      requestId: runs[0].requestId,
      runId: '1',
      capacity: 1,
    });
    state.enqueue({
      locale: 'en',
      target: 'path:/c',
      priority: 0,
      reason: { topic: 'productUpdated' },
    });
    tick(30_000);
    expect(await dispatcher.tick()).toBe('running');
    state.heartbeat(lease.leaseId);
    state.complete(lease.leaseId, {});
    expect(await dispatcher.tick()).toBe('dispatched');
    tick(11 * 60_000);
    // Never claimed for 10 minutes: stale, another goes.
    expect(await dispatcher.tick()).toBe('dispatched');
    expect(runs).toHaveLength(3);
  });
});

describe('the event feed loop', () => {
  const quiet = { info: () => {}, warn: () => {}, error: () => {} };

  it('starts with a full build, reads on while there is more, rebuilds on an expired cursor', async () => {
    const pages = [
      {
        entries: [productUpdated('e1', ['content'])],
        nextCursor: 'c2',
        hasMore: true,
      },
      { entries: [], nextCursor: 'c2', hasMore: false },
    ];
    let expired = false;
    const feed: EventFeedClient = {
      cursor: async () => (expired ? 'c-fresh' : 'c1'),
      read: async (after) => {
        if (expired && after !== 'c-fresh')
          throw new EventFeedError('CURSOR_EXPIRED', 'old');
        return (
          pages.shift() ?? { entries: [], nextCursor: after, hasMore: false }
        );
      },
    };
    const loop = new EventFeedLoop(state, feed, {
      pollMs: 2000,
      logger: quiet,
    });
    expect(await loop.pollOnce()).toBe(true);
    expect(state.cursor()).toBe('c2');
    expect(jobs().map((job) => job.target)).toContain(FULL_TARGET);
    expect(await loop.pollOnce()).toBe(false);
    clearJobs();
    expired = true;
    expect(await loop.pollOnce()).toBe(true);
    expect(state.cursor()).toBe('c-fresh');
    expect(jobs().map((job) => job.target)).toEqual([FULL_TARGET]);
  });
});

describe('the purge queue', () => {
  it('sends 100 tags a request within the rate limit', async () => {
    const withCdn = new CoordinatorState(
      state.db,
      { purge: true },
      () => clock.now
    );
    for (let index = 0; index < 250; index += 1) {
      withCdn.applyChange(
        {
          key: '',
          kinds: [],
          aspects: 0,
          purgeTags: [`sf-p-${String(index).padStart(3, '0')}`],
        },
        { topic: 't' }
      );
    }
    const sent: number[] = [];
    const queue = new PurgeQueue(
      withCdn,
      { purge: async (tags) => void sent.push(tags.length) },
      { perMinute: 5, burst: 2 },
      () => clock.now
    );
    expect(await queue.tick()).toBe(200);
    expect(sent).toEqual([100, 100]);
    expect(await queue.tick()).toBe(0);
    tick(12_000);
    expect(await queue.tick()).toBe(50);
    expect(withCdn.purgeBatch(100)).toEqual([]);
  });
});

describe('snapshots', () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), 'coordinator-'));
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('restores the index with its cursor, and drops what runs held', async () => {
    seedCatalog();
    state.setCursor('c9');
    state.enqueue({
      locale: 'en',
      target: 'path:/x',
      priority: 0,
      reason: { topic: 't' },
    });
    state.lease({ capacity: 10 });
    const store = createFsStore(path.join(dir, 'bucket'));
    for (const day of ['2026-11-01', '2026-11-02']) {
      await takeSnapshot(state.db, store, new Date(`${day}T00:00:00Z`));
    }
    const file = path.join(dir, 'restored.sqlite');
    expect(await restoreSnapshot(store, file)).toBe(
      '__builder/index/2026-11-02.sqlite.gz'
    );
    const restored = new CoordinatorState(
      openCoordinatorDb(file),
      {},
      () => clock.now
    );
    restored.resetRuns();
    expect(restored.cursor()).toBe('c9');
    expect(restored.pagesByDep('Product:a')).toHaveLength(4);
    expect(restored.status()).toMatchObject({
      queued: 1,
      leased: 0,
      activeLeases: 0,
    });
    restored.db.close();
  });
});

describe('GitHub', () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();

  it('dispatches with an installation token of the App, renewed after 50 minutes', async () => {
    let now = 0;
    const calls: Array<{ url: string; body?: unknown; auth: string | null }> =
      [];
    const fetchMock = async (url: string | URL, init?: RequestInit) => {
      calls.push({
        url: String(url),
        body: init?.body ? JSON.parse(String(init.body)) : undefined,
        auth: new Headers(init?.headers).get('authorization'),
      });
      if (String(url).endsWith('/access_tokens')) {
        return Response.json(
          { token: `inst-${calls.length}` },
          { status: 201 }
        );
      }
      return new Response(null, { status: 204 });
    };
    const token = githubAppTokens({
      appId: '123',
      installationId: '456',
      privateKey: pem,
      fetch: fetchMock,
      now: () => now,
    });
    const dispatch = {
      repository: 'shopanaio/storefront-brand-bite-and-crunch',
      workflow: 'static-site.yml',
      ref: 'main',
      inputs: {
        environment: 'stage',
        mode: 'queue',
        request_id: 'd-1',
        reason: 'productUpdated×14',
      },
    };
    await dispatchWorkflow(dispatch, token, fetchMock);
    await dispatchWorkflow(dispatch, token, fetchMock);
    now = 51 * 60_000;
    await dispatchWorkflow(dispatch, token, fetchMock);
    expect(calls.map((call) => call.url)).toEqual([
      'https://api.github.com/app/installations/456/access_tokens',
      'https://api.github.com/repos/shopanaio/storefront-brand-bite-and-crunch/actions/workflows/static-site.yml/dispatches',
      'https://api.github.com/repos/shopanaio/storefront-brand-bite-and-crunch/actions/workflows/static-site.yml/dispatches',
      'https://api.github.com/app/installations/456/access_tokens',
      'https://api.github.com/repos/shopanaio/storefront-brand-bite-and-crunch/actions/workflows/static-site.yml/dispatches',
    ]);
    expect(calls[1]).toMatchObject({
      body: { ref: 'main', inputs: dispatch.inputs },
      auth: 'Bearer inst-1',
    });
    // The App's own JWT is RS256 with the App id as issuer.
    const jwt = calls[0].auth!.slice('Bearer '.length).split('.');
    expect(
      JSON.parse(Buffer.from(jwt[1], 'base64url').toString())
    ).toMatchObject({ iss: '123' });
  });

  /** A token of GitHub Actions signed with the test key. */
  function oidcToken(
    claims: Record<string, unknown>,
    key: KeyObject = privateKey
  ) {
    const header = Buffer.from(
      JSON.stringify({ alg: 'RS256', kid: 'k1' })
    ).toString('base64url');
    const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
    const signature = sign(
      'RSA-SHA256',
      Buffer.from(`${header}.${payload}`),
      key
    ).toString('base64url');
    return `${header}.${payload}.${signature}`;
  }

  const expectation = {
    audience: 'shopana-static-coordinator',
    repository: 'shopanaio/theme',
    workflowRef:
      'shopanaio/theme/.github/workflows/static-site.yml@refs/heads/main',
    environment: 'stage',
  };
  const valid = {
    iss: 'https://token.actions.githubusercontent.com',
    aud: 'shopana-static-coordinator',
    exp: 2000,
    repository: 'shopanaio/theme',
    workflow_ref:
      'shopanaio/theme/.github/workflows/static-site.yml@refs/heads/main',
    environment: 'stage',
    run_id: '99',
  };

  it('accepts the OIDC token of its workflow only', async () => {
    let jwksCalls = 0;
    const verify = githubOidcVerifier({
      expect: expectation,
      now: () => 1000 * 1000,
      fetch: async () => {
        jwksCalls += 1;
        return Response.json({
          keys: [{ ...publicKey.export({ format: 'jwk' }), kid: 'k1' }],
        });
      },
    });
    await expect(verify(oidcToken(valid))).resolves.toMatchObject({
      run_id: '99',
    });
    await expect(
      verify(
        oidcToken({
          ...valid,
          workflow_ref:
            'shopanaio/theme/.github/workflows/x.yml@refs/heads/main',
        })
      )
    ).rejects.toThrow('Workflow');
    await expect(
      verify(oidcToken({ ...valid, repository: 'evil/theme' }))
    ).rejects.toThrow('Repository');
    await expect(
      verify(oidcToken({ ...valid, environment: 'production' }))
    ).rejects.toThrow('Environment');
    await expect(verify(oidcToken({ ...valid, aud: 'other' }))).rejects.toThrow(
      'audience'
    );
    await expect(verify(oidcToken({ ...valid, exp: 100 }))).rejects.toThrow(
      'expired'
    );
    const { privateKey: other } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
    await expect(verify(oidcToken(valid, other))).rejects.toThrow('signature');
    expect(jwksCalls).toBe(1);
  });
});

describe('the REST API', () => {
  it('takes hits with the internal token, leases with OIDC, builds and status with the operator token', async () => {
    seedCatalog();
    const app = createCoordinatorApp({
      state,
      operatorToken: 'operator',
      internalToken: 'internal',
      verifyOidc: async (token) => {
        if (token !== 'oidc') throw new Error('no');
        return { iss: '', aud: '', exp: 0, run_id: '7' };
      },
      logger: { warn: () => {} },
    });
    const server = app.listen(0);
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/__builder/api`;
    const call = (
      pathname: string,
      token: string | null,
      body?: unknown,
      type = 'application/json'
    ) =>
      fetch(`${base}${pathname}`, {
        method: body === undefined ? 'GET' : 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': type,
        },
        body:
          body === undefined
            ? undefined
            : typeof body === 'string'
              ? body
              : JSON.stringify(body),
      });
    try {
      expect((await call('/health', null)).status).toBe(200);
      expect((await call('/hits', null, { hits: {} })).status).toBe(401);
      expect((await call('/hits', 'oidc', { hits: {} })).status).toBe(403);
      expect(
        (await call('/hits', 'internal', { hits: { 'index.html': 2 } })).status
      ).toBe(204);
      expect((await call('/status', 'internal')).status).toBe(403);

      const build = await call('/builds', 'operator', {
        mode: 'entities',
        entities: ['Product:a'],
        reason: 'manual',
      });
      expect(build.status).toBe(202);
      const { requestId, jobs: queued } = (await build.json()) as {
        requestId: string;
        jobs: number;
      };
      expect(queued).toBe(4);
      const info = (await (
        await call(`/builds/${requestId}`, 'operator')
      ).json()) as { jobs: unknown[] };
      expect(info.jobs).toHaveLength(4);

      const pages = (await (
        await call('/pages?dep=Product:a', 'operator')
      ).json()) as { pages: unknown[] };
      expect(pages.pages).toHaveLength(4);

      expect((await call('/leases', 'internal', { capacity: 2 })).status).toBe(
        403
      );
      const lease = (await (
        await call('/leases', 'oidc', { capacity: 2 })
      ).json()) as {
        leaseId: string;
        jobs: Array<{ id: number; path: string; htmlHash: string }>;
      };
      expect(lease.jobs).toHaveLength(2);
      expect(lease.jobs[0].htmlHash).toBe(`h-${lease.jobs[0].path}`);
      expect(
        (await call(`/leases/${lease.leaseId}/heartbeat`, 'oidc', {})).status
      ).toBe(204);
      const result: LeaseResult = {
        jobIds: [lease.jobs[0].id],
        locale: 'en',
        path: lease.jobs[0].path,
        route: 'product',
        ownerKey: null,
        outcome: 'unchanged',
        htmlHash: `h-${lease.jobs[0].path}`,
        dataHash: `d-${lease.jobs[0].path}`,
        deps: [],
        validUntil: null,
        renderStartedAt: clock.now,
      };
      expect(
        (
          await call(
            `/leases/${lease.leaseId}/results`,
            'oidc',
            `${JSON.stringify(result)}\n`,
            'application/x-ndjson'
          )
        ).status
      ).toBe(204);
      expect(
        (await call(`/leases/${lease.leaseId}/complete`, 'oidc', {})).status
      ).toBe(204);
      expect(
        (await call(`/leases/${lease.leaseId}/heartbeat`, 'oidc', {})).status
      ).toBe(410);
      // The job not returned went back to the queue.
      const status = (await (await call('/status', 'operator')).json()) as {
        queued: number;
      };
      expect(status.queued).toBe(3);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});

describe('the coordinator service', () => {
  it('starts on its volume without a feed or GitHub and answers its health', async () => {
    const { startStaticCoordinator } = await import('./main');
    const dir = await mkdtemp(path.join(os.tmpdir(), 'coordinator-service-'));
    const quiet = { info: () => {}, warn: () => {}, error: () => {} };
    const running = await startStaticCoordinator({
      env: { STATIC_OPERATOR_TOKEN: 'op', THEME_IMAGE: 'ghcr.io/x/theme:1' },
      port: 0,
      dataDir: dir,
      logger: quiet,
    });
    try {
      const port = (running.server.address() as AddressInfo).port;
      const health = await fetch(
        `http://127.0.0.1:${port}/__builder/api/health`
      );
      expect(health.status).toBe(200);
      const status = (await (
        await fetch(`http://127.0.0.1:${port}/__builder/api/status`, {
          headers: { Authorization: 'Bearer op' },
        })
      ).json()) as { currentImage: string; dispatch: boolean; purge: boolean };
      expect(status).toMatchObject({
        currentImage: 'ghcr.io/x/theme:1',
        dispatch: false,
        purge: false,
      });
    } finally {
      await running.stop();
      await rm(dir, { recursive: true, force: true });
    }
  });
});
