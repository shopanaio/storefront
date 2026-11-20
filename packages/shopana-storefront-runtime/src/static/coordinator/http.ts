/**
 * The REST API of the coordinator on port 3100, under `/__builder/api/` (the Tunnel routes
 * `/__builder/*` of the public hostname to it; the hybrid server and the CDN worker never take
 * it):
 *
 * - `POST hits` — servers and the CDN worker, the internal token: hits and misses.
 * - `POST builds`, `GET builds/:id`, `GET pages?dep=`, `GET status` — the operator token (a
 *   build also by OIDC: the nightly run registers itself).
 * - `POST leases`, `…/:id/heartbeat`, `…/:id/results` (NDJSON), `…/:id/complete` — the jobs of
 *   GitHub Actions with their OIDC token (or the operator token, for a run by hand).
 * - `GET health` — Swarm.
 */
import { timingSafeEqual } from 'node:crypto';
import express, { type Request, type Response } from 'express';
import type { OidcClaims } from './github';
import type { CoordinatorState, LeaseResult } from './state';

export interface CoordinatorAppOptions {
  state: CoordinatorState;
  /** Verifies an OIDC token of a job; absent: leases only with the operator token. */
  verifyOidc?: ((token: string) => Promise<OidcClaims>) | null;
  operatorToken?: string | null;
  internalToken?: string | null;
  /** More figures of the status endpoint (the feed, the dispatcher). */
  status?: () => Record<string, unknown>;
  /** A full build ended: the index is snapshot. */
  onFullBuild?: () => void;
  logger?: Pick<Console, 'warn'>;
}

/** Keys in one report of hits, misses in one report: as the server sends at most. */
const MAX_HIT_KEYS = 10_000;
const MAX_MISSES = 1_000;

function bearer(request: Request): string | null {
  const header = request.headers.authorization;
  const match = header ? /^Bearer\s+(.+)$/i.exec(header) : null;
  return match ? match[1].trim() : null;
}

