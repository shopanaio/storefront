/**
 * `storefront-runtime static <build | render | publish>`, run in the theme directory after
 * `storefront-runtime build`:
 *
 * - `static build [--out <dir>] [--store <url>] [--concurrency <n>]`: the whole site, into
 *   `<runtimeDir>/build/static` by default (the config's `output`), or the bucket of
 *   `STOREFRONT_STATIC_STORE` when the config publishes to `s3`.
 * - `static render <path>... [--out <dir>] [--store <url>]`: some addresses again, into a site
 *   built before.
 * - `static publish --from <url> --to <url>`: a built site copied to another store.
 * - `static run --coordinator <url> [--request-id <id>] [--run-id <id>] [--run-attempt <n>]
 *   [--budget 35m] [--capacity 500]`: a job of the coordinator in GitHub Actions: leases,
 *   renders, publishes what changed, returns the results.
 * - `static run --events <file.ndjson>`: the pages events change in a built site, rendered
 *   without a coordinator (the mapper and the aspects on real snapshots).
 *
 * Stores are `fs:<dir>` or `s3://<bucket>/<prefix>`. Requests go to the API of the theme's
 * environment (`STOREFRONT_SERVER_GRAPHQL_URL`), as a guest.
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { ServerBuild } from 'react-router';
import type { StaticSiteEntry } from '../react-router/static-site';
import {
  buildStaticSite,
  publishStaticSite,
  renderStaticPaths,
  type StaticBuildReport,
} from './builder';
import { purgerFromEnv } from './purge';
import {
  createCoordinatorClient,
  jobTokenSource,
  readEventsFile,
  runStaticEvents,
  runStaticJobs,
} from './run';
import { openStaticStore, type StaticStore } from './store';

interface ParsedArgs {
  positional: string[];
  options: Map<string, string>;
}

function parseArgs(args: readonly string[]): ParsedArgs {
  const positional: string[] = [];
  const options = new Map<string, string>();
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }
    const [name, inline] = arg.slice(2).split('=', 2);
    const value = inline ?? args[++index];
    if (value === undefined) throw new Error(`--${name} needs a value`);
    options.set(name, value);
  }
  return { positional, options };
}

/** The public origin of the store: canonical addresses and sitemaps name it. */
export function staticOrigin(env: Record<string, string | undefined>): string {
  const configured =
    env.STOREFRONT_PUBLIC_URL?.trim() || env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configured) {
    throw new Error(
      'The static site needs the public origin of the store: set STOREFRONT_PUBLIC_URL'
    );
  }
  return new URL(configured).origin;
}

async function staticSiteOf(runtimeDir: string): Promise<StaticSiteEntry> {
  const build = (await import(
    pathToFileURL(path.join(runtimeDir, 'build/server/index.js')).href
  )) as ServerBuild;
  const entry = (build.entry.module as { staticSite?: StaticSiteEntry | null })
    .staticSite;
  if (!entry) {
    throw new Error(
      'The theme has no static site: add static.config.ts (defineStaticSite) and build again'
    );
  }
  return entry;
}

/**
 * The store a command writes to: `--store`, else `--out` as a directory, else the config's:
 * the bucket of `STOREFRONT_STATIC_STORE` for `publish.store: 's3'`, its `output` directory,
 * or `build/static` of the runtime directory.
 */
async function targetStore(
  parsed: ParsedArgs,
  { themeDir, runtimeDir, env }: StaticCommandContext
): Promise<StaticStore> {
  const store = parsed.options.get('store');
  if (store) return openStaticStore(store, { cwd: themeDir, env });
  const out = parsed.options.get('out');
  if (out) return openStaticStore(`fs:${path.resolve(themeDir, out)}`);
  const { config } = await staticSiteOf(runtimeDir);
  if (config.publish?.store === 's3') {
    const address = env.STOREFRONT_STATIC_STORE?.trim();
    if (!address?.startsWith('s3://')) {
      throw new Error(
        'The static config publishes to s3: set STOREFRONT_STATIC_STORE to s3://<bucket>/<prefix>'
      );
    }
    return openStaticStore(address, { env });
  }
  return openStaticStore(
    `fs:${config.output ? path.resolve(themeDir, config.output) : path.join(runtimeDir, 'build/static')}`
  );
}

