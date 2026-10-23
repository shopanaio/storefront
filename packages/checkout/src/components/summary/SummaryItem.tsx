import { Flex, Typography } from 'antd';
import { Badge } from '#checkout/ui/Badge';
import { createStyles } from 'antd-style';
import { THUMBNAIL_SIZE, Thumbnail } from '#checkout/ui/Thumbnail';
import type { Checkout } from '#checkout/types/entity';
import { Money } from '#checkout/ui/Money';
import { composeProductTitle } from '#checkout/ui/composeProductTitle';
import { useTranslations } from 'next-intl';

const { Text } = Typography;

interface Prop {
  line: Checkout.Line;
  /** The line cannot be delivered to the address (R7). */
  undeliverable?: boolean;
  /** Framed like the fields of the checkout; a list that divides its items turns it off. */
  bordered?: boolean;
  /** Shows the cost of the line on the right; a list of lines to act on leaves it out. */
  priced?: boolean;
  /** Shows the quantity as a badge on the thumbnail. */
  counted?: boolean;
  className?: string;
}

export const SummaryItem = ({
  line,
  undeliverable = false,
  bordered = true,
  priced = true,
  counted = true,
  className,
}: Prop) => {
  const { styles, cx } = useStyles();
  const t = useTranslations('Checkout');

  const title = composeProductTitle({
    productTitle: line.purchasable?.product?.title,
    variantTitle: line.purchasable?.title ?? line.title,
    fallback: line.title,
  });
  const imageUrl = line.imageSrc ?? line.purchasable?.cover?.url;
  const thumbnail = (
    <Thumbnail className={styles.thumbnail} src={imageUrl} alt={title} />
  );

  return (
    <Flex
      className={cx(bordered && styles.item, className)}
      align="center"
      justify="space-between"
      gap={16}
    >
      <Flex align="center" gap={16} className={styles.main}>
        {counted ? (
          <Badge
            size="default"
            count={line.quantity}
            variant="primary"
            offset={[-4, 4]}
          >
            {thumbnail}
          </Badge>
        ) : (
          thumbnail
        )}
        <Flex vertical className={styles.main}>
          <Text className={styles.productName}>{title}</Text>
          {undeliverable && (
            <Text type="danger" className={styles.note}>
              {t('line-undeliverable')}
            </Text>
          )}
        </Flex>
      </Flex>
      {priced && (
        <Money
          strong
          as={Text}
          money={line.cost.totalAmount}
          className={styles.price}
        />
      )}
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  item: css`
    /* The same border as the fields of the checkout. */
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;
    background-color: ${token.colorBgBase};
    padding: ${token.paddingXS}px;
    padding-right: ${token.padding}px;
  `,
  thumbnail: css`
    width: ${THUMBNAIL_SIZE}px;
    height: ${THUMBNAIL_SIZE}px;
  `,
  productName: css`
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
    white-space: normal;
    font-size: ${token.fontSize}px;
    font-weight: 500;
  `,
  // The title takes the room up to the price, and is cut only when it does not fit.
  main: css`
    flex: 1;
    min-width: 0;
  `,
  price: css`
    flex: none;
    white-space: nowrap;
  `,
  note: css`
    font-size: ${token.fontSizeSM}px;
  `,
}));
