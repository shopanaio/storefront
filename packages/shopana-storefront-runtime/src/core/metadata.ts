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

export interface RuntimeOpenGraph {
  title?: string;
  description?: string;
  url?: string;
  siteName?: string;
  locale?: string;
  images?: RuntimeMetadataImages;
}

export interface RuntimeTwitter {
  title?: string;
  description?: string;
  images?: RuntimeMetadataImages;
}

/**
 * Metadata of a page, the same under both runtimes: Next.js renders it as its `Metadata` (of
 * which it is a part), React Router as the `meta` tags of the page route.
 */
export interface RuntimeMetadata {
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
  /** Further `<meta name content>` tags. */
  other?: Record<string, string | number | Array<string | number>>;
}
