/** Serialized rich-text content returned by the Storefront API. */
export interface RichText {
  /** Plain-text representation for search, metadata, and fallbacks. */
  text: string;

  /** HTML representation generated from the same editor document. */
  html: string;

  /** Serialized Lexical editor state. */
  json: unknown;
}
