"use client";

import { Card, Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import Link from "next/link";
import React from "react";

import { mq } from "@src/components/Theme/breakpoints";
import { useRoutes } from "@src/hooks/useRoutes";
import {
  ProductCardTitle,
  type ProductCardTitleProps,
} from "@src/components/UI/ProductCards/Title/Title";
import { ProductWishlistButton } from "@src/components/Listing/ProductWishlistButton";
import {
  ProductCardImage,
  type ProductCardImageProps,
} from "@src/components/UI/ProductCards/Image/Image";
import {
  ProductCardSwatches,
  type ProductCardSwatchesProps,
} from "@src/components/UI/ProductCards/Swatch/Swatch";
import { Price, type Money } from "@src/components/UI/Price/Price";
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
  price: Money;
  compareAtPrice?: Money;

  // ProductCardSwatches
  swatches?: ProductCardSwatchesProps["swatches"];

  // ProductCardTitle
  title?: Pick<ProductCardTitleProps, "rows" | "size">;

  // ProductCardImage
  gallery: ProductCardImageProps["gallery"];

  // Settings display
  hoverable?: boolean;

  // ProductRating
  showRating?: boolean;
  showStockStatus?: boolean;

  // Cart state (for ProductCartButton)
  isInCart?: ProductCartButtonProps["isInCart"];

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
  hoverable = true,
  showRating = true,
  showStockStatus = true,
  isInCart = false,
  onAddToCart = () => {},
  onReviewClick = () => {},
}: ProductCardProps) => {
  const { styles } = useStyles();
  const routes = useRoutes();

  const href = routes.product.path(handle);

  const renderImage = () => (
    <div className={styles.cover}>
      <div className={styles.wishlist}>
        <ProductWishlistButton productId={id} />
      </div>
      <Link href={href} className={styles.coverLink}>
        <ProductCardImage gallery={gallery} />
      </Link>
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
        onAddToCart={onAddToCart}
      />
    </Flex>
  );

  return (
    <Card
      className={styles.container}
      styles={{ body: { padding: 0, flexGrow: 1 } }}
      hoverable={hoverable}
      cover={renderImage()}
    >
      <Flex className={styles.productInfo} vertical>
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
    </Card>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    display: flex;
    flex-direction: column;
    max-width: 450px;
    border-radius: 0;
    background: ${token.colorBgContainer};

    ${mq.lg} {
      border-radius: ${token.borderRadius}px;
    }
  `,
  productInfo: css`
    width: 100%;
    height: 100%;
    padding: 0 ${token.paddingSM}px ${token.paddingSM}px;
  `,
  cover: css`
    position: relative;
    aspect-ratio: 1 / 1;
    padding: ${token.paddingSM}px;
  `,
  coverLink: css`
    display: block;
    width: 100%;
    height: 100%;
  `,
  swatches: css`
    margin-bottom: ${token.marginSM}px;
  `,
  wishlist: css`
    position: absolute;
    top: ${token.marginSM}px;
    right: ${token.marginSM}px;
    z-index: 2;
  `,
  titleLink: css`
    flex-grow: 1;
    padding-bottom: ${token.paddingXS}px;

    &:hover {
      text-decoration: underline;
    }
  `,
  priceBox: css`
    justify-content: space-between;
    align-items: flex-end;
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
