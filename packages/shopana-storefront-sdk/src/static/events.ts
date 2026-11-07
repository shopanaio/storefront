/**
 * Events of the store as changes of the static site: which dependencies of its pages
 * (`extractPageDeps`) an event changes, in which aspects, and what else it asks for (the page of
 * its own entity, a full build, tags of the CDN to purge). The coordinator reads the events from
 * the event feed of the store (`eventFeed.ts`) and finds the pages of each change in its index.
 * Pure: the order of events does not matter, a render always reads the API as it is now.
 */
import {
  ALL_STATIC_ASPECTS,
  STATIC_ASPECTS,
  type StaticAspect,
} from '../graphql/apollo/fieldAspects';
import { STATIC_DEP_KINDS, type StaticDepKind } from './deps';
import { decodeGlobalId, entityKey } from './globalId';

/** The topics the coordinator reads from the event feed. */
export const STATIC_EVENT_TOPICS: readonly string[] = [
  'productCreated',
  'productUpdated',
  'productDeleted',
  'categoryCreated',
  'categoryUpdated',
  'categoryDeleted',
  'collectionCreated',
  'collectionUpdated',
  'collectionDeleted',
  'vendorCreated',
  'vendorUpdated',
  'vendorDeleted',
  'tagCreated',
  'tagUpdated',
  'tagDeleted',
  'pageCreated',
  'pageUpdated',
  'pageDeleted',
  'navigationMenuCreated',
  'navigationMenuUpdated',
  'navigationMenuDeleted',
  'storeUpdated',
  'storeLocalesUpdated',
  'storeConfigurationUpdated',
  'discountCreated',
  'discountUpdated',
  'discountDeleted',
  'reviewCreated',
  'reviewUpdated',
  'reviewDeleted',
  'productQuestionCreated',
  'productQuestionUpdated',
  'productQuestionDeleted',
  'reviewStoreConfigurationUpdated',
  'loyaltyProgramCreated',
  'loyaltyProgramUpdated',
  'loyaltyProgramDeleted',
  'resourceTranslationsUpdated',
  'fileUpdated',
  'fileDeleted',
  'listingFacetMembershipChanged',
  'facetCreated',
  'facetUpdated',
  'facetDeleted',
];

/** The body of an event: the envelope of the store's webhook (`serializeEventEnvelope`). */
export interface StaticEventEnvelope {
  /** The event id. */
  id: string;
  topic: string;
  occurredAt?: string;
  data?: Record<string, unknown> | null;
  /** Truncated by the feed as by webhooks. */
  changes?: unknown;
}

/** A page of an entity of its own: rendered at once. */
export interface StaticOwnPage {
  /** The page type (`product`, `category`, …). */
  route: string;
  /** The key of the entity (`Product:<uuid>`). */
  owner: string;
}

/** One change of the static site an event makes. */
export interface StaticChange {
  /**
   * A dependency key; `*` is every dependency of `kinds` with any of `aspects`, an empty key
   * (with no aspects) no page at all.
   */
  key: string;
  kinds: StaticDepKind[];
  aspects: number;
  /** The page of the entity itself: rendered at once (and found by its owner). */
  own?: StaticOwnPage;
  /** The entity is gone: its own page leaves the site. */
  gone?: boolean;
  /** Every page changes: a full build. */
  full?: boolean;
  /** Only marks the pages stale, never renders at once (stock). */
  lazy?: boolean;
  /** Only the pages of these languages (URL segments or BCP 47 tags). */
  locales?: string[];
  /** Tags of the CDN to purge (fast data, GraphQL `GET`), with no render. */
  purgeTags?: string[];
}

const { entity, list, query } = STATIC_DEP_KINDS;
const {
  content,
  pricing,
  availability,
  media,
  membership,
  reviews,
  loyalty,
  translation,
} = STATIC_ASPECTS;

/** Aspects of the reasons of `productUpdated`; an unknown reason is `content`. */
const PRODUCT_REASON_ASPECTS: Record<string, number> = {
  content,
  seo: content,
  options: content,
  tags: content,
  pricing,
  variant: pricing | availability,
  inventory: availability,
  media,
  category: membership,
  collection: membership,
  vendor: membership,
  publication: membership,
  status: membership,
};

/** Reasons that change what lists hold. */
const MEMBERSHIP_REASONS = new Set([
  'category',
  'collection',
  'vendor',
  'publication',
  'status',
]);

/** Reasons the fast data of a product follows (`sf-p-<uuid>`). */
const FAST_DATA_REASONS = new Set(['inventory', 'pricing', 'variant']);

/** Reasons of collections and categories that change their own lists. */
const RULE_REASONS = new Set(['rules', 'membership', 'products', 'sort']);

