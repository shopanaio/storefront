/**
 * RatingBreakdown - rating distribution details
 */
export interface RatingBreakdown {
  /** Number of stars (1-5) */
  star: number;
  /** Number of reviews with this rating */
  count: number;
  /** Percentage of total reviews */
  percentage: number;
}

/**
 * ProductRating - aggregate rating information
 */
export interface ProductRating {
  /** Global unique identifier */
  id: string;
  /** Average rating value */
  rating: number;
  /** Total number of reviews */
  count: number;
  /** Rating distribution by star count */
  breakdown: Array<RatingBreakdown>;
}
