/**
 * `storefront-runtime static coordinator`: the service `theme-static` (one replica). It keeps
 * the index of pages, queues the pages to render (a build asked for, a page the site has not
 * yet, a moment its content changes at), dispatches runs of `static-site.yml` in GitHub Actions
 * and leases them the jobs, and snapshots its index. It renders nothing itself.
 *
 * Configured by the environment (every value but the secrets has a default):
 *
 * | Variable | |
 * | --- | --- |
 * | `STATIC_DISPATCH_DELAY_MS` (20000), `STATIC_DISPATCH_MIN_INTERVAL_MS` (60000), `STATIC_DISPATCH_STALE_MS` (600000), `STATIC_RUN_BUDGET_MS` (35 min) | dispatches |
 * | `STATIC_GITHUB_APP_ID`, `STATIC_GITHUB_INSTALLATION_ID`, `STATIC_GITHUB_APP_PRIVATE_KEY(_FILE)` | the GitHub App |
 * | `STATIC_GITHUB_REPOSITORY`, `STATIC_GITHUB_WORKFLOW` (`static-site.yml`), `STATIC_GITHUB_REF` (`main`), `STATIC_ENVIRONMENT` | the workflow and the environment |
 * | `STATIC_OIDC_WORKFLOW_REF` | the `workflow_ref` claim the leases accept |
 * | `STATIC_OPERATOR_TOKEN`, `STOREFRONT_STATIC_COORDINATOR_TOKEN` | the operator's and the servers' tokens |
 * | `STATIC_INDEX_STORE` (`STOREFRONT_STATIC_STORE`) | where the snapshots of the index go |
 * | `THEME_IMAGE` | the image of the theme the runs render with |
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import type { Server } from 'node:http';
import path from 'node:path';
import { openStaticStore, type StaticStore } from '../store';
import { openCoordinatorDb } from './db';
import { Dispatcher } from './dispatcher';
import {
  dispatchWorkflow,
  githubAppTokens,
  githubOidcVerifier,
} from './github';
import { createCoordinatorApp } from './http';
import { restoreSnapshot, takeSnapshot } from './snapshots';
import { CoordinatorState } from './state';
import { COORDINATOR_AUDIENCE } from '../run';

type Env = Record<string, string | undefined>;

const number = (env: Env, name: string, fallback: number): number => {
  const value = env[name]?.trim();
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${name} is a number of no less than 0`);
  }
  return parsed;
};

const text = (env: Env, name: string): string | null =>
  env[name]?.trim() || null;

/** A secret by value or by file (`<NAME>_FILE`, a secret of Swarm). */
function secret(env: Env, name: string): string | null {
  const file = text(env, `${name}_FILE`);
  if (file) return readFileSync(file, 'utf8').trim() || null;
  return text(env, name);
}

export interface StaticCoordinatorOptions {
  env: Env;
  port?: number;
  /** The directory of the database (the volume `theme-static-data`). */
  dataDir?: string;
  logger?: Pick<Console, 'info' | 'warn' | 'error'>;
}

export interface RunningCoordinator {
  state: CoordinatorState;
  server: Server;
  stop(): Promise<void>;
}

