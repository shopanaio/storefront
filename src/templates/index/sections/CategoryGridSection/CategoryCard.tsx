"use client";

import { Card, Typography } from "antd";
import { createStyles } from "antd-style";
import { mq } from "@src/ui-kit/Theme/breakpoints";
import type { model } from "@shopana/storefront-sdk";
import Link from "next/link";
import { useRoutes } from "@src/hooks/useRoutes";

const { Text } = Typography;

interface Prop {
  category: model.Category;
}

export default function CategoryCard({ category }: Prop) {
  const { styles } = useStyles();
  const routes = useRoutes();

  return (
    <Link href={routes.collection.path(category.handle)}>
      <Card
        className={styles.categoryCard}
        bodyStyle={{ padding: 0 }}
        cover={
          <div className={styles.categoryImageWrapper}>
            <img
              className={styles.categoryImg}
              src={category.cover?.url}
              alt={category.title}
              loading="lazy"
            />
          </div>
        }
      >
        <div className={styles.categoryLabel}>
          <Text>{category.title}</Text>
        </div>
      </Card>
    </Link>
  );
}

const useStyles = createStyles(({ css, token }) => {
  return {
    categoryCard: css`
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: ${token.margin}px;
      padding: ${token.padding}px;
      min-height: 260px;

      border-radius: 0;

      ${mq.lg} {
        border-radius: ${token.borderRadiusLG}px;
      }
    `,

    categoryImageWrapper: css`
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 160px;
    `,

    categoryImg: css`
      width: 100%;
      height: 100%;
      object-fit: contain;
    `,

    categoryLabel: css`
      display: flex;

      justify-content: center;
      align-items: center;
      height: 40px;
      width: 100%;
      border: 1px solid ${token.colorBorder};
      border-radius: ${token.borderRadiusLG}px;
    `,
  };
});
