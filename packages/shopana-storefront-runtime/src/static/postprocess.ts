/**
 * The HTML of a static page after its render: the emotion rules the page does not use dropped
 * (a long-lived process gathers every rule it ever rendered), the document's own facts for the
 * browser (`window.__shopanaStatic`), and a check that nothing private got in.
 */
import {
  STATIC_DOCUMENT_GLOBAL,
  type StaticDocumentInfo,
} from '@shopana/storefront-sdk/static';

const STYLE_TAG = /<style data-emotion="([^"]*)"([^>]*)>([\s\S]*?)<\/style>/g;

/** Every class name of the markup, styles left out. */
function markupClasses(html: string): Set<string> {
  const classes = new Set<string>();
  const markup = html.replace(STYLE_TAG, '');
  for (const match of markup.matchAll(/\sclass="([^"]*)"/g)) {
    for (const name of match[1].split(/\s+/)) if (name) classes.add(name);
  }
  return classes;
}

/**
 * The top-level blocks of a style sheet: a rule, an at-rule with its block, or a statement
 * (`@import ...;`). Strings and comments may hold braces.
 */
export function splitCssBlocks(css: string): string[] {
  const blocks: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < css.length; index += 1) {
    const char = css[index];
    if (char === '"' || char === "'") {
      // To the closing quote, past escaped ones (`"\""`).
      let end = index + 1;
      while (end < css.length && css[end] !== char) {
        end += css[end] === '\\' ? 2 : 1;
      }
      index = end;
    } else if (char === '/' && css[index + 1] === '*') {
      const end = css.indexOf('*/', index + 2);
      index = end === -1 ? css.length : end + 1;
    } else if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        blocks.push(css.slice(start, index + 1));
        start = index + 1;
      }
    } else if (char === ';' && depth === 0) {
      blocks.push(css.slice(start, index + 1));
      start = index + 1;
    }
  }
  if (start < css.length && css.slice(start).trim())
    blocks.push(css.slice(start));
  return blocks;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Drops the rules of the inline emotion styles (`<style data-emotion="<key> <id> ...">`) whose
 * classes (`<key>-<id>` of the style's ids) no element of the page has. A rule that names one
 * class the page has stays (`.css-a .css-b` with `css-b` used, `:not(.css-a)`), and so does a
 * rule of no such class (keyframes, a global style, a font). A style left without rules goes.
 */
export function pruneEmotionStyles(html: string): string {
  const classes = markupClasses(html);
  return html.replace(
    STYLE_TAG,
    (tag, names: string, rest: string, css: string) => {
      const [key, ...ids] = names.split(' ').filter(Boolean);
      if (!key || ids.length === 0) return tag;
      const classOf = new RegExp(
        `\\.${escapeRegExp(key)}-([A-Za-z0-9_-]+)`,
        'g'
      );
      const known = new Set(ids);
      const kept = new Set<string>();
      const blocks = splitCssBlocks(css).filter((block) => {
        const prelude = block.slice(0, block.indexOf('{') + 1 || block.length);
        const named = [
          ...(block.startsWith('@') ? block : prelude).matchAll(classOf),
        ]
          .map((match) => match[1])
          .filter((id) => known.has(id));
        if (named.length === 0) return true;
        const used = named.filter((id) => classes.has(`${key}-${id}`));
        if (used.length === 0) return false;
        for (const id of used) kept.add(id);
        return true;
      });
      const keptIds = ids.filter((id) => kept.has(id));
      const body = blocks.join('');
      if (!body.trim()) return '';
      return `<style data-emotion="${[key, ...keptIds].join(' ')}"${rest}>${body}</style>`;
    }
  );
}

/** The inline script with what a static document tells the browser about itself. */
export function staticDocumentScript(info: StaticDocumentInfo): string {
  const json = JSON.stringify(info).replace(/</g, '\\u003c');
  return `<script>window.${STATIC_DOCUMENT_GLOBAL}=${json}</script>`;
}

/** The document with its static facts at the end of `<head>`. */
export function withStaticDocumentInfo(
  html: string,
  info: StaticDocumentInfo
): string {
  const headEnd = html.indexOf('</head>');
  const script = staticDocumentScript(info);
  if (headEnd === -1) return script + html;
  return html.slice(0, headEnd) + script + html.slice(headEnd);
}

/** Environment values a static page must never carry. */
const PRIVATE_SETTINGS = [
  'STOREFRONT_SESSION_SECRET',
  'IAM_OAUTH_CLIENT_SECRET',
  'STOREFRONT_PRIVATE_TOKEN',
  'STOREFRONT_STATIC_S3_SECRET_ACCESS_KEY',
  'STOREFRONT_STATIC_COORDINATOR_TOKEN',
  'STOREFRONT_SERVER_GRAPHQL_URL',
];

/** What must not be in a guest's document: other visitors' or the server's. */
const PRIVATE_MARKERS = [
  // The settings come from `/__env.js`, never inline.
  '__shopanaPublicEnv=',
  // A visitor's id, a session: the builder renders without cookies.
  'shopana_storefront_visitor_id',
  'x-shopana-storefront-visitor-id',
];

/**
 * Throws when the HTML of a static page carries a private value: a server secret of the
 * builder's environment, a visitor's id, inline public settings.
 */
export function assertNoPrivateValues(
  html: string,
  env: Record<string, string | undefined> = process.env
): void {
  for (const name of PRIVATE_SETTINGS) {
    const value = env[name]?.trim();
    if (value && value.length >= 8 && html.includes(value)) {
      throw new Error(`The static page carries the value of ${name}`);
    }
  }
  for (const marker of PRIVATE_MARKERS) {
    if (html.includes(marker)) {
      throw new Error(`The static page carries "${marker}"`);
    }
  }
}
