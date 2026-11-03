import path from 'node:path';
import { reactRouter } from '@react-router/dev/vite';
import { PUBLIC_ENV_GLOBAL } from './public-env';
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

/**
 * The Vite config of a storefront under React Router. The theme package is the source root:
 * `@src` and `@codegen` resolve in it, its `public` directory is served, and its `.env` files
 * fill `process.env` for the dev server. Public settings come from the server environment at
 * runtime and are sent in the document before browser modules execute. No deployment keys or
 * URLs are embedded at build time. The `react-router` export condition selects
 * the React Router implementation of the storefront facades, and the `@shopana` packages are
 * bundled into the server build, so the runtime and the SDK share one module instance.
 */
export function createRuntimeViteConfig({
  runtimeDir = path.resolve('.runtime'),
  config = {},
}: CreateRuntimeViteConfigOptions = {}): UserConfigFnObject {
  const rootDir = path.dirname(path.resolve(runtimeDir));

  return ({ mode, command }) => {
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

    // The theme's options extend these: its own conditions, aliases and defines are added, and
    // never take away the runtime condition or the theme aliases.
    return {
      ...rest,
      root: runtimeDir,
      envDir: rootDir,
      publicDir: rest.publicDir ?? path.join(rootDir, 'public'),
      plugins: [
        reactRouter(),
        ...(command === 'serve'
          ? [
              {
                name: 'shopana-dev-client-address',
                configureServer(server) {
                  server.middlewares.use((request, _response, next) => {
                    // The dev server is the direct peer: never trust forwarded client headers.
                    delete request.headers['x-forwarded-for'];
                    delete request.headers['x-real-ip'];
                    const address = request.socket.remoteAddress;
                    if (address) request.headers['x-forwarded-for'] = address;
                    next();
                  });
                },
              } satisfies import('vite').Plugin,
            ]
          : []),
        ...plugins,
      ],
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
      define,
      environments: {
        ...environments,
        client: {
          ...environments?.client,
          define: {
            ...define,
            ...environments?.client?.define,
            'process.env': `globalThis.${PUBLIC_ENV_GLOBAL}`,
          },
        },
      },
    };
  };
}
