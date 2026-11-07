/**
 * Which part of an entity each field of the Storefront API shows (its aspect), next to the type
 * policies of the cache: the static site's index of dependencies records, for every page, what
 * parts of each entity it shows, and an event that changes another part (the stock of a product
 * shown only in breadcrumbs) renders nothing. A field without an entry is `content`. A theme adds
 * its own fields with `fieldAspects` of `static.config.ts`.
 */

/** The aspects, as bits of a mask. */
export const STATIC_ASPECTS = {
  /** Titles, handles, descriptions, SEO, tags, options: anything without another aspect. */
  content: 1,
  /** Prices of variants. */
  pricing: 2,
  /** Whether a product or variant is for sale. */
  availability: 4,
  /** Images and other media. */
  media: 8,
  /** What a list holds (a category's products, the result of a search). */
  membership: 16,
  /** Reviews, ratings, questions. */
  reviews: 32,
  /** The guest's base loyalty points. */
  loyalty: 64,
  /** Translatable fields in a language other than the store's default. */
  translation: 128,
} as const;

export type StaticAspect = keyof typeof STATIC_ASPECTS;

/** Every aspect: what a deleted entity changes. */
export const ALL_STATIC_ASPECTS = Object.values(STATIC_ASPECTS).reduce(
  (mask, bit) => mask | bit,
  0
);

/** Aspects of fields, by type, then field; `*` is any type. */
export type StaticFieldAspects = Readonly<
  Record<
    string,
    Readonly<Record<string, StaticAspect | readonly StaticAspect[]>>
  >
>;

const media = 'media' as const;
const reviews = 'reviews' as const;

export const STATIC_FIELD_ASPECTS: StaticFieldAspects = {
  Product: {
    availableForSale: 'availability',
    currentlyNotInStock: 'availability',
    selectedOrFirstAvailableVariant: 'availability',
    featuredImage: media,
    featuredMedia: media,
    media,
    images: media,
    reviewSummary: reviews,
    reviewsSummary: reviews,
    rating: reviews,
    reviews,
    questions: reviews,
    loyalty: 'loyalty',
    priceRange: 'pricing',
    compareAtPriceRange: 'pricing',
  },
  ProductVariant: {
    price: 'pricing',
    compareAtPrice: 'pricing',
    availableForSale: 'availability',
    currentlyNotInStock: 'availability',
    featuredMedia: media,
    media,
    image: media,
    loyalty: 'loyalty',
    reviews,
    questions: reviews,
  },
  Category: { image: media, featuredImage: media, media },
  Collection: { image: media, featuredImage: media, media },
  Vendor: { image: media, logo: media, media },
  OnlineStorePage: { image: media, featuredImage: media },
  MediaImage: { url: media, image: media, altText: media, width: media },
  '*': {},
};

/** The mask of one entry. */
function maskOf(entry: StaticAspect | readonly StaticAspect[]): number {
  return (typeof entry === 'string' ? [entry] : entry).reduce(
    (mask, aspect) => mask | STATIC_ASPECTS[aspect],
    0
  );
}

/** A table with a theme's own entries over the SDK's. */
export function mergeFieldAspects(
  ...tables: Array<StaticFieldAspects | undefined>
): StaticFieldAspects {
  const merged: Record<
    string,
    Record<string, StaticAspect | readonly StaticAspect[]>
  > = {};
  for (const table of tables) {
    for (const [typename, fields] of Object.entries(table ?? {})) {
      merged[typename] = { ...merged[typename], ...fields };
    }
  }
  return merged;
}

/** The aspect mask of a field of an object of `typename`: `content` without an entry. */
export function fieldAspectMask(
  table: StaticFieldAspects,
  typename: string | undefined,
  field: string
): number {
  const entry =
    (typename ? table[typename]?.[field] : undefined) ?? table['*']?.[field];
  return entry ? maskOf(entry) : STATIC_ASPECTS.content;
}

/** The mask of aspect names. */
export function aspectMask(aspects: readonly StaticAspect[]): number {
  return maskOf(aspects);
}

/** The names of the aspects of a mask. */
export function aspectNames(mask: number): StaticAspect[] {
  return (Object.keys(STATIC_ASPECTS) as StaticAspect[]).filter(
    (aspect) => (mask & STATIC_ASPECTS[aspect]) !== 0
  );
}
