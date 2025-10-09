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
import BoxBuilderGrid from "@src/modules/box-builder/components/BoxBuilderGrid";
import Layout from "@src/modules/box-builder/components/Layout";
import { LayoutFooterButton } from "@src/modules/box-builder/components/Layout";
import { Activity, useFlow } from "@src/modules/box-builder/Stack";
import React, { Suspense } from "react";
import type { Listing$key } from "@src/relay/queries/__generated__/Listing.graphql";
import { PersistedModal } from "@src/modules/box-builder/components/PersistedModal";
import CategoryQueryNode, {
  CategoryQuery,
} from "@src/relay/queries/__generated__/CategoryQuery.graphql";
import useSerializablePreloadedQuery from "@src/relay/useSerializablePreloadedQuery";
import { useQuery } from "@src/providers/relay-query-provider";
import { ProductType } from "@src/modules/box-builder/components/ProductCard";
import { BoxBuilderSectionSkeleton } from "../skeletons/SectionSkeleton";
import { StepHeader } from "@src/modules/box-builder/components/StepHeader";
import { ProductCardRelay } from "@src/modules/box-builder/components/ProductCardRelay";
import { useListingProductCardFragment_product$key } from "@src/components/Listing/relay/__generated__/useListingProductCardFragment_product.graphql";
import { useBoxBuilderProgress } from "@src/modules/box-builder/hooks/useCartProgress";

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

  const products: useListingProductCardFragment_product$key[] =
    listingData?.listing?.edges?.map(
      ({ node }) => node as useListingProductCardFragment_product$key
    ) ?? [];

  return (
    <BoxBuilderGrid>
      {products.map(
        (product: useListingProductCardFragment_product$key, idx: number) => (
          <ProductCardRelay
            key={idx}
            product={product}
            allowCount={false}
            productType={ProductType.Box}
          />
        )
      )}
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

  const { boxes } = useBoxBuilderProgress();
  console.log("selectedBoxId", boxes.products);

  const handleFooterBtnClick = () => {
    push(Activity.Step2, {});
  };

  const footerContent =
    boxes.quantity > 0 ? (
      <LayoutFooterButton
        onClick={handleFooterBtnClick}
        label={t("footer.boxes-count", { count: boxes.quantity })}
        money={boxes.totalAmount}
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
