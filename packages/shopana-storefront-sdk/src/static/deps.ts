/**
 * What a rendered page depends on, read from the Apollo state of its document (a normalized
 * cache, or the whole responses of the server's queries): the index of the static site's
 * coordinator maps every dependency to the pages that have it, and an event of the store to the
 * dependencies it changes.
 *
 * - `entity` (`Product:<uuid>`): the page shows fields of the entity; its mask says which
 *   aspects (`STATIC_FIELD_ASPECTS`). A variant's fields count for its product too: the events of
 *   the store name products.
 * - `list` (`Category:<uuid>#products`): the page shows what a connection of an entity holds.
 * - `query` (`Query#products`): the page shows a list of the root without an owner (a search,
 *   a dynamic collection), which any change of the catalog in its aspects may change.
 *
 * What every page shows (the store, its menus) is layout: kept apart, its change renders every
 * page anyway.
 */
import {
  fieldAspectMask,
  mergeFieldAspects,
  STATIC_ASPECTS,
  STATIC_FIELD_ASPECTS,
  type StaticFieldAspects,
} from '../graphql/apollo/fieldAspects';
import { fieldName, isTableField, VOLATILE_FIELDS } from './fieldClasses';
import { entityKey } from './globalId';
import { VIEWER_FIELDS } from './viewer';

export const STATIC_DEP_KINDS = { entity: 1, list: 2, query: 3 } as const;

export type StaticDepKind =
  (typeof STATIC_DEP_KINDS)[keyof typeof STATIC_DEP_KINDS];

export interface StaticPageDep {
  key: string;
  kind: StaticDepKind;
  /** Mask of `STATIC_ASPECTS`. */
  aspects: number;
}

export interface StaticPageDeps {
  /** By key, sorted. */
  deps: StaticPageDep[];
  /** Keys of the entities only the layout shows (the store, its menus), sorted. */
  layout: string[];
  /** The entity the page is of (`productByHandle`, …), or null. */
  owner: string | null;
}

export interface ExtractPageDepsOptions {
  /** A theme's aspects over the SDK's (`fieldAspects` of `static.config.ts`). */
  fieldAspects?: StaticFieldAspects;
  /** The page is in a language other than the store's default: its content is translated. */
  translated?: boolean;
}

/** Types every page shows: their objects and what only they reach are layout. */
const LAYOUT_TYPENAMES: ReadonlySet<string> = new Set([
  'Store',
  'OnlineStoreNavigationMenu',
  'Localization',
]);

/** Root fields of the layout, whatever their objects are. */
const LAYOUT_ROOT_FIELDS: ReadonlySet<string> = new Set([
  'store',
  'localization',
  'onlineStoreNavigationMenuByHandle',
  'onlineStoreNavigationMenus',
  'navigationMenus',
]);

/** Root fields that find the entity a page is of. */
const OWNER_ROOT_FIELDS: ReadonlySet<string> = new Set([
  'productByHandle',
  'categoryByHandle',
  'collectionByHandle',
  'vendorByHandle',
  'onlineStorePageByHandle',
  'storePolicyByHandle',
]);

/** Root fields of one entity (not a list of the root). */
const ENTITY_ROOT_FIELDS: ReadonlySet<string> = new Set([
  ...OWNER_ROOT_FIELDS,
  'node',
  'nodes',
]);

/** Fields that tell nothing of an object. */
const PLAIN_FIELDS: ReadonlySet<string> = new Set(['__typename', 'id']);

type Value = Record<string, unknown>;

const isRecord = (value: unknown): value is Value =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isConnection = (value: Value): boolean =>
  Array.isArray(value.edges) ||
  Array.isArray(value.nodes) ||
  (typeof value.__typename === 'string' &&
    value.__typename.endsWith('Connection'));

/** Masks of the aspects an element's change can move it in a list by (its order, its place). */
const ELEMENT_ASPECTS = STATIC_ASPECTS.pricing | STATIC_ASPECTS.availability;

