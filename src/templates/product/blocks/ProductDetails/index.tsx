"use client";

import { Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import React from "react";
import { ProductRateSummary } from "../Rate/ProductRateSummary";
import { ProductCollapse } from "../../atoms/ProductCollapse";
import { mq } from "@src/ui-kit/Theme/breakpoints";
import { ProductSpecification } from "../../atoms/ProductSpecification";
import { ShowMoreBtn } from "../../atoms/ShowMoreBtn";
import type { model } from "@shopana/storefront-sdk";
import { useTranslations } from "next-intl";
import { ReviewsSection } from "../Rate/Reviews";
import type { Reviews$key } from "@shopana/storefront-sdk/queries/Reviews";
import { ShippingReturnsInfo } from "../../atoms/ShippingReturnsInfo";

const { Paragraph } = Typography;

interface ProductDetailsProps {
  product: model.Product;
  productReviewsRef: Reviews$key | null;
}

export const ProductDetails = ({
  product,
  productReviewsRef,
}: ProductDetailsProps) => {
  const t = useTranslations("Product");
  const { styles } = useStyles();

  return (
    <div className={styles.container}>
      <ProductCollapse title={t("info")} panelKey={t("information-key")}>
        <Flex vertical gap={16}>
          {product.description ? (
            <>
              <Paragraph>{product.description}</Paragraph>
              <ShowMoreBtn />
            </>
          ) : (
            <Paragraph>There is no description for this product</Paragraph>
          )}
        </Flex>
      </ProductCollapse>
      {product.features && <ProductSpecification features={product.features} />}
      <ProductCollapse title={t("reviews")} panelKey={t("reviews-key")}>
        <Flex vertical gap={16}>
          <ProductRateSummary product={product} />
          {productReviewsRef && (
            <ReviewsSection productRef={productReviewsRef} />
          )}
        </Flex>
      </ProductCollapse>
      <ProductCollapse
        title={t("shipping-returns")}
        panelKey={t("shipping-returns-key")}
      >
        <ShippingReturnsInfo />
      </ProductCollapse>
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    display: flex;
    flex-direction: column;
    border-radius: ${token.borderRadius}px;
    margin-top: ${token.marginLG}px;
    width: 100%;

    ${mq.xl} {
      margin-right: auto;
      margin-left: auto;
      max-width: 1280px;
      height: 100%;
    }

    ${mq.xxl} {
      max-width: 1400px;
    }
  `,
}));
