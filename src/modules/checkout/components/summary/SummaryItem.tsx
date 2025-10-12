import { Flex, Typography } from "antd";
import { Badge } from "@src/components/UI/Badge";
import { createStyles } from "antd-style";
import { Thumbnail } from "@src/components/UI/Thumbnail/Thumbnail";
import type { Checkout } from "@src/modules/checkout/types/entity";
import { Money } from "@src/components/UI/Price/Money";
import { composeProductTitle } from "@src/utils/composeProductTitle";

const { Text } = Typography;

interface Prop {
  line: Checkout.Line;
}

export const SummaryItem = ({ line }: Prop) => {
  const { styles } = useStyles();

  const title = composeProductTitle({
    productTitle: line.purchasable?.product?.title,
    variantTitle: line.purchasable?.title ?? line.title,
    fallback: line.title,
  });
  const imageUrl = line.imageSrc ?? line.purchasable?.cover?.url;

  return (
    <Flex className={styles.item} align="center" justify="space-between">
      <Flex align="center" gap={16}>
        <Badge
          size="default"
          count={line.quantity}
          variant="primary"
          offset={[-4, 4]}
        >
          <Thumbnail
            className={styles.thumbnail}
            src={imageUrl}
            alt={title}
          />
        </Badge>
        <Text className={styles.productName}>{title}</Text>
      </Flex>
      <Money strong as={Text} money={line.cost.totalAmount} />
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  item: css`
    border-radius: ${token.borderRadius}px;
    background-color: ${token.colorBgBase};
    padding: ${token.paddingXS}px;
    padding-right: ${token.padding}px;
  `,
  thumbnail: css`
    width: 50px;
    height: 50px;
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
    width: 200px;
  `,
}));
