"use client";

import { Flex } from "antd";
import type { SectionProps } from "@shopana/storefront-sdk/core/types";
import { useRoutes } from "@src/hooks/useRoutes";
import { useMemo } from "react";
import { createStyles } from "antd-style";
import { mq } from "@src/ui-kit/Theme/breakpoints";
import { SectionTitle, ViewAllButton } from "../../../shared/atoms";
import CategoryCardCircle from "./CategoryCardCircle";
import CategoryCard from "./CategoryCard";
import { useCategory } from "@src/hooks/useCategory";

interface CategoryGridSectionSettings {
  categoryHandle: string;
  title?: string;
  renderItem?: "CategoryCardCircle" | "CategoryCard";
}

export default function CategoryGridSection({
  settings,
}: SectionProps<CategoryGridSectionSettings>) {
  const routes = useRoutes();
  const { styles } = useStyles();
  const { category } = useCategory(settings.categoryHandle);

  const children = useMemo(
    () => category?.children?.edges?.map((edge) => edge.node) ?? [],
    [category?.children?.edges]
  );

  const title = settings.title ?? category?.title ?? "";
  const renderItem = settings.renderItem ?? "CategoryCard";

  return (
    <Flex vertical gap={16}>
      <SectionTitle title={title}>
        <ViewAllButton href={routes.collection.path(category?.handle ?? '')} />
      </SectionTitle>

      <Flex className={styles.container} justify="space-between">
        {children.map((child) =>
          renderItem === "CategoryCardCircle" ? (
            <CategoryCardCircle key={child.id} category={child} />
          ) : (
            <CategoryCard
              key={child.id}
              category={child}
            />
          )
        )}
      </Flex>
    </Flex>
  );
}

const useStyles = createStyles(({ css, token }) => {
  return {
    container: css`
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: ${token.margin}px;

      width: 100%;
      padding: 0 ${token.padding}px;

      ${mq.xl} {
        margin-right: auto;
        margin-left: auto;

        width: 1280px;
      }

      ${mq.xxl} {
        padding: 0;
        width: 1400px;
      }
    `,
  };
});
