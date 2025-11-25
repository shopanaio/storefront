"use client";

import { Card, Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import type { model } from "@shopana/storefront-sdk";
import { useLocale } from "next-intl";
import Link from "next/link";

const { Text } = Typography;

interface Props {
  category: model.Category;
}

export default function CategoryCardCircle({ category }: Props) {
  const { styles } = useStyles();
  const locale = useLocale();
  return (
    <Link href={`${locale}/l/${category.handle}`}>
      <Card
        bodyStyle={{ padding: 0 }}
        key={category.id}
        className={styles.categoryCard}
        bordered={false}
      >
        <Flex vertical gap={12} align="center">
          <div className={styles.categoryImageWrapper}>
            <img
              className={styles.categoryImg}
              src={category.cover?.url}
              alt={category.title}
              loading="lazy"
            />
          </div>
          <Text strong>{category.title}</Text>
        </Flex>
      </Card>
    </Link>
  );
}

const useStyles = createStyles(({ css, token }) => {
  return {
    categoryCard: css`
      box-shadow: none !important;
    `,

    categoryImageWrapper: css`
      display: flex;
      align-items: center;
      justify-content: center;

      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: linear-gradient(
        135deg,
        ${token.colorBgBase} 10%,
        ${token.colorPrimary} 100%
      );
      overflow: hidden;
    `,

    categoryImg: css`
      height: 75%;
      object-fit: cover;
    `,
  };
});
