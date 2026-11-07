/**
 * Keys of entities, the same whatever form their id comes in: the static site's index records
 * `<Typename>:<uuid>`, the events of the store name their entities by global id. A copy of the
 * codec of internal (`packages/graphql-global-id`) for the forms it reads: a global id is
 * `gid://shopana/<Typename>/<id>`, as text or base64url-encoded, or `<Typename>:<id>` encoded.
 * Any other id is its own key part.
 */

const GID = /^gid:\/\/shopana\/([A-Za-z][A-Za-z0-9_]*)\/(.+)$/;
const TYPED = /^([A-Z][A-Za-z0-9_]*):(.+)$/;
const BASE64URL = /^[A-Za-z0-9_-]+={0,2}$/;

export interface DecodedGlobalId {
  typename: string;
  id: string;
}

function decodeBase64Url(value: string): string | null {
  if (!BASE64URL.test(value) || value.length < 8) return null;
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const text =
      typeof atob === 'function'
        ? decodeURIComponent(
            Array.from(
              atob(normalized),
              (char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`
            ).join('')
          )
        : Buffer.from(normalized, 'base64').toString('utf8');
    // Text of another alphabet decoded by chance is not an id.
    return /^[\x20-\x7e]+$/.test(text) ? text : null;
  } catch {
    return null;
  }
}

function parseText(text: string): DecodedGlobalId | null {
  const gid = GID.exec(text);
  if (gid) return { typename: gid[1], id: decodeURIComponent(gid[2]) };
  const typed = TYPED.exec(text);
  if (typed && !typed[2].includes(':')) {
    return { typename: typed[1], id: typed[2] };
  }
  return null;
}

/** The type and raw id of a global id; null for an id of no known form. */
export function decodeGlobalId(value: string): DecodedGlobalId | null {
  const plain = parseText(value);
  if (plain && value.startsWith('gid://')) return plain;
  const decoded = decodeBase64Url(value);
  return (decoded && parseText(decoded)) || null;
}

/** The raw id of an id of any form: what the index keys by. */
export function rawId(value: string): string {
  return decodeGlobalId(value)?.id ?? value;
}

/**
 * The key of an entity: `<Typename>:<raw id>`. The type of a global id wins over `typename`
 * only when no type is given.
 */
export function entityKey(typename: string | undefined, id: string): string {
  const decoded = decodeGlobalId(id);
  return `${typename ?? decoded?.typename ?? 'Node'}:${decoded?.id ?? id}`;
}
