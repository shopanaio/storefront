/**
 * The REST API of the coordinator on port 3100, under `/__builder/api/` (the Tunnel routes
 * `/__builder/*` of the public hostname to it; the hybrid server and the CDN worker never take
 * it):
 *
 * - `POST hits` — servers and the CDN worker, the internal token: hits and misses.
 * - `POST builds`, `GET builds/:id`, `GET status` — the operator token.
 * - `GET health` — Swarm.
 */
import { timingSafeEqual } from 'node:crypto';
import express, { type Request, type Response } from 'express';
import type { CoordinatorState } from './state';

export interface CoordinatorAppOptions {
  state: CoordinatorState;
  operatorToken?: string | null;
  internalToken?: string | null;
  /** More figures of the status endpoint (the renders). */
  status?: () => Record<string, unknown>;
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
  const { state } = options;
  const app = express();
  app.disable('x-powered-by');
  const json = express.json({ limit: '10mb' });

  type Who = 'operator' | 'internal';
  const authorize =
    (...allowed: Who[]) =>
    (request: Request, response: Response, next: () => void) => {
      const token = bearer(request);
      if (allowed.includes('operator') && same(token, options.operatorToken))
        return next();
      if (allowed.includes('internal') && same(token, options.internalToken))
        return next();
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

  api.post('/builds', authorize('operator'), json, (request, response) => {
    const body = request.body as {
      mode?: string;
      paths?: unknown;
      locales?: unknown;
      reason?: unknown;
      image?: unknown;
    };
    const strings = (value: unknown) =>
      Array.isArray(value)
        ? value.filter((item): item is string => typeof item === 'string')
        : undefined;
    if (body.mode !== 'full' && body.mode !== 'paths') {
      response.status(400).json({ error: 'mode is full or paths' });
      return;
    }
    const result = state.requestBuild({
      mode: body.mode,
      paths: strings(body.paths),
      locales: strings(body.locales),
      reason: typeof body.reason === 'string' ? body.reason : undefined,
      image: typeof body.image === 'string' ? body.image : undefined,
    });
    response.status(202).json(result);
  });

  api.get('/builds/:requestId', authorize('operator'), (request, response) => {
    const build = state.buildRequest(String(request.params.requestId));
    if (!build.request && build.jobs.length === 0) {
      response.status(404).json({ error: 'unknown request' });
      return;
    }
    response.json(build);
  });

  api.get('/status', authorize('operator'), (_request, response) => {
    response.json({ ...state.status(), ...options.status?.() });
  });

  app.use('/__builder/api', api);
  app.use((_request, response) => {
    response.status(404).json({ error: 'not found' });
  });
  return app;
}
