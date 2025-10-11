'use client';

import { Button, Flex } from 'antd';
import { createStyles } from 'antd-style';
import { ProductCardRelay } from '../ProductCardRelay';
import BoxBuilderSwiperHeader from './SwiperHeader';
import { usePaginationFragment } from 'react-relay';
import { Listing$key } from '@src/relay/queries/__generated__/Listing.graphql';
import { TbChevronRight } from 'react-icons/tb';
import { Activity, useFlow } from '../../Stack';
import { useTranslations } from 'next-intl';
import { mq } from '@src/components/Theme/breakpoints';
import { Listing } from '@src/relay/queries/Listing.shopana';
import { ProductType } from '@src/modules/box-builder/components/ProductCard';
interface Props {
  category: Listing$key;
}

export default function BoxBuilderSwiperSection({ category }: Props) {
  const { styles } = useStyles();
  const { push } = useFlow();
  const t = useTranslations('BoxBuilder.step2');

  const { data, hasNext } = usePaginationFragment(Listing, category);

  const products = data?.listing?.edges?.map((edge) => edge.node) ?? [];

  return (
    <Flex vertical gap={12}>
      <BoxBuilderSwiperHeader title={data?.title} handle={data?.handle} />
      <div className={styles.swiperContainer}>
        {products.slice(0, 9).map((product, idx) => (
          <ProductCardRelay
            key={idx}
            product={product}
            allowCount={true}
            productType={ProductType.Product}
          />
        ))}

        {hasNext && (
          <Button
            className={styles.allProducts}
            icon={<TbChevronRight size={20} />}
            iconPosition="end"
            onClick={() => {
              push(Activity.Category, {
                categoryHandle: data?.handle,
              });
            }}
          >
            {t('all-products')}
          </Button>
        )}
      </div>
    </Flex>
  );
}

const useStyles = createStyles(({ token, css }) => {
  return {
    swiperContainer: css`
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: 140px;
      gap: ${token.marginSM}px;
      overflow-x: scroll;
      scrollbar-width: none;
      padding: 1px ${token.padding}px;
      /*
      ${mq.md} {

      } */
    `,
    allProducts: css`
      aspect-ratio: 1 / 1;
      height: auto;
      border-radius: ${token.borderRadiusLG}px;
      font-weight: ${token.fontWeightStrong};
    `,
  };
});
