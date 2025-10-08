/**
 * CategoryBreadcrumb - represents a single breadcrumb item
 */
export interface CategoryBreadcrumb {
  /** Global unique identifier */
  id: string;
  /** Category title */
  title: string;
  /** URL-friendly slug */
  handle: string;
}

/**
 * Category - product category
 */
export interface Category {
  /** Global unique identifier */
  id: string;
  /** Category title */
  title: string;
  /** URL-friendly slug */
  handle: string;
  /** Breadcrumb trail from root to this category */
  breadcrumbs?: Array<CategoryBreadcrumb>;
}
