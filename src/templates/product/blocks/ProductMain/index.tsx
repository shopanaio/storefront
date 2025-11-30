'use client';

import { Flex, Typography, Button } from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';
import { StockStatus } from '../../atoms/StockStatus';
import type { model } from "@shopana/storefront-sdk";
import { PriceAndSale } from '../../atoms/PriceAndSale';
import { useTranslations } from 'next-intl';
import { useRoutes } from '@src/hooks/useRoutes';
import { ProductComponents } from '../Options/ProductComponents';
import { ProductRating } from '@src/ui-kit/Rating/Rating';
import { ProductWishlistButton } from '@src/templates/collection/atoms/ProductWishlistButton';
import { ProductOptions } from '../Options/ProductOptions';
import {
  getGalleryStyles,
  GalleryBreakpointSettings,
} from '@src/utils/galleryStyles';
import { breakpoints, mq } from '@src/ui-kit/Theme/breakpoints';
import { useProductGallery } from '@src/hooks/useProductGallery';
import { useGalleryBreakpoints } from '@src/hooks/useGalleryBreakpoints';
import { ProductCartButton } from '@src/ui-kit/ProductCards/ListingCard/CartButton';
import { ProductGallery } from '../ProductGallery';
import useIsInTheCart from '@shopana/storefront-sdk/modules/cart/react/hooks/useIsInTheCart';
import useAddItemToCart from '@shopana/storefront-sdk/modules/cart/react/hooks/useAddItemToCart';
import { useProductGroups } from '@src/hooks/product/useProductGroups';
import { AdditionalInfoSection } from '../../atoms/AdditionalInfoSection';

const { Text, Title } = Typography;

const defaultBreakpoints: Record<number, GalleryBreakpointSettings> = {
  0: {
    thumbnailDirection: 'horizontal',
    thumbnailsPerView: 5,
    aspectRatio: 1,
    thumbnailSize: 70,
  },
  [breakpoints.lg]: {
    thumbnailDirection: 'horizontal',
    thumbnailsPerView: 6,
    aspectRatio: 1,
    thumbnailSize: 90,
  },
  [breakpoints.xl]: {
    thumbnailDirection: 'vertical',
    thumbnailsPerView: 7,
    aspectRatio: 1,
    thumbnailSize: 90,
  },
  [breakpoints.xxl]: {
    thumbnailDirection: 'vertical',
    thumbnailsPerView: 8,
    aspectRatio: 1,
    thumbnailSize: 90,
  },
};

interface ProductMainProps {
  /**
   * Product entity loaded on server
   */
  product: model.Product;
  /**
   * Gallery breakpoints for the product gallery
   */
  galleryBreakpoints?: Record<number, GalleryBreakpointSettings>;
  /**
   * Appearance of the product main component
   */
  appearance?: 'page' | 'box-builder';
  /**
   * Callback to notify about variant change. Should be provided by the page-level component
   * to update the URL query without navigation.
   */
  onChangeVariant: (handle: string) => void;
  /**
   * Title of the product and variant
   */
  title: string;
  /**
   * Current variant of the product
   */
  currentVariant: model.ProductVariant;
}

