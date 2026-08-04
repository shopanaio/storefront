import type {
  SdkProductComponentConfigurationFragment,
  SdkProductComponentGroupFragment,
  SdkProductComponentItemFragment,
  SdkProductQuery,
  SdkProductReviewsFragment,
} from '../../../graphql/apollo/generated/operations';
export type ProductQueryResponse = SdkProductQuery;
export type ProductReviewsData = SdkProductReviewsFragment;
export type ProductComponentConfigurationData =
  SdkProductComponentConfigurationFragment;
export type ProductComponentGroupData = SdkProductComponentGroupFragment;
export type ProductComponentItemData = SdkProductComponentItemFragment;
export interface ProductMoney {
  amount: number;
  currencyCode: string;
}
export interface ProductImage {
  id: string;
  url: string;
}
export interface ProductImageEdge {
  node: ProductImage;
  cursor?: string;
}
export interface GalleryConnection {
  edges: ProductImageEdge[];
  pageInfo?: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  totalCount?: number;
}
export interface ProductSwatch {
  id: string;
  color?: string | null;
  displayType?: string | null;
  image?: ProductImage | null;
}
export interface ProductOptionValue {
  id: string;
  title: string;
  handle: string;
  swatch?: ProductSwatch | null;
}
export interface ProductOption {
  id: string;
  handle: string;
  title: string;
  displayType?: string | null;
  values: ProductOptionValue[];
}
export interface ProductVariant {
  id: string;
  handle: string;
  title: string;
  selectedOptions?: readonly string[] | null;
  cover?: ProductImage | null;
  gallery?: GalleryConnection;
  price: ProductMoney;
  compareAtPrice?: ProductMoney | null;
  sku?: string | null;
  stockStatus?: {
    isAvailable: boolean;
  } | null;
  isDefault?: boolean;
  groups?: ProductGroup[];
}
export interface ProductTag {
  id: string;
  handle: string;
  title: string;
}
export interface ProductFeatureValue {
  id: string;
  handle: string;
  title: string;
}
export interface ProductFeature {
  id: string;
  handle: string;
  title: string;
  values: ProductFeatureValue[];
}
export interface ProductGroupItem {
  id: string;
  node: {
    id: string;
    title: string;
    handle: string;
    product: {
      title: string;
      handle: string;
    };
    price: ProductMoney;
    cover?: ProductImage | null;
  } | null;
  selected: boolean;
  required: boolean;
  availableForSale: boolean;
  quantity: number;
  minQuantity: number;
  maxQuantity?: number | null;
  price?: {
    amount: ProductMoney;
    percentage?: number | null;
  } | null;
}
export interface ProductGroup {
  id: string;
  title: string;
  isRequired: boolean;
  isMultiple: boolean;
  minSelection?: number | null;
  maxSelection?: number | null;
  items: ProductGroupItem[];
}
export interface ProductRatingBreakdown {
  star: number;
  count: number;
  percentage: number;
}
export interface ProductRating {
  id: string;
  count: number;
  rating: number;
  breakdown: ProductRatingBreakdown[];
}
export interface ProductBreadcrumb {
  id: string;
  title: string;
  handle: string;
}
export interface ProductCategory {
  id: string;
  title: string;
  handle: string;
  breadcrumbs: ProductBreadcrumb[];
}
export interface ProductReview {
  id: string;
  rating: number;
  title?: string | null;
  message?: string | null;
  displayName?: string | null;
  pros?: string[] | null;
  cons?: string[] | null;
  verifiedPurchase: boolean;
  helpfulNo: number;
  helpfulYes: number;
  meHelpful?: boolean | null;
  createdAt: string;
  editedAt?: string | null;
}
export interface Product {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  excerpt?: string | null;
  options: ProductOption[];
  category?: ProductCategory | null;
  variants: ProductVariant[];
  tags: ProductTag[];
  features: ProductFeature[];
  groups: ProductGroup[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  rating?: ProductRating | null;
}
export interface ProductTemplateData {
  pageType: 'product';
  raw: ProductQueryResponse;
  product: Product | null;
}
export type ProductReviewsFragmentReference = SdkProductReviewsFragment;
export type ProductComponentConfigurationFragmentReference =
  SdkProductComponentConfigurationFragment;
export type ProductComponentGroupFragmentReference =
  SdkProductComponentGroupFragment;
export type ProductComponentItemFragmentReference =
  SdkProductComponentItemFragment;
