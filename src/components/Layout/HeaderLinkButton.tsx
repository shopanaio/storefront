import { Badge, Button, Flex, Typography } from "antd";
import { ReactNode } from "react";
import { createStyles } from "antd-style";
import { mq } from "@src/components/Theme/breakpoints";
import clsx from "clsx";
import useToken from "antd/es/theme/useToken";

const { Text } = Typography;

type Props = {
  icon: ReactNode;
  topText: string;
  bottomText: ReactNode;
  badgeCount?: number | null;
  onClick?: () => void;
  theme?: "dark" | "light";
  mobileBlock?: boolean;
  className?: string;
};

export const HeaderLinkButton = ({
  icon,
  topText,
  bottomText,
  badgeCount,
  onClick,
  theme = "light",
  mobileBlock = false,
  className,
}: Props) => {
  const { styles } = useStyles({ theme, mobileBlock });
  const [, token] = useToken();

  const iconWithBadge = badgeCount ? (
    <Badge
      style={{
        paddingInline: 2,
        boxShadow: `0 0 0 2px ${token.colorPrimary}`,
      }}
      count={badgeCount}
      offset={[-4, 3]}
      color="blue"
      size="small"
    >
      {icon}
    </Badge>
  ) : (
    icon
  );

  return (
    <Button
      className={clsx(styles.headerLinkBtn, className)}
      variant="text"
      color="default"
      onClick={onClick}
    >
      {iconWithBadge}
      <Flex className={styles.textWrapper}>
        {topText && <Text className={styles.topText}>{topText}</Text>}
        <Text className={styles.bottomText}>{bottomText}</Text>
      </Flex>
    </Button>
  );
};

const useStyles = createStyles(
  (
    { token, css },
    { mobileBlock }: { theme: "dark" | "light"; mobileBlock: boolean }
  ) => ({
    headerLinkBtn: css`
      justify-content: flex-start;
      padding: 0 ${token.paddingXS}px;
      flex-shrink: 0;
      height: 46px;
      gap: 0;

      ${mq.sm} {
        gap: ${token.paddingXS}px;
      }
    `,
    textWrapper: css`
      display: ${mobileBlock ? "none" : "flex"};
      flex-direction: column;
      align-items: flex-start;
      margin-left: ${token.marginXS}px;

      ${mq.sm} {
        display: flex;
        flex-direction: column;
        margin-left: 0;
      }
    `,
    topText: css`
      font-size: ${token.fontSizeSM}px;
      line-height: ${token.lineHeight}px;
      color: currentColor;
      opacity: 0.8;
      margin-bottom: ${token.margin}px;
    `,
    bottomText: css`
      font-weight: ${token.fontWeightStrong};
      font-size: ${token.fontSize}px;
      line-height: ${token.lineHeight}px;
      color: currentColor;
    `,
  })
);
