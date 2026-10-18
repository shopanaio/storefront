'use client';

import { Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { Badge } from '#checkout/ui/Badge';
import { Thumbnail } from '#checkout/ui/Thumbnail';
import { composeProductTitle } from '#checkout/ui/composeProductTitle';
import type { Checkout } from '#checkout/types/entity';

const { Text } = Typography;

const lineTitle = (line: Checkout.Line) =>
  composeProductTitle({
    productTitle: line.purchasable?.product?.title,
    variantTitle: line.purchasable?.title ?? line.title,
    fallback: line.title,
  });

/** Lines of a shipment: picture, title and quantity of each. */
export const ShipmentLines = ({ lines }: { lines: Checkout.Line[] }) => {
  const { styles } = useStyles();
  return (
    <Flex vertical gap={8}>
      {lines.map((line) => {
        const title = lineTitle(line);
        return (
          <Flex key={line.id} align="center" gap={12}>
            <Badge size="small" count={line.quantity} variant="primary" offset={[-4, 4]}>
              <Thumbnail
                className={styles.thumbnail}
                src={line.imageSrc ?? line.purchasable?.cover?.url}
                alt={title}
                width={80}
              />
            </Badge>
            <Text className={styles.title}>{title}</Text>
          </Flex>
        );
      })}
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  thumbnail: css`
    width: 40px;
    height: 40px;
  `,
  title: css`
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: ${token.fontSizeSM}px;
  `,
}));