/** The page types of the entity types with a page. */
const OWN_ROUTES: Record<string, string> = {
  Product: 'product',
  Category: 'category',
  Collection: 'collection',
  Vendor: 'vendor',
  OnlineStorePage: 'page',
};

/** The entity type of a topic prefix. */
const TOPIC_TYPENAMES: Record<string, string> = {
  product: 'Product',
  category: 'Category',
  collection: 'Collection',
  vendor: 'Vendor',
  page: 'OnlineStorePage',
  file: 'MediaImage',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const strings = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];

/**
 * The id of the entity an event is of: `data.<entity>Id`, `data.<entity>.id`, `data.id`, a
 * global id in any form.
 */
function idOf(data: Record<string, unknown>, name: string): string | null {
  const direct = data[`${name}Id`];
  if (typeof direct === 'string') return direct;
  const nested = data[name];
  if (isRecord(nested) && typeof nested.id === 'string') return nested.id;
  if (typeof data.id === 'string') return data.id;
  return null;
}

/** Keys of a list of ids (`affectedCategoryIds`). */
const keysOf = (typename: string, ids: unknown) =>
  strings(ids).map((id) => entityKey(typename, id));

/** The tag of the fast data of a product. */
export const productPurgeTag = (key: string) =>
  `sf-p-${key.slice(key.indexOf(':') + 1)}`;

/** Fast data and promotions: every light answer. */
export const PROMOTION_PURGE_TAGS = ['sf-promo', 'sf-vol'] as const;

const listChange = (
  key: string,
  aspects: number = membership
): StaticChange => ({
  key,
  kinds: [list],
  aspects,
});

const queryChange = (
  field: string,
  aspects: number = membership
): StaticChange => ({
  key: `Query#${field}`,
  kinds: [query],
  aspects,
});

const everyList = (aspects: number = membership): StaticChange => ({
  key: '*',
  kinds: [list, query],
  aspects,
});

function productChanges(
  topic: string,
  data: Record<string, unknown>
): StaticChange[] {
  const id = idOf(data, 'product');
  if (!id) return [];
  const key = entityKey('Product', id);
  const own: StaticOwnPage = { route: 'product', owner: key };
  const categories = keysOf('Category', data.affectedCategoryIds);
  const collections = keysOf('Collection', data.affectedCollectionIds);
  const vendors = keysOf('Vendor', [
    ...strings(data.affectedVendorIds),
    ...(typeof data.vendorId === 'string' ? [data.vendorId] : []),
  ]);
  const owners = [...categories, ...collections, ...vendors];
  const purge = [productPurgeTag(key)];

  if (topic === 'productCreated') {
    return [
      { key, kinds: [entity], aspects: content, own },
      ...owners.map((owner) => listChange(`${owner}#products`)),
      queryChange('products'),
      queryChange('dynamicCollection'),
    ];
  }
  if (topic === 'productDeleted') {
    return [
      {
        key,
        kinds: [entity],
        aspects: ALL_STATIC_ASPECTS,
        own,
        gone: true,
        purgeTags: purge,
      },
      ...owners.map((owner) => listChange(`${owner}#products`)),
      queryChange('products'),
      queryChange('dynamicCollection'),
      queryChange('search'),
    ];
  }

  const reasons = strings(data.reasons);
  const known = reasons.length > 0 ? reasons : ['content'];
  let aspects = 0;
  for (const reason of known) {
    aspects |= PRODUCT_REASON_ASPECTS[reason] ?? content;
  }
  // Stock alone never renders at once: the page shows it as a correctable field.
  const lazy = known.every((reason) => reason === 'inventory');
  const changes: StaticChange[] = [
    {
      key,
      kinds: [entity],
      aspects,
      ...(lazy ? { lazy } : { own }),
      ...(known.some((reason) => FAST_DATA_REASONS.has(reason))
        ? { purgeTags: purge }
        : {}),
    },
  ];
  // A list orders and filters by price and stock: their changes move a product in it.
  const listAspects =
    (known.some((reason) => MEMBERSHIP_REASONS.has(reason)) ? membership : 0) |
    (aspects & (pricing | availability));
  if (listAspects) {
    for (const owner of owners) {
      changes.push({
        ...listChange(`${owner}#products`, listAspects),
        ...(lazy ? { lazy } : {}),
      });
    }
    for (const field of ['products', 'dynamicCollection', 'search']) {
      changes.push({
        ...queryChange(field, listAspects),
        ...(lazy ? { lazy } : {}),
      });
    }
  }
  return changes;
}

