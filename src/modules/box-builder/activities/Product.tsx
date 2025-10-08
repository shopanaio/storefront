"use client";

import { Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import { ProductMain } from "@src/components/Product/ProductMain";
import { useIsInTheBoxBuilderCart } from "@src/modules/box-builder/hooks/useIsInTheCart";
import { ActivityComponentType } from "@stackflow/react";
import Layout from "../stackflow/Layout";
import { useProduct } from "@src/modules/box-builder/hooks/useProduct";
import { Reviews$key } from "@src/relay/queries/__generated__/Reviews.graphql";
import { ApiProduct } from "@codegen/schema-client";
import React, { Suspense } from "react";
import { ProductType } from "@src/modules/box-builder/components/ProductCard";
import { BoxActionButton } from "@src/modules/box-builder/components/ActionButton/BoxActionButton";
import { ProductActionButton } from "@src/modules/box-builder/components/ActionButton/ProductActionButton";
import { CardActionButton } from "@src/modules/box-builder/components/ActionButton/CardActionButton";
import { ShowMoreBtn } from "@src/components/Product/ShowMoreBtn";
import { useTranslations } from "next-intl";
import { SkeletonProduct } from "@src/components/Product/Skeleton";

const { Paragraph } = Typography;

type ProductParams = {
  productHandle: string;
  productType: ProductType;
};

const ProductSection: React.FC<{
  productHandle: string;
  productType: ProductType;
}> = ({ productHandle, productType }) => {
  const t = useTranslations("BoxBuilder");
  const { styles } = useStyles();
  const { product } = useProduct(productHandle);
  const cartLine = useIsInTheBoxBuilderCart(product?.id ?? "");
  const isInCart = Boolean(cartLine);
  const { quantity = 0 } = cartLine || {};

  // Get first variant for price and stock status
  const firstVariant = product?.variants?.[0];
  const isAvailable = firstVariant?.stockStatus?.isAvailable === true;
  const isFree = parseFloat(firstVariant?.price?.amount ?? "0") === 0;

  // TODO: don't fetch reviews
  const productWithReviews = product as unknown as ApiProduct & Reviews$key;

  const renderFooter = () => {
    if (!product?.id) {
      return null;
    }

    let button = null;
    if (productType === ProductType.Box) {
      button = (
        <BoxActionButton
          productId={product.id}
          isAvailable={Boolean(isAvailable)}
          appearance="activity"
          isFree={Boolean(isFree)}
          isInCart={isInCart}
          quantity={quantity}
          buttonProps={{
            size: "large",
            className: styles.cartButton,
            type: "primary",
          }}
        />
      );
    } else if (productType === ProductType.Card) {
      button = (
        <CardActionButton
          productId={product.id}
          isAvailable={Boolean(isAvailable)}
          isFree={Boolean(isFree)}
          isInCart={isInCart}
          quantity={quantity}
          appearance="activity"
          buttonProps={{
            size: "large",
            className: styles.cartButton,
            type: "primary",
          }}
          quantityProps={{
            size: "large",
            appearance: "activity",
          }}
        />
      );
    } else {
      button = (
        <ProductActionButton
          productId={product.id}
          isAvailable={Boolean(isAvailable)}
          isFree={Boolean(isFree)}
          isInCart={isInCart}
          quantity={quantity}
          appearance="activity"
          buttonProps={{
            size: "large",
            className: styles.cartButton,
            type: "primary",
          }}
          quantityProps={{
            size: "large",
            appearance: "activity",
          }}
        />
      );
    }

    return <Flex className={styles.productFooter}>{button}</Flex>;
  };

  return (
    <>
      <div className={styles.container}>
        <ProductMain product={productWithReviews} appearance="box-builder" />
        <Flex vertical gap={16}>
          {productWithReviews.description && (
            <>
              <Paragraph className={styles.description}>
                {productWithReviews.description}
              </Paragraph>
              <ShowMoreBtn />
            </>
          )}
        </Flex>
        {renderFooter()}
      </div>
    </>
  );
};

const Product: ActivityComponentType<ProductParams> = ({
  params,
}: {
  params: ProductParams;
}) => {
  return (
    <Layout showCart={false} paddingTop={false}>
      <Suspense fallback={<SkeletonProduct />}>
        <ProductSection
          productHandle={params.productHandle}
          productType={params.productType}
        />
      </Suspense>
    </Layout>
  );
};

export default Product;

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      position: relative;
      padding: ${token.padding}px;
    `,
    productFooter: css`
      position: fixed;
      left: 0;
      bottom: 0;
      width: 100%;
      padding: ${token.padding}px;
      z-index: 2;
    `,
    quantityContainer: css`
      width: 100%;
    `,
    cartButton: css`
      width: 100%;
      height: 48px;
    `,
    description: css`
      margin-top: ${token.margin}px;
      font-size: ${token.fontSizeLG}px;
    `,
  };
});
