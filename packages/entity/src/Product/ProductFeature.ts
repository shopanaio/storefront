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
 * ProductFeature - feature of a product (e.g., Material, Weight)
 */
export interface ProductFeature {
  /** Global unique identifier */
  id: string;
  /** URL-friendly handle */
  handle: string;
  /** Display title */
  title: string;
  /** Available values for this feature */
  values: Array<ProductFeatureValue>;
}
