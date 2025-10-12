'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { StepHeader } from '@src/modules/box-builder/components/StepHeader';
import { usePaginationFragment } from 'react-relay';
import { Listing } from '@src/relay/queries/Listing.shopana';
import BoxBuilderGrid from '@src/modules/box-builder/components/BoxBuilderGrid';
import { ActivityComponentType } from '@stackflow/react';
import Layout, {
  LayoutFooterButton,
} from '@src/modules/box-builder/components/Layout';
import { Activity, useFlow } from '@src/modules/box-builder/Stack';
import { useCategory } from '@src/modules/box-builder/hooks/useCategory';
import { BOX_BUILDER_CONFIG } from '@src/modules/box-builder/config/categories';
import React, { Suspense } from 'react';
import type { Listing$key } from '@src/relay/queries/__generated__/Listing.graphql';
import type { useListingProductCardFragment_product$key } from '@src/components/Listing/relay/__generated__/useListingProductCardFragment_product.graphql';
import { ProductType } from '@src/modules/box-builder/components/ProductCard';
import { useBoxBuilderProgress } from '@src/modules/box-builder/hooks/useCartProgress';
import { ProductCardRelay } from '@src/modules/box-builder/components/ProductCardRelay';
import { BoxBuilderGridSkeleton } from '@src/modules/box-builder/skeletons/GridSkeleton';
import { useForceSkeleton } from '@src/modules/box-builder/hooks/useForceSkeleton';

const ProductsSection: React.FC = () => {
  const { category } = useCategory(BOX_BUILDER_CONFIG.step3.category.handle);
  const categoryKey = category as unknown as Listing$key;
  const { data } = usePaginationFragment(Listing, categoryKey);
  const products: useListingProductCardFragment_product$key[] = (
    data?.listing?.edges ?? []
  ).map((edge) => edge.node as useListingProductCardFragment_product$key);
  return (
    <BoxBuilderGrid>
      {products.map((product, idx) => (
        <ProductCardRelay
          key={idx}
          product={product}
          allowCount={false}
          productType={ProductType.Card}
        />
      ))}
    </BoxBuilderGrid>
  );
};

const Step3: ActivityComponentType = () => {
  const { styles } = useStyles();
  const t = useTranslations('BoxBuilder');
  const { push } = useFlow();
  const { cards } = useBoxBuilderProgress();

  const forceSkeleton = useForceSkeleton();

  const handleFooterBtnClick = () => {
    push(Activity.Cart, {});
  };

  let footerContent: React.ReactNode = null;
  if (cards.quantity > 0) {
    footerContent = (
      <LayoutFooterButton
        onClick={handleFooterBtnClick}
        label={t('footer.cards-count', { count: cards.quantity })}
        money={cards.totalAmount}
      />
    );
  } else {
    footerContent = (
      <LayoutFooterButton
        onClick={handleFooterBtnClick}
        label={t('skip')}
        divider={null}
        type="default"
      />
    );
  }

  return (
    <Layout footer={footerContent}>
      <Flex vertical className={styles.container} gap={24}>
        <StepHeader
          stepNumber={3}
          title={t('step3.title')}
          description={t('step3.description')}
        />
        {forceSkeleton ? (
          <BoxBuilderGridSkeleton count={5} />
        ) : (
          <Suspense fallback={<BoxBuilderGridSkeleton count={5} />}>
            <ProductsSection />
          </Suspense>
        )}
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
