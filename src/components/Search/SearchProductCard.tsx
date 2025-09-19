import { Button, Typography } from "antd";
import { createStyles } from "antd-style";
import {
  ApiArticle,
  ApiCategory,
  ApiPage,
  ApiProduct,
} from "@codegen/schema-client";
import { Thumbnail } from "@src/components/UI/Thumbnail/Thumbnail";
import { useHover } from "@src/components/UI/hooks/useHover";
import { useRoutes } from "@src/hooks/useRoutes";

const { Text } = Typography;

interface SearchProductCardProps {
  item: ApiArticle | ApiCategory | ApiPage | ApiProduct;
}

export const SearchProductCard: React.FC<SearchProductCardProps> = ({
  item,
}) => {
  const { styles } = useStyles();
  const routes = useRoutes();
  const [isHovered, hoverHandlers] = useHover();

  console.log("item", item);

  const image = item.cover?.url || item.gallery?.edges[0]?.node?.url;

  console.log("image", image);

  return (
    <Button
      className={styles.container}
      variant="link"
      color="default"
      href={routes.product.path(item.handle)}
      {...hoverHandlers}
      icon={
        <Thumbnail
          hovered={isHovered}
          className={styles.thumbnail}
          src={image}
          alt={item.title}
        />
      }
    >
      <span className={styles.content}>
        {item.title}
        {"price" in item && item.price?.amount && (
          <Text strong>${item.price.amount}</Text>
        )}
      </span>
    </Button>
  );
};

const useStyles = createStyles(({ token, css, cx }) => {
  return {
    container: css`
      display: flex;
      align-items: center;
      justify-content: flex-start;
      height: unset;
      margin-bottom: ${token.marginXXS}px;
      padding: 0;
    `,
    thumbnail: css`
      width: 48px;
      height: 48px;
    `,
    content: css`
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: ${token.paddingXS}px;
      min-width: 0;
      flex: 1;
    `,
  };
});
