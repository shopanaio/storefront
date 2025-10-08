"use client";

import { Flex, Typography, Button } from "antd";
import { createStyles } from "antd-style";
import React from "react";
import { AdditionalInfoSection } from "./AdditionalInfoSection";
import { StockStatus } from "./StockStatus";
import { AdditionalInfo } from "./AdditionalInfo";
import { ApiProduct } from "@codegen/schema-client";
import { PriceAndSale } from "./PriceAndSale";
import { useTranslations } from "next-intl";
import { useRoutes } from "@src/hooks/useRoutes";
import { ProductComponents } from "@src/components/Product/Options/ProductComponents";
import { ProductRating } from "../UI/Rating/Rating";
import { ProductWishlistButton } from "@src/components/Listing/ProductWishlistButton";
import { ProductOptions } from "@src/components/Product/Options/ProductOptions";
import {
  getGalleryStyles,
  GalleryBreakpointSettings,
} from "@src/utils/galleryStyles";
import { breakpoints, mq } from "@src/components/Theme/breakpoints";
import { useProductGallery } from "@src/hooks/useProductGallery";
import { useGalleryBreakpoints } from "@src/hooks/useGalleryBreakpoints";
import { ProductCartButton } from "@src/components/UI/ProductCards/ListingCard/CartButton";
import { ProductGallery } from "@src/components/Product/ProductGallery";
import useIsInTheCart from "@src/hooks/cart/useIsInTheCart";
import useAddItemToCart from "@src/hooks/cart/useAddItemToCart";

const { Text, Title } = Typography;

const defaultBreakpoints: Record<number, GalleryBreakpointSettings> = {
  0: {
    thumbnailDirection: "horizontal",
    thumbnailsPerView: 5,
    aspectRatio: 1,
    thumbnailSize: 70,
  },
  [breakpoints.lg]: {
    thumbnailDirection: "horizontal",
    thumbnailsPerView: 6,
    aspectRatio: 1,
    thumbnailSize: 90,
  },
  [breakpoints.xl]: {
    thumbnailDirection: "vertical",
    thumbnailsPerView: 7,
    aspectRatio: 1,
    thumbnailSize: 90,
  },
  [breakpoints.xxl]: {
    thumbnailDirection: "vertical",
    thumbnailsPerView: 8,
    aspectRatio: 1,
    thumbnailSize: 90,
  },
};

interface ProductMainProps {
  product: ApiProduct;
  galleryBreakpoints?: Record<number, GalleryBreakpointSettings>;
  appearance?: "page" | "box-builder";
}

export const ProductMain = ({
  product,
  galleryBreakpoints = defaultBreakpoints,
  appearance = "page",
}: ProductMainProps) => {
  const t = useTranslations("Product");
  const routes = useRoutes();
  const { isInCart } = useIsInTheCart({ product });

  console.log("product", product);
  console.log("isInCart", isInCart);

  const { addToCart, isInFlight } = useAddItemToCart();
  const gallery = useProductGallery(product);
  const { styleBreakpoints, swiperBreakpoints } = useGalleryBreakpoints(
    galleryBreakpoints,
    gallery.length
  );

  const { styles } = useStyles({
    galleryBreakpoints: styleBreakpoints,
  });

  const groupsLength = product.groups?.length ?? 0;
  const optionsLength = product.options?.length ?? 0;

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
                type="link"
                href={routes.category.path(product.category.handle)}
                className={styles.categoryButton}
              >
                {product.category.title}
              </Button>
            )}
            <Title level={3} className={styles.title}>
              {product.title}
            </Title>
            <Flex justify="space-between" gap={20}>
              <Flex wrap gap={20}>
                <StockStatus product={product} />
                <ProductRating product={product} size="large" compact={false} />
              </Flex>
              {product.sku && (
                <Text
                  type="secondary"
                  /* className={styles.productSku} */ ellipsis
                >
                  {t("sku")}
                  {product.sku}
                </Text>
              )}
            </Flex>
          </Flex>
          {(appearance === "box-builder" || groupsLength > 3) && (
            <PriceAndSale
              compareAtPrice={product.compareAtPrice}
              price={product.price}
              stockStatus={product.stockStatus}
            />
          )}
          {optionsLength > 0 && <ProductOptions product={product} />}
          {groupsLength > 0 && <ProductComponents product={product} />}
          {appearance === "page" && (
            <Flex className={styles.buySection} vertical gap={16}>
              <PriceAndSale
                compareAtPrice={product.compareAtPrice}
                price={product.price}
                stockStatus={product.stockStatus}
              />

              <Flex wrap gap={16}>
                <ProductCartButton
                  isAvailable={product.stockStatus.isAvailable}
                  showLabel
                  className={styles.cartBtn}
                  isInCart={isInCart}
                  isLoading={isInFlight}
                  onAddToCart={() => {
                    if (!isInCart) {
                      addToCart({
                        product: product,
                        quantity: 1,
                      });
                    }
                  }}
                />
              </Flex>
              <ProductWishlistButton productId={product.id} showLabel />
              <AdditionalInfo />
            </Flex>
          )}
          {appearance === "page" && <AdditionalInfoSection />}
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
    `,
    gallery: css`
      height: 100%;
      /* TODO: remove this */
      width: calc(100vw - ${token.padding * 2}px);
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
      padding: 0 1px;
      max-width: 100%;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      --thumb-size: 70px;
    `,
  })
);
