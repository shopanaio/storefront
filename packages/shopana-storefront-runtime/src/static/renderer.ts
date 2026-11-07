/**
 * One page of the static site, rendered by a theme's server build: a guest's request with the
 * static render header goes through React Router's handler, as the server would answer it,
 * and its document is taken apart: status, redirect, HTML, the Apollo state it carries.
 */
import { createRequestHandler, type ServerBuild } from 'react-router';
import {
  extractPageDeps,
  findVolatileFields,
  indexStaticPage,
  type StaticFieldAspects,
  type StaticPageDeps,
  type StaticPageIndex,
} from '@shopana/storefront-sdk/static';
import {
  staticRenderHeaders,
  type StaticRenderMode,
} from '../react-router/static-render';
import { assertNoPrivateValues, pruneEmotionStyles } from './postprocess';

export interface StaticRenderRequest {
  /** The address as served: with its locale segment (`/uk/products/x`). */
  path: string;
  mode: StaticRenderMode;
  /** The BCP 47 tag of the page's language, its `Accept-Language`. */
  localeTag: string;
  /** The language is not the store's default: the page's content is translated. */
  translated?: boolean;
}

export interface StaticRenderResult extends StaticPageIndex {
  status: number;
  /** Where a redirect goes. */
  location: string | null;
  /** The document, its unused styles out; empty for a redirect. */
  html: string;
  /** The Apollo state the document carries (JSON), or null. */
  state: string | null;
  /** When the render ran. */
  renderedAt: string;
  durationMs: number;
  /** What the page depends on (`extractPageDeps`): empty without a state. */
  deps: StaticPageDeps;
}

/** A page that asked for fields no static page may have (stock, promotions). */
export class StaticVolatileFieldsError extends Error {
  constructor(
    readonly path: string,
    readonly fields: readonly string[]
  ) {
    super(
      `${path}: the page asks for fields that change without events (${fields.join(', ')}): ` +
        'take them out of its fragments, the browser asks for them (useVolatileVariant, useVolatileCard)'
    );
    this.name = 'StaticVolatileFieldsError';
  }
}

const NO_DEPS: StaticPageDeps = { deps: [], layout: [], owner: null };

const APOLLO_STATE =
  /<script>window\.__shopanaApolloState=([\s\S]*?)<\/script>/;

export interface StaticRenderer {
  render(request: StaticRenderRequest): Promise<StaticRenderResult>;
  /** Any other address of the app (`/robots.txt`, a sitemap), as a guest asks for it. */
  fetch(path: string): Promise<Response>;
}

/**
 * The renderer of a server build: `origin` is the public address of the store, the URL every
 * request has, so canonical addresses and sitemaps name it.
 */
export function createStaticRenderer(
  build: ServerBuild,
  {
    origin,
    env = process.env,
    now = () => new Date(),
    fieldAspects,
  }: {
    origin: string;
    env?: Record<string, string | undefined>;
    now?: () => Date;
    /** The theme's aspects (`fieldAspects` of `static.config.ts`). */
    fieldAspects?: StaticFieldAspects;
  }
): StaticRenderer {
  const handle = createRequestHandler(build, 'production');
  const host = new URL(origin).host;

  return {
    async render({ path, mode, localeTag, translated }) {
      const started = Date.now();
      const renderedAt = now();
      const response = await handle(
        new Request(new URL(path, origin), {
          headers: {
            ...staticRenderHeaders(mode),
            'Accept-Language': localeTag,
            Accept: 'text/html',
            Host: host,
          },
        })
      );
      const location = response.headers.get('location');
      const body =
        response.status >= 300 && response.status < 400
          ? ''
          : await response.text();
      const html = body ? pruneEmotionStyles(body) : '';
      if (html) assertNoPrivateValues(html, env);
      const state = html.match(APOLLO_STATE)?.[1] ?? null;
      const parsed: unknown = state ? JSON.parse(state) : null;
      // Stock and promotions change without events: a page that has them would be stale
      // within seconds and its hash would change with every render.
      const volatile = parsed ? findVolatileFields(parsed) : [];
      if (volatile.length > 0)
        throw new StaticVolatileFieldsError(path, volatile);
      const index = parsed
        ? indexStaticPage(parsed, renderedAt)
        : { entities: [], validUntil: null };
      const deps =
        parsed && mode === 'page'
          ? extractPageDeps(parsed, { fieldAspects, translated })
          : NO_DEPS;
      return {
        status: response.status,
        location,
        html,
        state,
        renderedAt: renderedAt.toISOString(),
        durationMs: Date.now() - started,
        deps,
        ...index,
      };
    },
    fetch(path) {
      return handle(
        new Request(new URL(path, origin), { headers: { Host: host } })
      );
    },
  };
}
