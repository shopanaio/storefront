'use client';

import type { HomeProduct } from '@shopana/storefront-sdk/modules/home/core/types';
import { Card, Typography } from 'antd';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Price } from '@/components/UI/Price/Price';
import { Thumbnail } from '@/components/UI/Thumbnail/Thumbnail';

const { Text, Paragraph } = Typography;

interface Props {
  product: HomeProduct;
}

export function HomeSlideshowProductCard({ product }: Props) {
  const locale = useLocale();
  const { styles } = useStyles();

  const price = {
    amount: Number(product.price.amount),
    currencyCode: product.price.currencyCode,
  };

  const compareAtPrice = product.compareAtPrice
    ? {
        amount: Number(product.compareAtPrice.amount),
        currencyCode: product.compareAtPrice.currencyCode,
      }
    : undefined;

  return (
    <Link
      href={`/${locale}/product/${product.product.handle}?variant=${product.handle}`}
      className={styles.link}
    >
      <Card className={styles.card} styles={{ body: { padding: 12 } }} hoverable>
        <div className={styles.imageWrapper}>
          <Thumbnail
            src={product.image?.url}
            alt={product.title}
            className={styles.image}
          />
        </div>
        <div className={styles.content}>
          <Text type="secondary" className={styles.productName}>
            {product.product.title}
          </Text>
          <Paragraph strong className={styles.title} ellipsis={{ rows: 2 }}>
            {product.title}
          </Paragraph>
          <div className={styles.priceWrapper}>
            <Price money={price} className={styles.price} />
            {compareAtPrice && (
              <Price money={compareAtPrice} className={styles.comparePrice} />
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

const useStyles = createStyles(({ css, token }) => ({
  link: css`
    text-decoration: none;
    display: block;
    height: 100%;
  `,
  card: css`
    height: 100%;
    display: flex;
    flex-direction: column;
  `,
  imageWrapper: css`
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: ${token.borderRadius}px;
    margin-bottom: ${token.marginSM}px;
  `,
  image: css`
    width: 100%;
    height: 100%;
    object-fit: cover;
  `,
  content: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,
  productName: css`
    font-size: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  `,
  title: css`
    font-size: 14px;
    line-height: 1.3;
  `,
  priceWrapper: css`
    display: flex;
    align-items: center;
    gap: ${token.marginXS}px;
    margin-top: auto;
  `,
  price: css`
    font-weight: 600;
    font-size: 16px;
  `,
  comparePrice: css`
    font-size: 14px;
    color: ${token.colorTextSecondary};
    text-decoration: line-through;
  `,
}));
