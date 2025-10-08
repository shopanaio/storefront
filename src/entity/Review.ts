import { Connection } from './Connection';
import { Media } from './Media';

/**
 * ReviewStatus - publication status of a review
 */
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * ReviewAuthor - author information for a review
 */
export interface ReviewAuthor {
  /** Global unique identifier */
  id: string;
  /** Author's display name */
  displayName: string;
  /** Author's avatar image */
  avatar?: Media | null;
}

/**
 * ReviewComment - seller reply to a review
 */
export interface ReviewComment {
  /** Global unique identifier */
  id: string;
  /** Reply message */
  message: string;
  /** Reply creation date */
  createdAt: string;
}

/**
 * Review - user review of a product
 */
export interface Review {
  /** Global unique identifier */
  id: string;
  /** Internal object identifier */
  iid: string;
  /** Number of stars (1-5, step 0.5) */
  rating: number;
  /** Review title */
  title?: string | null;
  /** Main review text */
  message: string;
  /** Author's display name */
  displayName: string;
  /** Review author */
  user?: ReviewAuthor | null;
  /** Product pros */
  pros?: string | null;
  /** Product cons */
  cons?: string | null;
  /** Review language (ISO-639-1) */
  locale?: string | null;
  /** Whether the product was actually purchased by this user */
  verifiedPurchase: boolean;
  /** Publication status */
  status: ReviewStatus;
  /** Total "helpful" votes */
  helpfulYes: number;
  /** Total "not helpful" votes */
  helpfulNo: number;
  /** Did the current user mark the review as helpful? */
  meHelpful: boolean;
  /** Creation date */
  createdAt: string;
  /** Last edit date */
  editedAt?: string | null;
  /** Attached media files */
  media?: Array<Media>;
  /** Seller reply (if any) */
  sellerReply?: ReviewComment | null;
}

/**
 * ReviewConnection - paginated collection of reviews
 */
export type ReviewConnection = Connection<Review>;
