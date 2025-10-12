'use client';

import { Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { ProductMain } from '@src/components/Product/ProductMain';
import { ActivityComponentType } from '@stackflow/react';
import Layout from '@src/modules/box-builder/components/Layout';
import { useProduct } from '@src/modules/box-builder/hooks/useProduct';
import React, { Suspense, useState } from 'react';
import { ProductType } from '@src/modules/box-builder/components/ProductCard';
import { BoxActionButton } from '@src/modules/box-builder/components/ActionButton/BoxActionButton';
import { ProductActionButton } from '@src/modules/box-builder/components/ActionButton/ProductActionButton';
import { CardActionButton } from '@src/modules/box-builder/components/ActionButton/CardActionButton';
import { SkeletonProduct } from '@src/components/Product/Skeleton';
import { useCurrentVariant } from '@src/hooks/useCurrentVariant';

type ProductParams = {
  productHandle: string;
  variantHandle?: string;
  productType: ProductType;
};

const ProductSection: React.FC<{
  productHandle: string;
  variantHandle?: string;
  productType: ProductType;
}> = ({ productHandle, variantHandle, productType }) => {
  const { styles } = useStyles();
  const { product } = useProduct(productHandle);

  const [selectedVariantHandle, setSelectedVariantHandle] = useState<string>(
    variantHandle ?? '' // Populate first variant handle if not provided
  );

  const { title, currentVariant } = useCurrentVariant({
    product,
    variantHandle: selectedVariantHandle,
  });

  const renderFooter = () => {
    if (!currentVariant) {
      return null;
    }

    let button = null;
    if (productType === ProductType.Box) {
      button = (
        <BoxActionButton
          variant={currentVariant}
          appearance="activity"
          buttonProps={{
            size: 'large',
            className: styles.cartButton,
            type: 'primary',
          }}
        />
      );
    } else if (productType === ProductType.Card) {
      button = (
        <CardActionButton
          variant={currentVariant}
          appearance="activity"
          buttonProps={{
            size: 'large',
            className: styles.cartButton,
            type: 'primary',
          }}
          quantityProps={{
            size: 'large',
            appearance: 'activity',
          }}
        />
      );
    } else {
      button = (
        <ProductActionButton
          variant={currentVariant}
          appearance="activity"
          buttonProps={{
            size: 'large',
            className: styles.cartButton,
            type: 'primary',
          }}
          quantityProps={{
            size: 'large',
            appearance: 'activity',
            style: {
              height: 48,
            },
          }}
        />
      );
    }

    return <Flex className={styles.productFooter}>{button}</Flex>;
  };

  return (
    <>
      <div className={styles.container}>
        <ProductMain
          title={title}
          currentVariant={currentVariant}
          appearance="box-builder"
          onChangeVariant={(handle) => {
            setSelectedVariantHandle(handle);
          }}
          // @ts-expect-error fix type
          product={product}
        />
        {/* <ShowMoreBtn /> */}
        {product && (
          <Flex vertical gap={16}>
            {product.description && (
              <div
                className={styles.description}
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}
          </Flex>
        )}
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
    <Layout showCart={false} paddingTop={false} paddingBottom={100}>
      <Suspense fallback={<SkeletonProduct />}>
        <ProductSection
          productHandle={params.productHandle}
          variantHandle={params.variantHandle}
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
      margin-top: ${token.marginXS}px;
      font-size: ${token.fontSizeLG}px;

      & p {
        margin: 0;
        padding: 0;
      }
    `,
  };
});
