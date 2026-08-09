import type { Product } from './product';
import type { Connection, Edge } from '../Connection';

/** Public signal that produced a product recommendation. */
export type ProductRecommendationSource =
  | 'MANUAL'
  | 'FREQUENTLY_BOUGHT_TOGETHER'
  | 'CONTENT_SIMILARITY'
  | 'POPULARITY'
  | 'FALLBACK';

/** One ranked product recommendation. */
export interface ProductRecommendation {
  __typename?: 'ProductRecommendation';
  product: Product;
  source: ProductRecommendationSource;
}

/** An edge in a product recommendation connection. */
export interface ProductRecommendationEdge extends Edge<ProductRecommendation> {
  __typename?: 'ProductRecommendationEdge';
}

/** Forward-paginated product recommendations in presentation order. */
export interface ProductRecommendationConnection extends Connection<ProductRecommendation> {
  __typename?: 'ProductRecommendationConnection';
  edges: Array<ProductRecommendationEdge>;
  /** Recommendations in the same order as the connection edges. */
  nodes: Array<ProductRecommendation>;
}

/** Variables accepted by product recommendation fields. */
export interface ProductRecommendationPagination {
  first?: number | null;
  after?: string | null;
}