/** The dependencies of an Apollo state, in either format. */
export function extractPageDeps(
  state: unknown,
  options: ExtractPageDepsOptions = {}
): StaticPageDeps {
  const aspects = mergeFieldAspects(STATIC_FIELD_ASPECTS, options.fieldAspects);
  const normalized =
    isRecord(state) && !Array.isArray(state) ? (state as Value) : null;

  const entities = new Map<string, number>();
  const layout = new Set<string>();
  /** Lists and queries, with the entities they hold. */
  const lists = new Map<
    string,
    { kind: StaticDepKind; elements: Set<string> }
  >();
  let owner: string | null = null;

  const addEntity = (key: string, mask: number) =>
    entities.set(key, (entities.get(key) ?? 0) | mask);

  const listOf = (key: string, kind: StaticDepKind) => {
    let list = lists.get(key);
    if (!list) {
      list = { kind, elements: new Set() };
      lists.set(key, list);
    }
    return list;
  };

  /** Records of a normalized state visited, by mode. */
  const visited = new Set<string>();

  interface Context {
    inLayout: boolean;
    /** The product of the variants inside. */
    product?: string;
    /** The list the entity found first goes to. */
    list?: Set<string>;
  }

  const resolve = (value: Value): Value | null => {
    if (typeof value.__ref !== 'string') return value;
    const record = normalized?.[value.__ref];
    return isRecord(record) ? record : null;
  };

  /** Visits an object, resolving references; resolves with the entity key it is, if any. */
  const visit = (raw: unknown, context: Context): string | null => {
    if (Array.isArray(raw)) {
      for (const item of raw) visit(item, context);
      return null;
    }
    if (!isRecord(raw)) return null;
    const reference = typeof raw.__ref === 'string' ? raw.__ref : null;
    const value = resolve(raw);
    if (!value) return null;
    const typename =
      typeof value.__typename === 'string' ? value.__typename : undefined;
    const id =
      typeof value.id === 'string' || typeof value.id === 'number'
        ? String(value.id)
        : null;
    const key = typename && id ? entityKey(typename, id) : null;
    const inLayout =
      context.inLayout || Boolean(typename && LAYOUT_TYPENAMES.has(typename));

    if (key) {
      context.list?.add(key);
      if (inLayout) {
        if (!entities.has(key)) layout.add(key);
      } else {
        layout.delete(key);
        addEntity(key, 0);
      }
    }
    if (reference) {
      const mode = `${reference}|${inLayout ? 'l' : 'p'}|${context.product ?? ''}`;
      if (visited.has(mode)) return key;
      visited.add(mode);
    }

    if (typename === 'DynamicCollection' && !key && !inLayout) {
      // A dynamic collection has no id: its rules name categories, tags and vendors, so any
      // product may enter it.
      const list = listOf('Query#dynamicCollection', STATIC_DEP_KINDS.query);
      for (const field of Object.values(value)) {
        visit(field, { inLayout, list: list.elements });
      }
      return null;
    }

    const product =
      typename === 'Product' && key
        ? key
        : typename === 'ProductVariant'
          ? (productOf(value) ?? context.product)
          : context.product;

    for (const [field, fieldValue] of Object.entries(value)) {
      if (PLAIN_FIELDS.has(field)) continue;
      if (isTableField(VOLATILE_FIELDS, typename, field)) continue;
      const name = fieldName(field);
      if (key && !inLayout && !isViewerOnly(typename, field)) {
        const mask = fieldAspectMask(aspects, typename, name);
        addEntity(key, mask);
        if (typename === 'ProductVariant' && product) addEntity(product, mask);
      }
      const child = isRecord(fieldValue) ? resolve(fieldValue) : null;
      if (key && !inLayout && child && isConnection(child)) {
        const list = listOf(`${key}#${name}`, STATIC_DEP_KINDS.list);
        visit(child, { inLayout, product, list: list.elements });
        continue;
      }
      visit(fieldValue, {
        inLayout,
        product,
        // Inside a connection the list goes down to its elements, not into them.
        list: key ? undefined : context.list,
      });
    }
    return key;
  };

  const productOf = (variant: Value): string | null => {
    const product = isRecord(variant.product) ? resolve(variant.product) : null;
    if (!product) return null;
    const id =
      typeof product.id === 'string' || typeof product.id === 'number'
        ? String(product.id)
        : null;
    return id ? entityKey('Product', id) : null;
  };

  /** A field of the root: the entity the page is of, the layout, or a list of the root. */
  const visitRootField = (field: string, value: unknown) => {
    const name = fieldName(field);
    if (name === '__typename') return;
    if (isTableField(VOLATILE_FIELDS, 'Query', field)) return;
    if (LAYOUT_ROOT_FIELDS.has(name)) {
      visit(value, { inLayout: true });
      return;
    }
    if (ENTITY_ROOT_FIELDS.has(name)) {
      const key = visit(value, { inLayout: false });
      if (OWNER_ROOT_FIELDS.has(name) && key && !owner) owner = key;
      return;
    }
    const resolved = isRecord(value) ? resolve(value) : null;
    const entity =
      resolved &&
      (typeof resolved.id === 'string' || typeof resolved.id === 'number');
    if (Array.isArray(value) || (resolved && !entity)) {
      const list = listOf(`Query#${name}`, STATIC_DEP_KINDS.query);
      visit(value, { inLayout: false, list: list.elements });
      return;
    }
    visit(value, { inLayout: false });
  };

  if (Array.isArray(state)) {
    for (const result of state as Array<{ d?: unknown }>) {
      if (!isRecord(result.d)) continue;
      for (const [field, value] of Object.entries(result.d)) {
        visitRootField(field, value);
      }
    }
  } else if (normalized) {
    const root = normalized.ROOT_QUERY;
    if (isRecord(root)) {
      for (const [field, value] of Object.entries(root)) {
        visitRootField(field, value);
      }
    }
  }

  if (options.translated) {
    for (const [key, mask] of entities) {
      if (mask & STATIC_ASPECTS.content) {
        entities.set(key, mask | STATIC_ASPECTS.translation);
      }
    }
  }

  const deps: StaticPageDep[] = [];
  for (const [key, mask] of entities) {
    deps.push({
      key,
      kind: STATIC_DEP_KINDS.entity,
      aspects: mask || STATIC_ASPECTS.content,
    });
  }
  for (const [key, list] of lists) {
    let mask = STATIC_ASPECTS.membership;
    for (const element of list.elements) {
      mask |= (entities.get(element) ?? 0) & ELEMENT_ASPECTS;
    }
    deps.push({ key, kind: list.kind, aspects: mask });
  }
  deps.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return { deps, layout: [...layout].sort(), owner };
}

/** Viewer fields other than the guest's loyalty points carry nothing of the page. */
function isViewerOnly(typename: string | undefined, field: string): boolean {
  return (
    isTableField(VIEWER_FIELDS, typename, field) &&
    fieldName(field) !== 'loyalty'
  );
}
