// Connection types
import type * as ConnectionTypes from './Connection';

// Media
import type * as MediaTypes from './Media';

// Money
import type * as MoneyTypes from './Money';

// Tag
import type * as TagTypes from './Tag';

// User
import type * as UserTypes from './User';

// Session
import type * as SessionTypes from './Session';

// Category
import type * as CategoryTypes from './Category';
import { ListingType as ListingTypeEnum } from './Category';

// Review
import type * as ReviewTypes from './Review';

// Cart
import type * as CartTypes from './Cart/interface';

// Product Variant
import type * as VariantTypes from './Product/variant';

// Product Group
import type * as ProductGroupTypes from './Product/ProductGroup';

// Product Option
import type * as ProductOptionTypes from './Product/ProductOption';

// Product Feature
import type * as ProductFeatureTypes from './Product/ProductFeature';

// Product Swatch
import type * as ProductSwatchTypes from './Product/ProductSwatch';

// Product Rating
import type * as ProductRatingTypes from './Product/ProductRating';

// Product
import type * as ProductTypes from './Product/product';

/**
 * Entity namespace containing all entity types for backward compatibility
 * You can also import types directly: import { Product, Category } from '@entity'
 */
export namespace Entity {
  // Connection types
  export type PageInfo = ConnectionTypes.PageInfo;
  export type Edge<T> = ConnectionTypes.Edge<T>;
  export type Connection<T> = ConnectionTypes.Connection<T>;

  // Media
  export type Media = MediaTypes.Media;

  // Money
  export type Money = MoneyTypes.Money;

  // Tag
  export type Tag = TagTypes.Tag;
  export type TagConnection = TagTypes.TagConnection;

  // User
  export type User = UserTypes.User;

  // Session
  export type Session = SessionTypes.Session;

  // Category
  export type CategoryBreadcrumb = CategoryTypes.CategoryBreadcrumb;
  export type ListingType = CategoryTypes.ListingType;
  export const ListingType = ListingTypeEnum;
  export type Category = CategoryTypes.Category;
  export type CategoryEdge = CategoryTypes.CategoryEdge;
  export type CategoryConnection = CategoryTypes.CategoryConnection;

  // Review
  export type ReviewStatus = ReviewTypes.ReviewStatus;
  export type ReviewAuthor = ReviewTypes.ReviewAuthor;
  export type ReviewComment = ReviewTypes.ReviewComment;
  export type Review = ReviewTypes.Review;
  export type ReviewConnection = ReviewTypes.ReviewConnection;

  // Cart
  export type CartPurchasable = CartTypes.CartPurchasable;
  export type CartLine = CartTypes.CartLine;
  export type Cart = CartTypes.Cart;

  // Product Variant
  export type StockStatus = VariantTypes.StockStatus;
  export type GalleryConnection = VariantTypes.GalleryConnection;
  export type ProductVariant = VariantTypes.ProductVariant;

  // Product Group
  export type ProductGroupPriceType = ProductGroupTypes.ProductGroupPriceType;
  export type ProductGroupPrice = ProductGroupTypes.ProductGroupPrice;
  export type ProductGroupNode = ProductGroupTypes.ProductGroupNode;
  export type ProductGroupItem = ProductGroupTypes.ProductGroupItem;
  export type ProductGroup = ProductGroupTypes.ProductGroup;

  // Product Option
  export type ProductOptionDisplayType = ProductOptionTypes.ProductOptionDisplayType;
  export type ProductOptionValue = ProductOptionTypes.ProductOptionValue;
  export type ProductOption = ProductOptionTypes.ProductOption;

  // Product Feature
  export type ProductFeatureValue = ProductFeatureTypes.ProductFeatureValue;
  export type ProductFeature = ProductFeatureTypes.ProductFeature;

  // Product Swatch
  export type SwatchDisplayType = ProductSwatchTypes.SwatchDisplayType;
  export type Swatch = ProductSwatchTypes.Swatch;

  // Product Rating
  export type RatingBreakdown = ProductRatingTypes.RatingBreakdown;
  export type ProductRating = ProductRatingTypes.ProductRating;

  // Product
  export type Product = ProductTypes.Product;
}