/** Categories, collections, vendors, pages: their own page and entity. */
function ownedChanges(
  typename: string,
  name: string,
  action: string,
  data: Record<string, unknown>
): StaticChange[] {
  const id = idOf(data, name);
  if (!id) return [];
  const key = entityKey(typename, id);
  const route = OWN_ROUTES[typename];
  const own = route ? { route, owner: key } : undefined;
  if (action === 'Deleted') {
    return [
      {
        key,
        kinds: [entity],
        aspects: ALL_STATIC_ASPECTS,
        ...(own ? { own, gone: true } : {}),
      },
    ];
  }
  const changes: StaticChange[] = [
    { key, kinds: [entity], aspects: content, ...(own ? { own } : {}) },
  ];
  const reasons = strings(data.reasons);
  if (
    action === 'Created' ||
    reasons.some((reason) => RULE_REASONS.has(reason))
  ) {
    if (typename !== 'OnlineStorePage')
      changes.push(listChange(`${key}#products`));
  }
  return changes;
}

/** The product a review or a question is of. */
function reviewChanges(data: Record<string, unknown>): StaticChange[] {
  const product = idOf(data, 'product');
  if (!product) return [];
  const key = entityKey('Product', product);
  return [
    { key, kinds: [entity], aspects: reviews },
    { key: `${key}#reviews`, kinds: [list], aspects: membership | reviews },
    { key: `${key}#questions`, kinds: [list], aspects: membership | reviews },
  ];
}

/** Translations of one resource, in some languages. */
function translationChanges(data: Record<string, unknown>): StaticChange[] {
  const resource =
    typeof data.resourceId === 'string'
      ? data.resourceId
      : typeof data.id === 'string'
        ? data.id
        : null;
  if (!resource) return [];
  const decoded = decodeGlobalId(resource);
  const typename =
    (typeof data.resourceType === 'string' && data.resourceType) ||
    decoded?.typename;
  const locales = strings(data.locales);
  const key = entityKey(typename || undefined, resource);
  return [
    {
      key,
      kinds: [entity],
      aspects: translation,
      ...(locales.length > 0 ? { locales } : {}),
    },
  ];
}

/** The changes of one event; none for a topic without a rule. */
export function mapEventToChanges(
  envelope: StaticEventEnvelope
): StaticChange[] {
  const { topic } = envelope;
  const data = isRecord(envelope.data) ? envelope.data : {};

  if (/^product(Created|Updated|Deleted)$/.test(topic)) {
    return productChanges(topic, data);
  }
  const owned =
    /^(category|collection|vendor|page|file)(Created|Updated|Deleted)$/.exec(
      topic
    );
  if (owned) {
    const [, name, action] = owned;
    if (name === 'file') {
      if (action === 'Created') return [];
      const id = idOf(data, 'file');
      return id
        ? [
            {
              key: entityKey('MediaImage', id),
              kinds: [entity],
              aspects: media,
            },
          ]
        : [];
    }
    return ownedChanges(TOPIC_TYPENAMES[name], name, action, data);
  }
  if (/^tag(Created|Updated|Deleted)$/.test(topic)) {
    return [queryChange('dynamicCollection')];
  }
  if (
    /^navigationMenu(Created|Updated|Deleted)$/.test(topic) ||
    topic === 'storeUpdated' ||
    topic === 'storeLocalesUpdated' ||
    topic === 'storeConfigurationUpdated'
  ) {
    return [
      {
        key: '*',
        kinds: [entity, list, query],
        aspects: ALL_STATIC_ASPECTS,
        full: true,
      },
    ];
  }
  if (/^discount(Created|Updated|Deleted)$/.test(topic)) {
    // Promotions are volatile: no page has them, only their light answers.
    return [
      { key: '', kinds: [], aspects: 0, purgeTags: [...PROMOTION_PURGE_TAGS] },
    ];
  }
  if (/^(review|productQuestion)(Created|Updated|Deleted)$/.test(topic)) {
    return reviewChanges(data);
  }
  if (topic === 'reviewStoreConfigurationUpdated') {
    return [{ key: '*', kinds: [entity], aspects: reviews }];
  }
  if (/^loyaltyProgram(Created|Updated|Deleted)$/.test(topic)) {
    return [{ key: '*', kinds: [entity], aspects: loyalty }];
  }
  if (topic === 'resourceTranslationsUpdated') {
    return translationChanges(data);
  }
  if (
    topic === 'listingFacetMembershipChanged' ||
    /^facet(Created|Updated|Deleted)$/.test(topic)
  ) {
    return [everyList()];
  }
  return [];
}

/** The mask of aspect names, for tests and the operator API. */
export function changeAspects(aspects: readonly StaticAspect[]): number {
  return aspects.reduce((mask, aspect) => mask | STATIC_ASPECTS[aspect], 0);
}
