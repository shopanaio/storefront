import { Badge, Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import { mq } from "@src/components/Theme/breakpoints";
import { Thumbnail } from "@src/components/UI/Thumbnail/Thumbnail";
import { Entity } from "@src/entity";
import { Money } from "@src/components/UI/Price/Money";

const { Text } = Typography;

interface Prop {
  line: Entity.CartLine;
}

export const SummaryItem = ({ line }: Prop) => {
  const { styles } = useStyles();

  return (
    <Flex className={styles.item} align="center" justify="space-between">
      <Flex align="center" gap={16}>
        <Badge
          size="default"
          count={line.quantity}
          color="blue"
          offset={[-4, 4]}
        >
          <Thumbnail
            className={styles.thumbnail}
            src={line.purchasable?.cover?.url}
            alt={line.purchasable?.title}
          />
        </Badge>
        <Text className={styles.productName}>{line.purchasable?.title}</Text>
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
