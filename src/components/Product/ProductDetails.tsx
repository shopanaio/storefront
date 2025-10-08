"use client";

import { Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import React from "react";
import { ProductRateSummary } from "./Rate/ProductRateSummary";
import { ProductCollapse } from "./ProductCollapse";
import { mq } from "@src/components/Theme/breakpoints";
import { ProductSpecification } from "./ProductSpecification";
import { ShowMoreBtn } from "./ShowMoreBtn";
import type * as Entity from "@src/entity/namespace";
import { useTranslations } from "next-intl";
import { ReviewsSection } from "./Rate/Reviews";
import { Reviews$key } from "@src/relay/queries/__generated__/Reviews.graphql";
import { ShippingReturnsInfo } from "./ShippingReturnsInfo";

const { Paragraph } = Typography;

interface ProductDetailsProps {
  product: Entity.Product & Reviews$key;
}

export const ProductDetails = ({ product }: ProductDetailsProps) => {
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
          {product.reviews?.edges?.length > 0 && (
            <ReviewsSection product={product} />
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
