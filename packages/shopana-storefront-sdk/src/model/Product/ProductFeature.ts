/**
 * ProductFeatureValue - single value for a product feature
 */
export interface ProductFeatureValue {
  /** Global unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** URL-friendly handle */
  handle: string;
}

/**
 * ProductFeatureGroup - presentation group containing related product features
 */
export interface ProductFeatureGroup {
  /** Global unique identifier */
  id: string;
  /** URL-friendly handle */
  handle: string;
  /** Display title */
  title: string;
  /** Display order */
  position: number;
}

/**
 * ProductFeature - feature of a product (e.g., Material, Weight)
 */
export interface ProductFeature {
  /** Global unique identifier */
  id: string;
  /** URL-friendly handle */
  handle: string;
  /** Display title */
  title: string;
  /** Whether the feature should be highlighted in product previews */
  featured: boolean;
  /** Presentation group containing this feature */
  group: ProductFeatureGroup | null;
  /** Available values for this feature */
  values: Array<ProductFeatureValue>;
}
