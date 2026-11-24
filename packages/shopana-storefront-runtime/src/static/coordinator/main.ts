/**
 * `storefront-runtime static coordinator`: the service `theme-static` (one replica). It keeps
 * the index of pages, queues the pages to render (a build asked for, a page the site has not
 * yet, a moment its content changes at, the nightly full build), renders them itself with the
 * theme build of its image (`runner.ts`) into the static site's store, and snapshots its index.
 *
 * Configured by the environment (every value but the secrets has a default):
 *
 * | Variable | |
 * | --- | --- |
 * | `STOREFRONT_STATIC_STORE` | the store the pages are rendered into and the snapshots of the index go to; none: nothing is rendered |
 * | `STOREFRONT_PUBLIC_URL` (`NEXT_PUBLIC_APP_URL`), the theme's server settings | what the pages are rendered for and with |
 * | `STATIC_RENDER_CONCURRENCY` (2), `STATIC_RENDER_DELAY_MS` (20000) | pages rendered at once, the wait for a burst of jobs |
 * | `STATIC_NIGHTLY_HOUR` (1) | the hour (UTC) of the nightly full build |
 * | `STATIC_OPERATOR_TOKEN`, `STOREFRONT_STATIC_COORDINATOR_TOKEN` | the operator's and the servers' tokens |
 * | `CLOUDFLARE_PURGE_TOKEN`, `CLOUDFLARE_ZONE_ID` | purges of the pages a render changed (step B) |
 * | `CLOUDFLARE_PURGE_PLAN` (`free`) | the zone's plan: this purger keeps to half of its purge limit |
 * | `THEME_IMAGE` | the image of the theme, for the status |
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import type { Server } from 'node:http';
import path from 'node:path';
import type { StaticBuildOptions } from '../builder';
import { openStaticStore, type StaticStore } from '../store';
import { openCoordinatorDb } from './db';
import { createCoordinatorApp } from './http';
import { LocalRunner } from './runner';
import { restoreSnapshot, takeSnapshot } from './snapshots';
import { CoordinatorState } from './state';

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
  /**
   * What the pages are rendered with (the theme's runtime directory, its store, its origin);
   * none: the coordinator renders nothing.
   */
  render?: Omit<StaticBuildOptions, 'onPage' | 'concurrency'> | null;
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
  render = null,
  logger = console,
}: StaticCoordinatorOptions): Promise<RunningCoordinator> {
  await mkdir(dataDir, { recursive: true });
  const file = path.join(dataDir, 'index.sqlite');

  const indexStoreUrl = text(env, 'STOREFRONT_STATIC_STORE');
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

  if (!render) {
    logger.warn(
      '[static-coordinator] nothing is rendered: set STOREFRONT_STATIC_STORE to the bucket of the site'
    );
  }
  const runner = new LocalRunner(
    state,
    render
      ? {
          ...render,
          concurrency: number(env, 'STATIC_RENDER_CONCURRENCY', 2),
          logger,
        }
      : null,
    { delayMs: number(env, 'STATIC_RENDER_DELAY_MS', 20_000) },
    Date.now,
    logger,
    snapshot
  );
  const nightlyHour = number(env, 'STATIC_NIGHTLY_HOUR', 1);

  const app = createCoordinatorApp({
    state,
    operatorToken: secret(env, 'STATIC_OPERATOR_TOKEN'),
    internalToken: secret(env, 'STOREFRONT_STATIC_COORDINATOR_TOKEN'),
    status: () => runner.status,
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
  every(1000, () => runner.tick());
  every(15_000, () => state.expireLeases());
  every(30_000, () => state.enqueueExpired());
  every(60_000, () => state.enqueueNightly(nightlyHour));
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
