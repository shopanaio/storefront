"use client";

import { Badge, Checkbox, Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import type * as Entity from "@src/entity/namespace";
import React from "react";
import { Price } from "@src/components/UI/Price/Price";
import { ProductCardTitle } from "@src/components/UI/ProductCards/Title/Title";
import { useIsInTheBoxBuilderCart } from "@src/modules/box-builder/hooks/useIsInTheCart";
import { Thumbnail } from "@src/components/UI/Thumbnail/Thumbnail";
import { useTranslations } from "next-intl";
import { Activity, useFlow } from "@src/modules/box-builder/stackflow/Stack";
import { BoxActionButton } from "@src/modules/box-builder/components/ActionButton/BoxActionButton";
import { ProductActionButton } from "@src/modules/box-builder/components/ActionButton/ProductActionButton";
import { CardActionButton } from "@src/modules/box-builder/components/ActionButton/CardActionButton";
import { Discount } from "@src/components/UI/Price/Discount";

const { Text } = Typography;

export enum ProductType {
  Box = "box",
  Product = "product",
  Card = "card",
}

export interface Props {
  product: Entity.ProductVariant;
  allowCount: boolean;
  productType: ProductType;
}

export const ProductCard = ({ product, productType }: Props) => {
  const { styles } = useStyles();
  const t = useTranslations("BoxBuilder");
  const { push } = useFlow();

  const cartLine = useIsInTheBoxBuilderCart(product.id);
  const isInCart = Boolean(cartLine);
  const { quantity = 0 } = cartLine || {};

  const isFree = parseFloat(product.price.amount) === 0;
  const isAvailable = Boolean(product.stockStatus?.isAvailable);

  const handleClick = () => {
    push(Activity.Product, {
      productHandle: product.handle,
      productType,
    });
  };

  const renderActionButton = () => {
    if (productType === ProductType.Box) {
      return (
        <BoxActionButton
          productId={product.id}
          isAvailable={isAvailable}
          isFree={isFree}
          isInCart={isInCart}
          quantity={quantity}
          appearance="card"
        />
      );
    }

    if (productType === ProductType.Card) {
      return (
        <CardActionButton
          productId={product.id}
          isAvailable={isAvailable}
          isFree={isFree}
          isInCart={isInCart}
          quantity={quantity}
          appearance="card"
        />
      );
    }

    return (
      <ProductActionButton
        productId={product.id}
        isAvailable={isAvailable}
        isFree={isFree}
        isInCart={isInCart}
        quantity={quantity}
        appearance="card"
      />
    );
  };

  return (
    <Flex vertical className={styles.container} gap={8}>
      <Thumbnail
        selected={isInCart}
        className={styles.cover}
        src={product.cover?.url}
        alt={product.title}
        onClick={handleClick}
        overlay={isInCart ? <Checkbox checked={isInCart} /> : undefined}
      />
      <Flex vertical className={styles.productInfo} gap={8}>
        {renderActionButton()}
        <ProductCardTitle rows={2} onClick={handleClick}>
          {product.title}
        </ProductCardTitle>
        <Flex className={styles.priceBox}>
          <Flex className={styles.priceWrapper} vertical>
            {product.compareAtPrice &&
              product.price.amount < product.compareAtPrice.amount && (
                <Flex align="center" gap={8}>
                  <Discount
                    isAvailable={product.stockStatus.isAvailable}
                    price={product.price}
                    compareAtPrice={product.compareAtPrice}
                  />
                </Flex>
              )}
            <Text
              className={styles.price}
              type={product.stockStatus.isAvailable ? undefined : "secondary"}
            >
              <Flex align="center" gap={8} wrap="wrap">
                {isFree ? (
                  <Badge color="pink" count={t("free")} />
                ) : (
                  <Text
                    type={
                      !product.stockStatus.isAvailable ? "secondary" : undefined
                    }
                  >
                    <Price money={product.price} raw />
                  </Text>
                )}
              </Flex>
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgContainer};
  `,
  productInfo: css`
    width: 100%;
    height: 100%;
    padding: 0 0 ${token.paddingXS}px;
  `,
  cover: css`
    --thumb-size: 100%;
    aspect-ratio: 1 / 1;
  `,
  selectedCover: css`
    border-radius: ${token.borderRadius}px;
    border: 1px solid ${token.colorPrimary};
  `,
  priceBox: css`
    justify-content: space-between;
    align-items: flex-end;
  `,
  priceWrapper: css`
    align-items: flex-start;
    justify-content: space-between;
  `,
  compareAtPrice: css`
    font-size: ${token.fontSizeSM}px;
    font-weight: var(--font-weight-300);
    line-height: 1;
  `,
  price: css`
    font-size: ${token.fontSizeLG}px;
    line-height: 1;
    font-weight: var(--font-weight-600);
  `,
}));
