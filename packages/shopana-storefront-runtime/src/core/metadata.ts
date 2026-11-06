/** An image of a page shared on social media. */
export interface RuntimeMetadataImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

export type RuntimeMetadataImages =
  | string
  | RuntimeMetadataImage
  | Array<string | RuntimeMetadataImage>;

/** `article:*` tags of an Open Graph `article`. */
export interface RuntimeOpenGraphArticle {
  /** ISO date-time. */
  publishedTime?: string;
  /** ISO date-time. */
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
}

/** `product:*` tags of an Open Graph `product`. */
export interface RuntimeOpenGraphProduct {
  price?: { amount: string; currency: string };
  availability?: 'in stock' | 'out of stock' | 'preorder' | 'backorder';
  condition?: 'new' | 'refurbished' | 'used';
  brand?: string;
  /** The seller's id of the item (SKU). */
  retailerItemId?: string;
}

export interface RuntimeOpenGraph {
  /** `website` when left out. */
  type?: 'website' | 'article' | 'product';
  title?: string;
  description?: string;
  /** The canonical address of the page when left out. */
  url?: string;
  siteName?: string;
  /** Open Graph locale (`uk_UA`); the page's language when left out. */
  locale?: string;
  /** The other languages of the page; the store's other languages when left out. */
  alternateLocales?: string[];
  images?: RuntimeMetadataImages;
  article?: RuntimeOpenGraphArticle;
  product?: RuntimeOpenGraphProduct;
}

export interface RuntimeTwitter {
  /**
   * `summary_large_image` with an image when left out; without one the root's card stays
   * (React Router), or Next.js picks `summary`.
   */
  card?: 'summary' | 'summary_large_image';
  title?: string;
  description?: string;
  images?: RuntimeMetadataImages;
}

/** A schema.org document of a page, rendered as `<script type="application/ld+json">`. */
export type RuntimeJsonLd = { '@context'?: string; '@type'?: string } & {
  [key: string]: unknown;
};

/**
 * Metadata of a page, the same under both runtimes: Next.js renders it as its `Metadata`, React
 * Router as the `meta` tags of the page route.
 *
 * Addresses of pages (`alternates.canonical`, `openGraph.url`) may be storefront paths without
 * the locale segment (`/products/socks`): the runtime puts them in the page's language on the
 * public origin. Images may be paths of the site (`/icons/icon.png`). Left out, the runtime
 * fills the canonical address (the path of the page without its query), the address of the
 * page in each store language, `og:url`, `og:site_name`, `og:locale`, `og:type` and the
 * Twitter card from the page's own title, description and images (see `withSiteMetadata`).
 */
export interface RuntimeMetadata {
  /** The page's title; the app's title template puts the store in it. */
  title?: string | null;
  description?: string | null;
  keywords?: string | string[] | null;
  robots?: string | { index?: boolean; follow?: boolean } | null;
  alternates?: {
    canonical?: string | null;
    /** Address of the page in each language, by BCP 47 tag (`x-default` included). */
    languages?: Record<string, string>;
  } | null;
  openGraph?: RuntimeOpenGraph | null;
  twitter?: RuntimeTwitter | null;
  /** schema.org documents of the page (a Product, a BreadcrumbList), for search engines. */
  jsonLd?: RuntimeJsonLd | RuntimeJsonLd[] | null;
  /** Further `<meta name content>` tags. */
  other?: Record<string, string | number | Array<string | number>>;
}

/** Whether the robots directive lets search engines index the page. */
export function isIndexable(robots: RuntimeMetadata['robots']): boolean {
  if (!robots) return true;
  if (typeof robots === 'string') return !/\bnoindex\b|\bnone\b/i.test(robots);
  return robots.index !== false;
}

/** The `product:*` Open Graph properties of a product, in document order. */
export function openGraphProductProperties(
  product: RuntimeOpenGraphProduct | undefined
): Array<[string, string]> {
  if (!product) return [];
  const properties: Array<[string, string | undefined]> = [
    ['product:price:amount', product.price?.amount],
    ['product:price:currency', product.price?.currency],
    ['product:availability', product.availability],
    ['product:condition', product.condition],
    ['product:brand', product.brand],
    ['product:retailer_item_id', product.retailerItemId],
  ];
  return properties.filter((entry): entry is [string, string] =>
    Boolean(entry[1])
  );
}

/** The documents of `jsonLd` as a list. */
export function jsonLdList(jsonLd: RuntimeMetadata['jsonLd']): RuntimeJsonLd[] {
  if (!jsonLd) return [];
  return Array.isArray(jsonLd) ? jsonLd : [jsonLd];
}

/**
 * A JSON-LD document as script text: `<` is escaped, so a value with `</script>` cannot end
 * the script element.
 */
export function serializeJsonLd(document: RuntimeJsonLd): string {
  return JSON.stringify(document).replace(/</g, '\\u003c');
}
