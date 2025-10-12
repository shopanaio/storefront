'use client';

import { Checkbox, Flex, Typography } from 'antd';
import { Badge } from '@src/components/UI/Badge';
import { createStyles } from 'antd-style';
import type { Entity } from '@shopana/entity';
import React from 'react';
import { Price } from '@src/components/UI/Price/Price';
import { ProductCardTitle } from '@src/components/UI/ProductCards/Title/Title';
import { composeProductTitle } from '@src/utils/composeProductTitle';
import { useIsInTheBoxBuilderCart } from '@src/modules/box-builder/hooks/useIsInTheCart';
import { Thumbnail } from '@src/components/UI/Thumbnail/Thumbnail';
import { useTranslations } from 'next-intl';
import { Activity, useFlow } from '@src/modules/box-builder/Stack';
import { BoxActionButton } from '@src/modules/box-builder/components/ActionButton/BoxActionButton';
import { ProductActionButton } from '@src/modules/box-builder/components/ActionButton/ProductActionButton';
import { CardActionButton } from '@src/modules/box-builder/components/ActionButton/CardActionButton';
import { Discount } from '@src/components/UI/Price/Discount';

const { Text } = Typography;

export enum ProductType {
  Box = 'box',
  Product = 'product',
  Card = 'card',
}

export interface Props {
  product: Entity.ProductVariant;
  allowCount: boolean;
  productType: ProductType;
}

export const ProductCard = ({ product: variant, productType }: Props) => {
  const { styles } = useStyles();
  const t = useTranslations('BoxBuilder');
  const { push } = useFlow();

  const cartLine = useIsInTheBoxBuilderCart(variant.id);
  const isInCart = Boolean(cartLine);

  const isFree = parseFloat(variant.price.amount) === 0;

  const handleClick = () => {
    push(Activity.Product, {
      productHandle: variant.product?.handle,
      variantHandle: variant.handle,
      productType,
    });
  };

  const renderActionButton = () => {
    if (productType === ProductType.Box) {
      return (
        <BoxActionButton
          variant={variant}
          appearance="card"
        />
      );
    }

    if (productType === ProductType.Card) {
      return (
        <CardActionButton
          variant={variant}
          appearance="card"
        />
      );
    }

    return (
      <ProductActionButton
        variant={variant}
        appearance="card"
      />
    );
  };

  return (
    <Flex vertical className={styles.container} gap={8}>
      <Thumbnail
        selected={isInCart}
        className={styles.cover}
        src={variant.cover?.url}
        alt={composeProductTitle({
          productTitle: variant.product?.title,
          variantTitle: variant.title,
          fallback: variant.title,
        })}
        onClick={handleClick}
        overlay={isInCart ? <Checkbox checked={isInCart} /> : undefined}
      />
      <Flex vertical className={styles.productInfo} gap={8}>
        {renderActionButton()}
        <ProductCardTitle rows={2} onClick={handleClick}>
          {composeProductTitle({
            productTitle: variant.product?.title,
            variantTitle: variant.title,
            fallback: variant.title,
          })}
        </ProductCardTitle>
        <Flex className={styles.priceBox}>
          <Flex className={styles.priceWrapper} vertical>
            {variant.compareAtPrice &&
              variant.price.amount < variant.compareAtPrice.amount && (
                <Flex align="center" gap={8}>
                  <Discount
                    isAvailable={variant.stockStatus.isAvailable}
                    price={variant.price}
                    compareAtPrice={variant.compareAtPrice}
                  />
                </Flex>
              )}
            <Text
              className={styles.price}
              type={variant.stockStatus.isAvailable ? undefined : 'secondary'}
            >
              <Flex align="center" gap={8} wrap="wrap">
                {isFree ? (
                  <Badge color="pink" variant="default" count={t('free')} />
                ) : (
                  <Text
                    type={
                      !variant.stockStatus.isAvailable ? 'secondary' : undefined
                    }
                  >
                    <Price money={variant.price} raw />
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
