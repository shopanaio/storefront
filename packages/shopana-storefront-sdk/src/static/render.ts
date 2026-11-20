/**
 * The request of the static site builder: a guest's page rendered whole, for every buyer. The
 * builder renders in its own process (its workers), so only that process knows the key its
 * requests carry: a request from outside with the same headers is an ordinary request, however
 * the server in front of it treats them. Server only.
 */

/** What to render: `page` the page of the address, `shell` its layout and a skeleton. */
export const STATIC_RENDER_HEADER = 'x-shopana-static-render';

/** The key of this process's static renders. */
export const STATIC_RENDER_KEY_HEADER = 'x-shopana-static-render-key';

export type StaticRenderMode = 'page' | 'shell';

const RENDER_KEY = Symbol.for('shopana.storefront.staticRenderKey');

type RenderKeyHolder = { [RENDER_KEY]?: string };

/** The key of this process's static renders, made on its first render. */
function renderKey(): string {
  const holder = globalThis as RenderKeyHolder;
  holder[RENDER_KEY] ??= globalThis.crypto.randomUUID();
  return holder[RENDER_KEY];
}

/** The headers of a static render of this process. */
export function staticRenderHeaders(
  mode: StaticRenderMode
): Record<string, string> {
  return {
    [STATIC_RENDER_HEADER]: mode,
    [STATIC_RENDER_KEY_HEADER]: renderKey(),
  };
}

/**
 * What a request asks the static render for: null for any request but a static render of
 * this process.
 */
export function staticRenderMode(headers: {
  get(name: string): string | null;
}): StaticRenderMode | null {
  const key = (globalThis as RenderKeyHolder)[RENDER_KEY];
  if (!key || headers.get(STATIC_RENDER_KEY_HEADER) !== key) return null;
  return headers.get(STATIC_RENDER_HEADER) === 'shell' ? 'shell' : 'page';
}
