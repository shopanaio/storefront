/**
 * Validation status for sections and providers.
 */
export type SectionValidationStatus = 'idle' | 'valid' | 'invalid';

/**
 * Static section identifiers present regardless of delivery grouping.
 */
export type SectionId =
  | 'contact'
  | 'recipient'
  | 'address'
  | 'delivery'
  | 'payment'
  | 'promo'
  | 'comment';

/**
 * Section aggregate entry held in the store.
 */
export interface SectionEntry {
  data: unknown | null;
  status: SectionValidationStatus;
  errors?: Record<string, string>;
  required: boolean;
  busy: boolean;
}