export async function startStaticCoordinator({
  env,
  port = number(env, 'PORT', 3100),
  dataDir = text(env, 'STATIC_DATA_DIR') ?? path.resolve('.static-coordinator'),
  logger = console,
}: StaticCoordinatorOptions): Promise<RunningCoordinator> {
  await mkdir(dataDir, { recursive: true });
  const file = path.join(dataDir, 'index.sqlite');

  const indexStoreUrl =
    text(env, 'STATIC_INDEX_STORE') ?? text(env, 'STOREFRONT_STATIC_STORE');
  const snapshotStore: StaticStore | null = indexStoreUrl
    ? openStaticStore(indexStoreUrl, { env })
    : null;
  let restored: string | null = null;
  if ((!existsSync(file) || statSync(file).size === 0) && snapshotStore) {
    restored = await restoreSnapshot(snapshotStore, file).catch(
      (error: unknown) => {
        logger.warn(
          `[static-coordinator] no snapshot restored: ${String(error)}`
        );
        return null;
      }
    );
  }
  const db = openCoordinatorDb(file);
  const state = new CoordinatorState(db, {
    leaseMs: number(env, 'STATIC_LEASE_MS', 3 * 60_000),
  });
  if (restored) {
    state.resetRuns();
    logger.info(`[static-coordinator] index restored from ${restored}`);
  }
  const image = text(env, 'THEME_IMAGE');
  if (image && !state.getSetting('current_image'))
    state.setSetting('current_image', image);

  // GitHub.
  const repository = text(env, 'STATIC_GITHUB_REPOSITORY');
  const workflow = text(env, 'STATIC_GITHUB_WORKFLOW') ?? 'static-site.yml';
  const ref = text(env, 'STATIC_GITHUB_REF') ?? 'main';
  const environment = text(env, 'STATIC_ENVIRONMENT');
  const appId = text(env, 'STATIC_GITHUB_APP_ID');
  const installationId = text(env, 'STATIC_GITHUB_INSTALLATION_ID');
  const privateKey = secret(env, 'STATIC_GITHUB_APP_PRIVATE_KEY');
  const token =
    appId && installationId && privateKey
      ? githubAppTokens({ appId, installationId, privateKey })
      : null;
  if (!token || !repository || !environment) {
    logger.warn(
      '[static-coordinator] no dispatches: set STATIC_GITHUB_APP_ID, STATIC_GITHUB_INSTALLATION_ID, ' +
        'STATIC_GITHUB_APP_PRIVATE_KEY, STATIC_GITHUB_REPOSITORY and STATIC_ENVIRONMENT'
    );
  }
  const dispatcher = new Dispatcher(
    state,
    token && repository && environment
      ? ({ requestId, mode, reason }) =>
          dispatchWorkflow(
            {
              repository,
              workflow,
              ref,
              inputs: {
                environment,
                mode,
                request_id: requestId,
                reason: reason.slice(0, 1000),
              },
            },
            token
          )
      : null,
    {
      delayMs: number(env, 'STATIC_DISPATCH_DELAY_MS', 20_000),
      minIntervalMs: number(env, 'STATIC_DISPATCH_MIN_INTERVAL_MS', 60_000),
      staleMs: number(env, 'STATIC_DISPATCH_STALE_MS', 10 * 60_000),
      runBudgetMs: number(env, 'STATIC_RUN_BUDGET_MS', 35 * 60_000),
    },
    Date.now,
    logger
  );
  const verifyOidc = repository
    ? githubOidcVerifier({
        expect: {
          audience: COORDINATOR_AUDIENCE,
          repository,
          workflowRef:
            text(env, 'STATIC_OIDC_WORKFLOW_REF') ??
            `${repository}/.github/workflows/${workflow}@refs/heads/${ref}`,
          environment: environment ?? undefined,
        },
      })
    : null;

  let snapshotting = false;
  const snapshot = () => {
    if (!snapshotStore || snapshotting) return;
    snapshotting = true;
    void takeSnapshot(db, snapshotStore)
      .then((key) => {
        state.setSetting('last_snapshot', String(Date.now()));
        logger.info(`[static-coordinator] index snapshot ${key}`);
      })
      .catch((error: unknown) =>
        logger.warn(`[static-coordinator] snapshot failed: ${String(error)}`)
      )
      .finally(() => {
        snapshotting = false;
      });
  };

  const app = createCoordinatorApp({
    state,
    verifyOidc,
    operatorToken: secret(env, 'STATIC_OPERATOR_TOKEN'),
    internalToken: secret(env, 'STOREFRONT_STATIC_COORDINATOR_TOKEN'),
    onFullBuild: snapshot,
    status: () => ({
      dispatch: Boolean(token && repository && environment),
    }),
    logger,
  });

  // The loops.
  const intervals: Array<ReturnType<typeof setInterval>> = [];
  const every = (ms: number, work: () => unknown) => {
    intervals.push(
      setInterval(() => {
        try {
          const result = work();
          if (result instanceof Promise) {
            result.catch((error: unknown) =>
              logger.error(`[static-coordinator] ${String(error)}`)
            );
          }
        } catch (error) {
          logger.error(`[static-coordinator] ${String(error)}`);
        }
      }, ms)
    );
  };
  every(1000, () => dispatcher.tick());
  every(15_000, () => state.expireLeases());
  every(30_000, () => state.enqueueExpired());
  every(60 * 60_000, () => {
    const day = new Date().toISOString().slice(0, 10);
    if (state.getSetting('hits_day') !== day) {
      state.recomputeHits();
      state.setSetting('hits_day', day);
    }
    const last = Number(state.getSetting('last_snapshot') ?? 0);
    if (Date.now() - last > 24 * 60 * 60_000) snapshot();
  });

  const server = await new Promise<Server>((resolve) => {
    const listening = app.listen(port, () => resolve(listening));
  });
  logger.info(`[static-coordinator] listening on ${port}, index ${file}`);

  const stop = async () => {
    for (const interval of intervals) clearInterval(interval);
    await new Promise<void>((resolve) => server.close(() => resolve()));
    db.close();
  };
  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.once(signal, () => {
      void stop().finally(() => process.exit(0));
    });
  }
  return { state, server, stop };
}
