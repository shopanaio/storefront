"use client";

import { Button, Flex, Typography } from "antd";
import { Badge } from "@src/components/UI/Badge";
import { createStyles } from "antd-style";
import { TbArrowLeft } from "react-icons/tb";
import { useTranslations, useLocale } from "next-intl";

interface Props {
  title: string;
  productsCount: number;
}

export const CartPageTitleAndBtn = ({ title, productsCount }: Props) => {
  const { styles } = useStyles();
  const t = useTranslations("Cart");
  const locale = useLocale();

  return (
    <Flex className={styles.titleSection}>
      <Flex>
        <Typography.Text className={styles.pageTitle}>{title}</Typography.Text>
        <Badge count={productsCount} variant="primary" offset={[5, 5]} />
      </Flex>

      <Flex align="end">
        <Button href={`/${locale}`} icon={<TbArrowLeft />}>
          {t("continue-shopping")}
        </Button>
      </Flex>
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  titleSection: css`
    justify-content: space-between;
    margin-top: ${token.margin}px;
  `,
  pageTitle: css`
    font-size: ${token.fontSizeHeading3}px;
  `,
}));
