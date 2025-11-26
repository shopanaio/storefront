"use client";

import { Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

// import { mq } from "@src/components/Theme/breakpoints";
import { useRoutes } from "@src/hooks/useRoutes";
import {
  ProductCardTitle,
  type ProductCardTitleProps,
} from "@src/components/UI/ProductCards/Title/Title";
import { ProductWishlistButton } from "@src/templates/collection/atoms/ProductWishlistButton";
import { type ProductCardImageProps } from "@src/components/UI/ProductCards/Image/Image";
import {
  ProductCardSwatches,
  type ProductCardSwatchesProps,
} from "@src/components/UI/ProductCards/Swatch/Swatch";
import { Price } from "@src/components/UI/Price/Price";
import type { model } from "@shopana/storefront-sdk";
import { Discount } from "@src/components/UI/Price/Discount";
import {
  StockStatus,
  type StockStatusProps,
} from "@src/components/UI/Stock/Status";
import { ProductCartButton, type ProductCartButtonProps } from "./CartButton";
import { UiOptionValue } from "@src/hooks/useFlattenProductOptions";
import {
  ProductRating,
  type ProductRatingProps,
} from "@src/components/UI/Rating/Rating";
import { Thumbnail } from "@src/components/UI/Thumbnail/Thumbnail";

const { Text } = Typography;

// Constants for default values
const DEFAULT_TITLE_CONFIG: Pick<ProductCardTitleProps, "rows" | "size"> = {
  rows: 2,
  size: "default",
};

const DEFAULT_SWATCHES: UiOptionValue[] = [];

export interface ProductCardProps {
  // Main product data
  id: string;
  productTitle: string;
  handle: string;

  // ProductRating
  rating: ProductRatingProps;

  // StockStatus
  isAvailable: StockStatusProps["stockStatus"];

  // Price, Discount
  price: model.Money;
  compareAtPrice?: model.Money;

  // ProductCardSwatches
  swatches?: ProductCardSwatchesProps["swatches"];

  // ProductCardTitle
  title?: Pick<ProductCardTitleProps, "rows" | "size">;

  // ProductCardImage
  gallery: ProductCardImageProps["gallery"];

  // ProductRating
  showRating?: boolean;
  showStockStatus?: boolean;

  // Cart state (for ProductCartButton)
  isInCart?: ProductCartButtonProps["isInCart"];
  isLoading?: ProductCartButtonProps["isLoading"];

  // Handlers events
  onAddToCart?: ProductCartButtonProps["onAddToCart"];
  onReviewClick?: ProductRatingProps["onReviewClick"];
}

export const ProductCard = ({
  id,
  productTitle,
  handle,
  rating,
  isAvailable,
  price,
  compareAtPrice,
  swatches = DEFAULT_SWATCHES,
  title = DEFAULT_TITLE_CONFIG,
  gallery,
  showRating = true,
  showStockStatus = true,
  isInCart = false,
  isLoading = false,
  onAddToCart = () => {},
  onReviewClick = () => {},
  variantHandle,
}: ProductCardProps & { variantHandle?: string }) => {
  const { styles } = useStyles();
  const routes = useRoutes();
  const router = useRouter();

  // handle is product handle now; if variant handle provided, pass via query
  const href = routes.product.path(handle, { variant: variantHandle });

  const handleImageClick = () => {
    router.push(href);
  };

  const renderImage = () => (
    <div className={styles.cover}>
      <div className={styles.wishlist}>
        <ProductWishlistButton
          item={{
            id,
            title: productTitle,
            sku: handle ?? id,
            image: gallery[0] ?? undefined,
            currency: price.currencyCode,
            unitPrice: price.amount,
          }}
        />
      </div>
      <Thumbnail
        className={styles.thumbnail}
        gallery={gallery}
        alt={productTitle}
        onClick={handleImageClick}
      />
    </div>
  );

  const renderSwatches = () => {
    if (!swatches.length) return null;

    return (
      <div className={styles.swatches}>
        <ProductCardSwatches swatches={swatches} />
      </div>
    );
  };

  const renderRating = () => {
    if (!showRating) return null;

    return <ProductRating {...rating} onReviewClick={onReviewClick} />;
  };

  const renderStockStatus = () => {
    if (!showStockStatus) return null;

    return <StockStatus stockStatus={isAvailable} />;
  };

  const renderPriceSection = () => (
    <Flex className={styles.priceBox}>
      <Flex className={styles.priceWrapper} vertical>
        <Discount
          isAvailable={isAvailable}
          price={price}
          compareAtPrice={compareAtPrice}
        />
        <Text
          className={styles.price}
          type={isAvailable ? undefined : "secondary"}
        >
          <Price money={price} raw />
        </Text>
      </Flex>
      <ProductCartButton
        isAvailable={isAvailable}
        isInCart={isInCart}
        isLoading={isLoading}
        onAddToCart={onAddToCart}
      />
    </Flex>
  );

  return (
    <Flex vertical className={styles.container} gap={8}>
      {renderImage()}
      <Flex vertical className={styles.productInfo}>
        {renderSwatches()}
        <Link href={href} className={styles.titleLink}>
          <ProductCardTitle rows={title.rows} size={title.size}>
            {productTitle}
          </ProductCardTitle>
        </Link>
        {renderRating()}
        {renderStockStatus()}
        {renderPriceSection()}
      </Flex>
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgContainer};
    max-width: 450px;
  `,
  productInfo: css`
    width: 100%;
    height: 100%;
    padding: 0 0 ${token.paddingXS}px;
  `,
  cover: css`
    position: relative;
    --thumb-size: 100%;
    aspect-ratio: 1 / 1;
  `,
  thumbnail: css`
    --thumb-size: 100%;
    aspect-ratio: 1 / 1;
    width: 100%;
    height: 100%;
  `,
  swatches: css`
    margin-bottom: ${token.marginSM}px;
  `,
  wishlist: css`
    position: absolute;
    top: ${token.marginXXS}px;
    right: ${token.marginXXS}px;
    z-index: 2;
  `,
  titleLink: css`
    flex-grow: 1;
    padding-bottom: ${token.paddingXXS}px;
    &:hover {
      text-decoration: underline;
    }
  `,
  priceBox: css`
    justify-content: space-between;
    align-items: center;
    min-height: 40px;
  `,
  priceWrapper: css`
    align-items: flex-start;
    justify-content: space-between;
  `,
  price: css`
    font-size: ${token.fontSizeLG}px;
    line-height: 1;
    font-weight: var(--font-weight-600);
  `,
}));
