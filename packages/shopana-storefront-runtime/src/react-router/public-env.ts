/** Public runtime settings sent before browser modules execute. Never serialize server secrets. */
export const PUBLIC_ENV_GLOBAL = '__shopanaPublicEnv';

export function publicEnvironmentScript(
  env: Record<string, string | undefined> = process.env
): string {
  const values = Object.fromEntries(
    Object.entries(env).filter(
      ([name, value]) =>
        value !== undefined &&
        (name.startsWith('NEXT_PUBLIC_') || name.startsWith('PUBLIC_'))
    )
  );
  const json = JSON.stringify(values)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  return `<script>globalThis.${PUBLIC_ENV_GLOBAL}=${json}</script>`;
}
