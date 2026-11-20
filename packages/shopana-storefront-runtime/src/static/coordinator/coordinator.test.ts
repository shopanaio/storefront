import { generateKeyPairSync, sign, type KeyObject } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFsStore } from '../store';
import { openCoordinatorDb } from './db';
import { Dispatcher } from './dispatcher';
import {
  dispatchWorkflow,
  githubAppTokens,
  githubOidcVerifier,
} from './github';
import { createCoordinatorApp } from './http';
import { restoreSnapshot, takeSnapshot } from './snapshots';
import { CoordinatorState, PRIORITY, type LeaseResult } from './state';

let clock: { now: number };
let state: CoordinatorState;

beforeEach(() => {
  clock = { now: Date.parse('2026-11-07T10:00:00Z') };
  state = new CoordinatorState(
    openCoordinatorDb(':memory:'),
    {},
    () => clock.now
  );
});

const tick = (ms: number) => {
  clock.now += ms;
};

/** Published pages, through a lease as a run would return them. */
function publish(
  pages: Array<{
    path: string;
    locale?: string;
    route?: string;
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
        outcome: 'published',
        htmlHash: `h-${page.path}`,
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

const clearJobs = () => state.db.exec('DELETE FROM jobs');

/** A catalog: two products, a category, a vendor and the home page. */
function seedCatalog() {
  publish([
    { path: '/products/a' },
    { path: '/products/b' },
    { path: '/categories/c', route: 'category' },
    { path: '/vendors/v', route: 'vendor' },
    { path: '/', route: 'home' },
  ]);
  clearJobs();
}

describe('hits and misses', () => {
  it('counts the hits of a page and renders a missed address', () => {
    seedCatalog();
    const counted = state.recordHits(
      { 'vendors/v/index.html': 1, 'index.html': 3 },
      ['products/unknown/index.html', 'products/a/index.html']
    );
    expect(counted).toEqual({ counted: 2, queued: 1 });
    // A hit queues nothing; a miss of a page the site has queues nothing either.
    expect(jobs().map((job) => [job.target, job.priority])).toEqual([
      ['path:/products/unknown', PRIORITY.timer],
    ]);
    state.recomputeHits();
    expect(state.pageByPath('/')?.hits_7d).toBe(3);
  });
});

describe('results', () => {
  it('collapses jobs of a page and takes those queued before its render', () => {
    seedCatalog();
    state.enqueue({
      locale: 'en',
      target: 'path:/vendors/v',
      priority: PRIORITY.timer,
      reason: { topic: 'a' },
    });
    state.enqueue({
      locale: 'en',
      target: 'path:/vendors/v',
      priority: PRIORITY.request,
      reason: { topic: 'b' },
    });
    expect(jobs()).toHaveLength(1);
    expect(jobs()[0].priority).toBe(PRIORITY.request);
    expect(JSON.parse(jobs()[0].reasons)).toEqual([
      { topic: 'a' },
      { topic: 'b' },
    ]);
    tick(5);
    publish([{ path: '/vendors/v', route: 'vendor' }]);
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
          outcome: 'failed',
          htmlHash: null,
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

  it('turns the pages a full build did not see into gone and takes the jobs before it', () => {
    seedCatalog();
    state.enqueue({
      locale: 'en',
      target: 'path:/vendors/v',
      priority: PRIORITY.timer,
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
    expect(jobs()).toEqual([]);
    expect(state.pageByPath('/vendors/v')?.status).toBe('gone');
    expect(state.pageByPath('/products/a')?.status).toBe('published');
  });

  it('queues a page whose content changes by itself at its moment', () => {
    publish([
      {
        path: '/collections/s',
        route: 'collection',
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

describe('dispatches', () => {
  it('waits 20 s, keeps 60 s apart, one unclaimed at a time', async () => {
    const runs: Array<{ requestId: string; reason: string }> = [];
    const dispatcher = new Dispatcher(
      state,
      async (run) => void runs.push(run),
      {},
      () => clock.now,
      { info: () => {}, warn: () => {} }
    );
    expect(await dispatcher.tick()).toBe('idle');
    state.enqueue({
      locale: 'en',
      target: 'path:/a',
      priority: PRIORITY.timer,
      reason: { topic: 'miss' },
    });
    expect(await dispatcher.tick()).toBe('accumulating');
    tick(10_000);
    state.enqueue({
      locale: 'en',
      target: 'path:/b',
      priority: PRIORITY.timer,
      reason: { topic: 'miss' },
    });
    expect(await dispatcher.tick()).toBe('accumulating');
    tick(10_000);
    expect(await dispatcher.tick()).toBe('dispatched');
    expect(runs[0].reason).toBe('miss×2');
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
      priority: PRIORITY.request,
      reason: { topic: 'build:paths' },
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

describe('snapshots', () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), 'coordinator-'));
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('restores the index, and drops what runs held', async () => {
    seedCatalog();
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
    expect(restored.pageByPath('/products/a')?.status).toBe('published');
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
        reason: 'miss×14',
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

      expect(
        (await call('/builds', 'operator', { mode: 'entities' })).status
      ).toBe(400);
      const build = await call('/builds', 'operator', {
        mode: 'paths',
        paths: ['/products/a', '/products/b', '/categories/c', '/vendors/v'],
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
        outcome: 'unchanged',
        htmlHash: `h-${lease.jobs[0].path}`,
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
  it('starts on its volume without GitHub and answers its health', async () => {
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
      ).json()) as { currentImage: string; dispatch: boolean };
      expect(status).toMatchObject({
        currentImage: 'ghcr.io/x/theme:1',
        dispatch: false,
      });
    } finally {
      await running.stop();
      await rm(dir, { recursive: true, force: true });
    }
  });
});
