import { Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import { useTranslations } from "next-intl";
import { TbCircleCheckFilled } from "react-icons/tb";

const { Text } = Typography;

type Size = "default" | "large";
type Color = "default" | "primary";
export const IncludedInSetBadge = ({
  size = "default",
  color = "default",
}: {
  size?: Size;
  color?: Color;
}) => {
  const t = useTranslations("Product");
  const { styles, theme } = useStyles({ size, color });

  return (
    <Flex gap={4} align="center" className={styles.freeBadge}>
      <TbCircleCheckFilled
        color={theme.colorPrimary}
        size={size === "large" ? 16 : 12}
      />
      <Text>{t("included-in-set")}</Text>
    </Flex>
  );
};

const useStyles = createStyles(
  ({ css, token }, { size, color }: { size: Size; color: Color }) => ({
    freeBadge: css`
      & span {
        font-size: ${size === "large" ? token.fontSizeLG : token.fontSize}px;
        color: ${color === "primary" ? token.colorPrimary : token.colorText};
      }
    `,
  })
);
