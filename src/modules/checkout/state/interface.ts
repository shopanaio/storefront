/**
 * Validation status for sections and providers.
 */
export type SectionValidationStatus = 'idle' | 'valid' | 'invalid';

/**
 * Static section identifiers present regardless of delivery grouping.
 */
export enum SectionId {
  Contact = 'contact',
  Recipient = 'recipient',
  Address = 'address',
  Delivery = 'delivery',
  Payment = 'payment',
  Promo = 'promo',
  Comment = 'comment',
}

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

/**
 * Public store interface with state and actions.
 */
export interface CheckoutState {
  /** Sections data */
  sections: Partial<Record<SectionId, SectionEntry>>;

  /** Running mutations count */
  activeOperationsCount: number;

  // Section actions
  registerSection: (id: SectionId, required: boolean) => void;
  unregisterSection: (id: SectionId) => void;
  sectionValid: <K extends SectionId>(id: K) => void;
  sectionInvalid: <K extends SectionId>(
    id: K,
    errors?: Record<string, string>
  ) => void;
  resetSection: (id: SectionId) => void;
  setSectionBusy: (id: SectionId, busy: boolean) => void;

  // Active operations tracking
  incrementActiveOperations: () => void;
  decrementActiveOperations: () => void;

  // Submission
  requestSubmit: () => void;
}