export const ProductMain = ({
  product,
  galleryBreakpoints = defaultBreakpoints,
  appearance = 'page',
  onChangeVariant,
  title,
  currentVariant,
}: ProductMainProps) => {
  const t = useTranslations('Product');
  const routes = useRoutes();
  const { addToCart, isInFlight } = useAddItemToCart();

  const {
    gallery: variantGallery,
    stockStatus,
    sku,
    compareAtPrice,
  } = currentVariant;
  const { isInCart } = useIsInTheCart({ purchasableId: currentVariant.id });

  const groups = useProductGroups(product, currentVariant);

  const gallery = useProductGallery(currentVariant, product);
  const { styleBreakpoints, swiperBreakpoints } = useGalleryBreakpoints(
    galleryBreakpoints,
    gallery.length
  );

  const { styles } = useStyles({
    galleryBreakpoints: styleBreakpoints,
  });

  const groupsLength = product.groups?.length ?? 0;
  const optionsLength = product.options?.length ?? 0;

  const primaryImage =
    gallery.find((media) => Boolean(media?.url))?.url ??
    variantGallery?.edges?.[0]?.node?.url ??
    undefined;

  const wishlistItem = {
    id: currentVariant.id,
    title,
    sku: sku ?? currentVariant.handle ?? currentVariant.id,
    image: primaryImage,
    currency: currentVariant.price.currencyCode,
    unitPrice: currentVariant.price.amount,
  };

  return (
    <div className={styles.container}>
      <div className={styles.gallery}>
        <ProductGallery
          gallery={gallery}
          thumbnailTrigger="hover"
          breakpoints={swiperBreakpoints}
        />
      </div>
      <Flex vertical className={styles.productInfo}>
        <Flex vertical gap={16}>
          <Flex vertical>
            {product.category && (
              <Button
                variant="link"
                color="primary"
                href={routes.collection.path(product.category.handle)}
                className={styles.categoryButton}
              >
                {product.category.title}
              </Button>
            )}
            <Title level={3} className={styles.title}>
              {title}
            </Title>
            <Flex justify="space-between" gap={20}>
              <Flex wrap gap={20}>
                <StockStatus stockStatus={stockStatus} />
                <ProductRating
                  rating={product.rating.rating}
                  ratingCount={product.rating.count}
                  size="large"
                  compact={false}
                />
              </Flex>
              {sku && (
                <Text
                  type="secondary"
                  /* className={styles.productSku} */ ellipsis
                >
                  {t('sku')}
                  {sku}
                </Text>
              )}
            </Flex>
          </Flex>
          {(appearance === 'box-builder' || groupsLength > 3) && (
            <PriceAndSale
              compareAtPrice={compareAtPrice}
              price={groups.computedPrice}
              stockStatus={stockStatus}
            />
          )}
          {optionsLength > 0 && (
            <ProductOptions
              product={product}
              currentVariant={currentVariant}
              onOptionSelect={(_, value) => {
                const nextHandle = value.variant?.handle ?? null;
                if (nextHandle) {
                  onChangeVariant?.(nextHandle);
                }
              }}
            />
          )}
          {groupsLength > 0 && <ProductComponents product={product} />}
          {appearance === 'page' && (
            <Flex className={styles.buySection} vertical gap={16}>
              <PriceAndSale
                compareAtPrice={compareAtPrice}
                price={groups.computedPrice}
                stockStatus={stockStatus}
              />

              <Flex wrap gap={16}>
                <ProductCartButton
                  isAvailable={stockStatus.isAvailable}
                  showLabel
                  size="large"
                  className={styles.cartBtn}
                  isInCart={isInCart}
                  isLoading={isInFlight}
                  onAddToCart={() => {
                    if (!isInCart) {
                      const children = groups.buildChildren();
                      addToCart({
                        purchasableId: currentVariant.id,
                        purchasableSnapshot: currentVariant,
                        quantity: 1,
                        children,
                      });
                    }
                  }}
                />
              </Flex>
              <ProductWishlistButton
                item={wishlistItem}
                showLabel
                size="large"
              />
            </Flex>
          )}
          {appearance === 'page' && <AdditionalInfoSection />}
        </Flex>
      </Flex>
    </div>
  );
};

const useStyles = createStyles(
  (
    { css, token },
    {
      galleryBreakpoints,
    }: {
      galleryBreakpoints: Record<number, GalleryBreakpointSettings>;
    }
  ) => ({
    container: css`
      width: 100%;
      ${getGalleryStyles(galleryBreakpoints, token)}

      ${mq.lg} {
        padding: ${token.padding}px;
      }
    `,
    gallery: css`
      height: 100%;
      /* TODO: remove this */
      width: 100vw;
      ${mq.lg} {
        width: 100%;
      }
    `,
    buySection: css`
      padding: ${token.padding}px;
      border-radius: ${token.borderRadius}px;
      border: 1px solid ${token.colorBorder};
    `,
    cartBtn: css`
      flex: 1;
      width: 100%;
    `,
    optionsTitle: css`
      font-size: ${token.fontSizeSM}px;
    `,
    optionsDivider: css`
      margin: 0;
      padding: 0;
    `,
    buyNowBtn: css`
      display: flex;
      align-items: center;
      justify-content: space-between;
    `,
    title: css`
      margin: 0;
      word-break: break-word;
    `,
    categoryButton: css`
      width: fit-content;
      padding: 0;
      margin: 0;
    `,
    productInfo: css`
      padding: 0 ${token.padding}px;
      max-width: 100%;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      --thumb-size: 70px;

      ${mq.lg} {
        padding: 0 1px;
      }
    `,
  })
);
