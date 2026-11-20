/**
 * Public runtime settings: every document loads them from `/__env.js` before its modules
 * run, the hybrid server (`storefront-runtime start`) and the dev server answer it from their
 * own environment. A document, static or server-rendered, never carries them: a rotated public
 * key is a restart of the server, not a new HTML of every page. Never serialize server secrets.
 */
export const PUBLIC_ENV_GLOBAL = '__shopanaPublicEnv';

/** The address of the public settings script. */
export const PUBLIC_ENV_PATH = '/__env.js';

/** The tag every document loads the settings with, synchronously, ahead of its modules. */
export const PUBLIC_ENV_SCRIPT_TAG = `<script src="${PUBLIC_ENV_PATH}"></script>`;

/** The public settings of `env`: `NEXT_PUBLIC_*` and `PUBLIC_*`. */
export function publicEnvironment(
  env: Record<string, string | undefined> = process.env
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).filter(
      (entry): entry is [string, string] =>
        entry[1] !== undefined &&
        (entry[0].startsWith('NEXT_PUBLIC_') || entry[0].startsWith('PUBLIC_'))
    )
  );
}

/** The body of `/__env.js`: the public settings of `env` on `globalThis`. */
export function publicEnvironmentSource(
  env: Record<string, string | undefined> = process.env
): string {
  const json = JSON.stringify(publicEnvironment(env))
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  return `globalThis.${PUBLIC_ENV_GLOBAL}=${json};\n`;
}
