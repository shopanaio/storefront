import { Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import type { model } from "@shopana/storefront-sdk";
import { Price } from '@src/ui-kit/Price/Price';
import { SaleBadge } from '@src/ui-kit/Badges/Sale';
import { calcSaleMoney } from '@src/utils/calcSaleMoney';
import { useTranslations } from 'next-intl';

interface Props {
  compareAtPrice?: model.Money | null;
  price: model.Money;
  stockStatus: model.StockStatus | null;
}

export const PriceAndSale = ({ compareAtPrice, price, stockStatus }: Props) => {
  const t = useTranslations('Product');
  const { styles } = useStyles();

  const sale = calcSaleMoney(compareAtPrice?.amount, price?.amount);

  return (
    <Flex justify="space-between">
      <Flex vertical>
        {compareAtPrice?.amount ? (
          <Flex align="center" gap={8}>
            <Price money={compareAtPrice} delete type="secondary" />
            <SaleBadge
              compareAtPrice={compareAtPrice?.amount}
              price={price.amount}
            />
          </Flex>
        ) : null}
        <Price
          money={price}
          className={styles.price}
          type={stockStatus?.isAvailable ? undefined : 'secondary'}
        />
        {sale ? (
          <Typography.Text>
            {t('discount')} ${sale}
          </Typography.Text>
        ) : null}
      </Flex>
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  price: css`
    font-weight: 900;
    font-size: ${token.fontSizeHeading2}px;
  `,
}));
