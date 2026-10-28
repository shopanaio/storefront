import path from 'node:path';
import { reactRouter } from '@react-router/dev/vite';
import {
  defaultClientConditions,
  defaultServerConditions,
  loadEnv,
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
  /** Merged over the runtime config: plugins are appended, other options override. */
  config?: UserConfig;
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
    const { plugins = [], resolve, ssr, environments, ...rest } = config;

    return {
      root: runtimeDir,
      envDir: rootDir,
      publicDir: path.join(rootDir, 'public'),
      plugins: [reactRouter(), ...plugins],
      resolve: {
        conditions: [RUNTIME_CONDITION, ...defaultClientConditions],
        ...resolve,
        alias: {
          '@src': path.join(rootDir, 'src'),
          '@codegen': path.join(rootDir, 'codegen'),
          ...(resolve?.alias as Record<string, string> | undefined),
        },
      },
      ssr: {
        noExternal: [/^@shopana\//],
        ...ssr,
        resolve: {
          conditions: [RUNTIME_CONDITION, ...defaultServerConditions],
          externalConditions: [RUNTIME_CONDITION],
          ...ssr?.resolve,
        },
      },
      define: { ...publicEnvDefines(), ...rest.define },
      environments: {
        ...environments,
        client: {
          ...environments?.client,
          define: {
            ...publicEnvDefines(),
            'process.env': '{}',
            ...rest.define,
            ...environments?.client?.define,
          },
        },
      },
      ...rest,
    };
  };
}