function same(
  given: string | null,
  expected: string | null | undefined
): boolean {
  if (!given || !expected) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createCoordinatorApp(
  options: CoordinatorAppOptions
): express.Express {
  const { state, logger = console } = options;
  const app = express();
  app.disable('x-powered-by');
  const json = express.json({ limit: '10mb' });
  const ndjson = express.text({ type: 'application/x-ndjson', limit: '100mb' });

  type Who = 'operator' | 'job' | 'internal';
  const authorize =
    (...allowed: Who[]) =>
    async (request: Request, response: Response, next: () => void) => {
      const token = bearer(request);
      if (allowed.includes('operator') && same(token, options.operatorToken))
        return next();
      if (allowed.includes('internal') && same(token, options.internalToken))
        return next();
      if (allowed.includes('job') && token && options.verifyOidc) {
        try {
          response.locals.claims = await options.verifyOidc(token);
          return next();
        } catch (error) {
          logger.warn(
            `[static-coordinator] OIDC token refused: ${String(error)}`
          );
        }
      }
      response.status(token ? 403 : 401).json({ error: 'unauthorized' });
    };

  const api = express.Router();

  api.get('/health', (_request, response) => {
    response.json({ ok: true });
  });

  api.post(
    '/hits',
    authorize('internal', 'operator'),
    json,
    (request, response) => {
      const body = request.body as { hits?: unknown; misses?: unknown };
      const hits =
        body.hits && typeof body.hits === 'object' && !Array.isArray(body.hits)
          ? Object.fromEntries(
              Object.entries(body.hits as Record<string, unknown>)
                .slice(0, MAX_HIT_KEYS)
                .filter(([, count]) => typeof count === 'number')
            )
          : {};
      const misses = Array.isArray(body.misses)
        ? body.misses
            .filter((key): key is string => typeof key === 'string')
            .slice(0, MAX_MISSES)
        : [];
      state.recordHits(hits as Record<string, number>, misses);
      response.status(204).end();
    }
  );

  api.post(
    '/builds',
    authorize('operator', 'job'),
    json,
    (request, response) => {
      const body = request.body as {
        mode?: string;
        paths?: unknown;
        entities?: unknown;
        locales?: unknown;
        reason?: unknown;
        image?: unknown;
      };
      const strings = (value: unknown) =>
        Array.isArray(value)
          ? value.filter((item): item is string => typeof item === 'string')
          : undefined;
      if (
        body.mode !== 'full' &&
        body.mode !== 'paths' &&
        body.mode !== 'entities'
      ) {
        response.status(400).json({ error: 'mode is full, paths or entities' });
        return;
      }
      const result = state.requestBuild({
        mode: body.mode,
        paths: strings(body.paths),
        entities: strings(body.entities),
        locales: strings(body.locales),
        reason: typeof body.reason === 'string' ? body.reason : undefined,
        image: typeof body.image === 'string' ? body.image : undefined,
      });
      response.status(202).json(result);
    }
  );

  api.get('/builds/:requestId', authorize('operator'), (request, response) => {
    const build = state.buildRequest(String(request.params.requestId));
    if (!build.request && build.jobs.length === 0 && !build.dispatch) {
      response.status(404).json({ error: 'unknown request' });
      return;
    }
    response.json(build);
  });

  api.get('/pages', authorize('operator'), (request, response) => {
    const dep = typeof request.query.dep === 'string' ? request.query.dep : '';
    if (!dep) {
      response.status(400).json({ error: 'dep is required' });
      return;
    }
    response.json({ dep, pages: state.pagesByDep(dep) });
  });

  api.get('/status', authorize('operator'), (_request, response) => {
    response.json({ ...state.status(), ...options.status?.() });
  });

  api.post(
    '/leases',
    authorize('job', 'operator'),
    json,
    (request, response) => {
      const body = request.body as {
        requestId?: unknown;
        runId?: unknown;
        runAttempt?: unknown;
        capacity?: unknown;
      };
      const claims = response.locals.claims as OidcClaims | undefined;
      response.json(
        state.lease({
          requestId: typeof body.requestId === 'string' ? body.requestId : null,
          runId:
            typeof body.runId === 'string'
              ? body.runId
              : typeof claims?.run_id === 'string'
                ? claims.run_id
                : null,
          runAttempt:
            typeof body.runAttempt === 'number' ? body.runAttempt : null,
          capacity:
            typeof body.capacity === 'number' ? body.capacity : undefined,
        })
      );
    }
  );

  api.post(
    '/leases/:id/heartbeat',
    authorize('job', 'operator'),
    (request, response) => {
      response
        .status(state.heartbeat(String(request.params.id)) ? 204 : 410)
        .end();
    }
  );

  api.post(
    '/leases/:id/results',
    authorize('job', 'operator'),
    ndjson,
    (request, response) => {
      const text = typeof request.body === 'string' ? request.body : '';
      let results: LeaseResult[];
      try {
        results = text
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => JSON.parse(line) as LeaseResult);
      } catch {
        response.status(400).json({ error: 'results are NDJSON' });
        return;
      }
      response
        .status(
          state.recordResults(String(request.params.id), results) ? 204 : 410
        )
        .end();
    }
  );

  api.post(
    '/leases/:id/complete',
    authorize('job', 'operator'),
    json,
    (request, response) => {
      const body = (request.body ?? {}) as {
        fullBuild?: unknown;
        seenPages?: unknown;
      };
      const fullBuild = body.fullBuild === true;
      const done = state.complete(String(request.params.id), {
        fullBuild,
        seenPages: Array.isArray(body.seenPages)
          ? (body.seenPages as Array<{ locale: string; path: string }>)
          : undefined,
      });
      if (done && fullBuild) options.onFullBuild?.();
      response.status(done ? 204 : 410).end();
    }
  );

  app.use('/__builder/api', api);
  app.use((_request, response) => {
    response.status(404).json({ error: 'not found' });
  });
  return app;
}