export interface StaticCommandContext {
  /** The theme directory: the working directory of the CLI. */
  themeDir: string;
  runtimeDir: string;
  env: Record<string, string | undefined>;
}

const USAGE =
  'Usage: storefront-runtime static <build | render <path>... | publish --from <store> --to <store> | ' +
  'run (--coordinator <url> | --events <file>)> ' +
  '[--out <dir>] [--store <fs:dir | s3://bucket/prefix>] [--concurrency <n>] [--budget 35m]';

/** A duration of the CLI: `35m`, `90s`, `1h`, or milliseconds. */
export function parseDuration(value: string): number {
  const match = /^(\d+(?:\.\d+)?)(ms|s|m|h)?$/.exec(value.trim());
  if (!match) throw new Error(`${value} is no duration (35m, 90s, 1h)`);
  const units = { ms: 1, s: 1000, m: 60_000, h: 3_600_000 } as const;
  return Number(match[1]) * units[(match[2] ?? 'ms') as keyof typeof units];
}

function concurrencyOf(parsed: ParsedArgs): number | undefined {
  const value = parsed.options.get('concurrency');
  if (value === undefined) return undefined;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) {
    throw new Error('--concurrency is a positive integer');
  }
  return number;
}

/** Runs a `static` command; resolves with the process exit code. */
export async function runStaticCommand(
  args: readonly string[],
  context: StaticCommandContext
): Promise<number> {
  const [subcommand, ...rest] = args;
  const parsed = parseArgs(rest);
  let report: StaticBuildReport;
  switch (subcommand) {
    case 'build':
      report = await buildStaticSite({
        runtimeDir: context.runtimeDir,
        store: await targetStore(parsed, context),
        origin: staticOrigin(context.env),
        concurrency: concurrencyOf(parsed),
        purger: purgerFromEnv(context.env),
      });
      return report.failed.length > 0 ? 1 : 0;
    case 'render':
      if (parsed.positional.length === 0) {
        console.error(USAGE);
        return 1;
      }
      report = await renderStaticPaths({
        runtimeDir: context.runtimeDir,
        store: await targetStore(parsed, context),
        origin: staticOrigin(context.env),
        concurrency: concurrencyOf(parsed),
        paths: parsed.positional,
        purger: purgerFromEnv(context.env),
      });
      return report.failed.length > 0 ? 1 : 0;
    case 'publish': {
      const from = parsed.options.get('from');
      const to = parsed.options.get('to');
      if (!from || !to) {
        console.error(USAGE);
        return 1;
      }
      await publishStaticSite({
        from: openStaticStore(from, {
          cwd: context.themeDir,
          env: context.env,
        }),
        to: openStaticStore(to, { cwd: context.themeDir, env: context.env }),
      });
      return 0;
    }
    case 'run': {
      const events = parsed.options.get('events');
      const store = await targetStore(parsed, context);
      const common = {
        runtimeDir: context.runtimeDir,
        store,
        origin: staticOrigin(context.env),
        concurrency: concurrencyOf(parsed),
        purger: purgerFromEnv(context.env),
      };
      if (events) {
        await runStaticEvents({
          ...common,
          events: await readEventsFile(path.resolve(context.themeDir, events)),
        });
        return 0;
      }
      const url =
        parsed.options.get('coordinator') ?? context.env.COORDINATOR_URL;
      if (!url) {
        console.error(USAGE);
        return 1;
      }
      const attempt = parsed.options.get('run-attempt');
      const run = await runStaticJobs({
        ...common,
        coordinator: createCoordinatorClient({
          url,
          token: jobTokenSource(context.env),
        }),
        requestId: parsed.options.get('request-id'),
        runId: parsed.options.get('run-id') ?? context.env.GITHUB_RUN_ID,
        runAttempt: attempt
          ? Number(attempt)
          : context.env.GITHUB_RUN_ATTEMPT
            ? Number(context.env.GITHUB_RUN_ATTEMPT)
            : undefined,
        budgetMs: parseDuration(parsed.options.get('budget') ?? '35m'),
        capacity: parsed.options.get('capacity')
          ? Number(parsed.options.get('capacity'))
          : undefined,
      });
      return run.failed > 0 ? 1 : 0;
    }
    default:
      console.error(USAGE);
      return 1;
  }
}
