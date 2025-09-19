"use client";

import { ActivityComponentType } from "@stackflow/react";
import { Flex } from "antd";
import { createStyles } from "antd-style";
import { useTranslations } from "next-intl";
import {
  usePaginationFragment,
  usePreloadedQuery,
  useRelayEnvironment,
} from "react-relay";
import { Listing } from "@src/relay/queries/Listing.shopana";
import { ProductCardRelay } from "@src/components/Listing/ProductCard.shopana";
import BoxBuilderGrid from "../BoxBuilderGrid";
import Layout from "../stackflow/Layout";
import { LayoutFooterButton } from "../stackflow/Layout";
import { Activity, useFlow } from "../stackflow/Stack";
import { useBoxBuilderStore } from "@src/store/appStore";
import { useFindProductInCart } from "@src/components/BoxBuilder/hooks/useFindProductInCart";
import React, { Suspense } from "react";
import type { ProductCardRelay_product$key } from "@src/components/Listing/__generated__/ProductCardRelay_product.graphql";
import type { Listing$key } from "@src/relay/queries/__generated__/Listing.graphql";
import { PersistedModal } from "@src/components/BoxBuilder/PersistedModal";
import CategoryQueryNode, {
  CategoryQuery,
} from "@src/relay/queries/__generated__/CategoryQuery.graphql";
import useSerializablePreloadedQuery from "@src/relay/useSerializablePreloadedQuery";
import { useQuery } from "@src/providers/relay-query-provider";
import { ProductType } from "@src/components/BoxBuilder/ProductCard";
import { BoxBuilderSectionSkeleton } from "../skeletons/SectionSkeleton";
import { StepHeader } from "@src/components/BoxBuilder/StepHeader";

const ProductsSection: React.FC = () => {
  const environment = useRelayEnvironment();
  const step1Preloaded = useQuery();
  const queryReference = useSerializablePreloadedQuery(
    environment,
    step1Preloaded
  );
  const data = usePreloadedQuery<CategoryQuery>(
    CategoryQueryNode,
    queryReference
  );
  const categoryKey = (data?.category ?? null) as unknown as Listing$key;
  const { data: listingData } = usePaginationFragment(Listing, categoryKey);

  const products: ProductCardRelay_product$key[] =
    listingData?.listing?.edges?.map(
      ({ node }) => node as ProductCardRelay_product$key
    ) ?? [];

  return (
    <BoxBuilderGrid>
      {products.map((product: ProductCardRelay_product$key, idx: number) => (
        <ProductCardRelay
          key={idx}
          product={product}
          allowCount={false}
          productType={ProductType.Box}
        />
      ))}
    </BoxBuilderGrid>
  );
};

type Step1Params = {
  categoryHandle: string;
};

const Step1: ActivityComponentType<Step1Params> = () => {
  const { styles } = useStyles();
  const t = useTranslations("BoxBuilder");
  const { push } = useFlow();

  const { selectedBoxId } = useBoxBuilderStore();
  const selectedBox = useFindProductInCart(selectedBoxId);

  const handleFooterBtnClick = () => {
    push(Activity.Step2, {});
  };

  const footerContent =
    selectedBoxId !== "" && selectedBox?.title !== undefined ? (
      <LayoutFooterButton
        onClick={handleFooterBtnClick}
        label={selectedBox?.title}
        money={selectedBox?.cost?.totalAmount}
      />
    ) : null;

  return (
    <Layout footer={footerContent}>
      <Flex vertical className={styles.container} gap={32}>
        <StepHeader
          stepNumber={1}
          title={t("step1.title")}
          description={t("step1.description")}
        />
        <Suspense
          fallback={<BoxBuilderSectionSkeleton items={8} titleRows={1} />}
        >
          <ProductsSection />
        </Suspense>
      </Flex>
      <PersistedModal />
    </Layout>
  );
};

export default Step1;

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 0 ${token.padding}px;
    min-height: max-content;
    height: 100%;
  `,
}));
