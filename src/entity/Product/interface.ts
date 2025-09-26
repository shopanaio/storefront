/**
 * Product interface for use in components
 */
export interface Product {
  __typename?: "Product";

  /** All categories this product belongs to */
  categories: {
    edges: Array<{
      node: Category;
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string;
      endCursor?: string;
    };
    totalCount: number;
  };

  /** Main product category */
  category?: Category;

  /** Original price during sale */
  compareAtPrice?: {
    amount: number;
    currencyCode: string;
  };

  /** Private field for internal purposes */
  containerId: string;

  /** Main product image */
  cover?: {
    id: string;
    iid: string;
    source: string;
    url: string;
  };

  /** Product creation date and time */
  createdAt: string;

  /** Full product description */
  description: string;

  /** Short description or product annotation */
  excerpt: string;

  /** Feature sections and their values */
  features: Array<{
    id: string;
    iid: string;
    handle: string;
    title: string;
    values: Array<{
      id: string;
      iid: string;
      title: string;
      handle: string;
    }>;
  }>;

  /** Gallery of additional images with pagination */
  gallery: {
    edges: Array<{
      node: {
        id: string;
        iid: string;
        source: string;
        url: string;
      };
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string;
      endCursor?: string;
    };
    totalCount: number;
  };

  /** Groups of related products (e.g., bundles) */
  groups: Array<{
    id: string;
    iid: string;
    title: string;
    isRequired: boolean;
    isMultiple: boolean;
    items: Array<{
      product: Product;
      maxQuantity?: number;
      price: {
        type: "BASE" | "FIXED" | "PERCENT" | "FREE";
        amount?: {
          amount: number;
          currencyCode: string;
        };
        percentage?: number;
      };
    }>;
  }>;

  /** URL-friendly slug for product */
  handle: string;

  /** Global unique identifier */
  id: string;

  /** Internal object identifier */
  iid: string;

  /**
   * All option groups defined for this product
   * Each group represents a configurable attribute
   * (e.g., color, size, material) and includes a complete set of possible values
   */
  options: Array<{
    id: string;
    iid: string;
    handle: string;
    title: string;
    displayType: "SWATCH" | "VARIANT_COVER" | "RADIO" | "DROPDOWN" | "APPAREL_SIZE";
    values: Array<{
      id: string;
      iid: string;
      title: string;
      handle: string;
      swatch?: {
        id: string;
        iid: string;
        color: string;
        color2?: string;
        image?: {
          id: string;
          iid: string;
          source: string;
          url: string;
        };
        displayType: "COLOR" | "COLOR_DUO" | "IMAGE";
      };
    }>;
  }>;

  /** Current product price, including currency */
  price: {
    amount: number;
    currencyCode: string;
  };

  /** Product type */
  productType?: string;

  /** Product rating */
  rating: {
    id: string;
    iid: string;
    rating: number;
    count: number;
    breakdown: Array<{
      star: number;
      count: number;
      percentage: number;
    }>;
  };

  /** List of reviews with pagination and filters */
  reviews: {
    edges: Array<{
      node: {
        id: string;
        iid: string;
        rating: number;
        title?: string;
        message: string;
        displayName: string;
        pros?: string;
        cons?: string;
        locale?: string;
        verifiedPurchase: boolean;
        status: "PENDING" | "APPROVED" | "REJECTED";
        helpfulYes: number;
        helpfulNo: number;
        meHelpful: boolean;
        createdAt: string;
        editedAt?: string;
        user: {
          id: string;
          iid: string;
          email: string;
          name: {
            first: string;
            middle?: string;
            last: string;
          };
          isVerified: boolean;
          language?: string;
          phone?: string;
        };
        media: Array<{
          id: string;
          iid: string;
          source: string;
          url: string;
        }>;
        sellerReply?: {
          id: string;
          author: {
            id: string;
            iid: string;
            email: string;
            name: {
              first: string;
              middle?: string;
              last: string;
            };
            isVerified: boolean;
            language?: string;
            phone?: string;
          };
          message: string;
          createdAt: string;
          editedAt?: string;
        };
      };
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string;
      endCursor?: string;
    };
    totalCount: number;
  };

  /**
   * Ordered list of value handles applied to the current product configuration
   * Each entry is a handle of the selected ProductOptionValue (e.g., ["red", "m", "patterned"])
   */
  selectedOptions: Array<string>;

  /** SEO description for the product page */
  seoDescription?: string;

  /** SEO title for the product page */
  seoTitle?: string;

  /** Stock keeping unit identifier */
  sku?: string;

  /** Item availability information */
  stockStatus: {
    handle: string;
    isAvailable: boolean;
  };

  /** Tags associated with the product */
  tags: {
    edges: Array<{
      node: {
        id: string;
        iid: string;
        handle: string;
        title: string;
      };
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string;
      endCursor?: string;
    };
    totalCount: number;
  };

  /** Product title */
  title: string;

  /** Date and time of last product update */
  updatedAt: string;

  /** Product variants (different option combinations) */
  variants: Array<Product>;
}

/**
 * Category interface
 */
export interface Category {
  id: string;
  iid: string;
  handle: string;
  title: string;
  description: string;
  excerpt: string;
  cover?: {
    id: string;
    iid: string;
    source: string;
    url: string;
  };
  breadcrumbs: Array<Category>;
  createdAt: string;
  updatedAt: string;
  seoTitle?: string;
  seoDescription?: string;
}
