"use client";

import { Flex } from "antd";
import { createStyles } from "antd-style";
import { useTranslations } from "next-intl";
import { StepHeader } from "@src/components/BoxBuilder/StepHeader";
import { ProductCardRelay } from "@src/components/Listing/ProductCard.shopana";
import { usePaginationFragment } from "react-relay";
import { Listing } from "@src/relay/queries/Listing.shopana";
import BoxBuilderGrid from "../BoxBuilderGrid";
import { ActivityComponentType } from "@stackflow/react";
import Layout, { LayoutFooterButton } from "../stackflow/Layout";
import { Activity, useFlow } from "../stackflow/Stack";
import { useCategory } from "@src/components/BoxBuilder/hooks/useCategory";
import { CheckoutSkeleton } from "../../Checkout/CheckoutSkeleton";
import React, { Suspense } from "react";
import type { Listing$key } from "@src/relay/queries/__generated__/Listing.graphql";
import type { ProductCardRelay_product$key } from "@src/components/Listing/__generated__/ProductCardRelay_product.graphql";
import { ProductType } from "@src/components/BoxBuilder/ProductCard";
import { useCartProgress } from "@src/components/BoxBuilder/hooks/useCartProgress";
import { useCart } from "@src/components/BoxBuilder/hooks/useCart";
import type { ApiMoney } from "@codegen/schema-client";

const ProductsSection: React.FC = () => {
  const { category } = useCategory("postcards");
  const categoryKey = category as unknown as Listing$key;
  const { data } = usePaginationFragment(Listing, categoryKey);
  const products: ProductCardRelay_product$key[] = (
    data?.listing?.edges ?? []
  ).map((edge) => edge.node as ProductCardRelay_product$key);
  return (
    <BoxBuilderGrid>
      {products.map((product, idx) => (
        <ProductCardRelay
          key={idx}
          product={product}
          allowCount={true}
          productType={ProductType.Card}
        />
      ))}
    </BoxBuilderGrid>
  );
};

type Step3Params = {};

const Step3: ActivityComponentType<Step3Params> = () => {
  const { styles } = useStyles();
  const t = useTranslations("BoxBuilder");
  const { push } = useFlow();

  const { selectedEnvelopesInCart, envelopesTotalPriceAmount } =
    useCartProgress();
  const { cart } = useCart();

  const handleFooterBtnClick = () => {
    push(Activity.Cart, {});
  };

  const selectedCardsCount = selectedEnvelopesInCart.length;
  const baseMoney = cart?.cost?.totalAmount;
  const envelopesMoney: ApiMoney | undefined = baseMoney
    ? {
        amount: Math.max(0, envelopesTotalPriceAmount),
        currencyCode: baseMoney.currencyCode as ApiMoney["currencyCode"],
      }
    : undefined;

  let footerContent: React.ReactNode = null;
  if (selectedCardsCount > 0) {
    footerContent = (
      <LayoutFooterButton
        onClick={handleFooterBtnClick}
        label={t("footer.cards-count", { count: selectedCardsCount })}
        money={envelopesMoney}
      />
    );
  } else {
    footerContent = (
      <LayoutFooterButton
        onClick={handleFooterBtnClick}
        label={t("skip")}
        divider={null}
        type="default"
      />
    );
  }

  return (
    <Layout footer={footerContent}>
      <Flex vertical className={styles.container} gap={32}>
        <Flex vertical>
          <StepHeader
            stepNumber={3}
            title={t("step3.title")}
            description={t("step3.description")}
          />

          <Suspense fallback={<CheckoutSkeleton />}>
            <ProductsSection />
          </Suspense>
        </Flex>
      </Flex>
    </Layout>
  );
};

export default Step3;

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      display: flex;
      flex-direction: column;
      padding: 0 ${token.padding}px;
      min-height: max-content;
      height: 100%;
    `,
    footerBtn: css``,
  };
});
