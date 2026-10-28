import path from 'node:path';
import { reactRouter } from '@react-router/dev/vite';
import {
  defaultClientConditions,
  defaultServerConditions,
  loadEnv,
  type Alias,
  type AliasOptions,
  type UserConfig,
  type UserConfigFnObject,
} from 'vite';

/** The export condition that resolves `@shopana/storefront/*` facades to React Router. */
export const RUNTIME_CONDITION = 'react-router';

/** Prefixes of the environment variables inlined into the browser bundle. */
export const PUBLIC_ENV_PREFIXES = ['NEXT_PUBLIC_', 'PUBLIC_'] as const;

export interface CreateRuntimeViteConfigOptions {
  /**
   * The generated runtime directory: the Vite root, a child of the theme package. `.runtime`
   * of the working directory (the theme package the CLI runs in) by default.
   */
  runtimeDir?: string;
  /**
   * The theme's Vite options: plugins, conditions, aliases, `ssr.noExternal` and defines are
   * added to the runtime's, other options override them.
   */
  config?: UserConfig;
}

/** Vite aliases in their list form; the object form is a list of prefixes. */
function toAliasList(alias: AliasOptions | undefined): Alias[] {
  if (!alias) return [];
  if (Array.isArray(alias)) return [...alias];
  return Object.entries(alias).map(([find, replacement]) => ({
    find,
    replacement: replacement as string,
  }));
}

function toList<T>(value: T | T[] | undefined): T[] {
  return value === undefined ? [] : Array.isArray(value) ? value : [value];
}

function publicEnvDefines(): Record<string, string> {
  const defines: Record<string, string> = {};
  for (const [name, value] of Object.entries(process.env)) {
    if (PUBLIC_ENV_PREFIXES.some((prefix) => name.startsWith(prefix))) {
      defines[`process.env.${name}`] = JSON.stringify(value);
    }
  }
  return defines;
}

/**
 * The Vite config of a storefront under React Router. The theme package is the source root:
 * `@src` and `@codegen` resolve in it, its `public` directory is served, and its `.env` files
 * fill `process.env` for the dev server. As under Next.js, the `NEXT_PUBLIC_*` and `PUBLIC_*`
 * variables are inlined into both builds at build time (the names the storefront config reads
 * under both runtimes); the browser bundle has an empty `process.env` otherwise, and the server
 * reads the rest at run time. The `react-router` export condition selects
 * the React Router implementation of the storefront facades, and the `@shopana` packages are
 * bundled into the server build, so the runtime and the SDK share one module instance.
 */
export function createRuntimeViteConfig({
  runtimeDir = path.resolve('.runtime'),
  config = {},
}: CreateRuntimeViteConfigOptions = {}): UserConfigFnObject {
  const rootDir = path.dirname(path.resolve(runtimeDir));

  return ({ mode }) => {
    for (const [name, value] of Object.entries(loadEnv(mode, rootDir, ''))) {
      process.env[name] ??= value;
    }
    const {
      plugins = [],
      resolve,
      ssr,
      environments,
      define,
      ...rest
    } = config;
    const publicEnv = publicEnvDefines();

    // The theme's options extend these: its own conditions, aliases and defines are added, and
    // never take away the runtime condition, the theme aliases or the public variables.
    return {
      ...rest,
      root: runtimeDir,
      envDir: rootDir,
      publicDir: rest.publicDir ?? path.join(rootDir, 'public'),
      plugins: [reactRouter(), ...plugins],
      resolve: {
        ...resolve,
        conditions: [
          RUNTIME_CONDITION,
          ...(resolve?.conditions ?? defaultClientConditions),
        ],
        alias: [
          { find: '@src', replacement: path.join(rootDir, 'src') },
          { find: '@codegen', replacement: path.join(rootDir, 'codegen') },
          ...toAliasList(resolve?.alias),
        ],
      },
      ssr: {
        ...ssr,
        noExternal:
          ssr?.noExternal === true
            ? true
            : [/^@shopana\//, ...toList(ssr?.noExternal)],
        resolve: {
          ...ssr?.resolve,
          conditions: [
            RUNTIME_CONDITION,
            ...(ssr?.resolve?.conditions ?? defaultServerConditions),
          ],
          externalConditions: [
            RUNTIME_CONDITION,
            ...(ssr?.resolve?.externalConditions ?? []),
          ],
        },
      },
      define: { ...define, ...publicEnv },
      environments: {
        ...environments,
        client: {
          ...environments?.client,
          define: {
            ...define,
            ...environments?.client?.define,
            ...publicEnv,
            'process.env': '{}',
          },
        },
      },
    };
  };
}
