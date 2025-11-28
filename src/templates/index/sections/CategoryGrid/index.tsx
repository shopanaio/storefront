"use client";

import { Flex } from "antd";
import type { SectionProps } from "@shopana/storefront-sdk/core/types";
import { useRoutes } from "@src/hooks/useRoutes";
import { useMemo } from "react";
import { createStyles } from "antd-style";
import { mq } from "@src/ui-kit/Theme/breakpoints";
import { SectionTitle, ViewAllButton } from "@src/templates/shared/atoms";
import CategoryCardCircle from "@src/templates/index/blocks/CategoryCardCircle";
import CategoryCard from "@src/templates/index/blocks/CategoryCard";
import { useCategory } from "@src/hooks/useCategory";

interface CategoryGridSectionSettings {
  categoryHandle: string;
  title?: string;
  renderItem?: "CategoryCardCircle" | "CategoryCard";
  repeatCount?: number;
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

  const items = useMemo(() => {
    if (settings.repeatCount && category) {
      return Array.from({ length: settings.repeatCount }, (_, i) => ({
        ...category,
        id: `${category.id}-${i}`,
      })) as typeof children;
    }
    return children;
  }, [settings.repeatCount, category, children]);

  const title = settings.title ?? category?.title ?? "";
  const renderItem = settings.renderItem ?? "CategoryCard";

  return (
    <Flex vertical gap={16} style={{ marginBottom: 64 }}>
      <SectionTitle title={title}>
        <ViewAllButton href={routes.collection.path(category?.handle ?? '')} />
      </SectionTitle>

      <Flex className={styles.container} justify="space-between">
        {items.map((item: any) =>
          renderItem === "CategoryCardCircle" ? (
            <CategoryCardCircle key={item.id} category={item} />
          ) : (
            <CategoryCard
              key={item.id}
              category={item}
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
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;

      width: 100%;
      padding: 0 ${token.padding}px;

      @media (min-width: 520px) {
        grid-template-columns: repeat(3, 1fr);
      }

      ${mq.md} {
        grid-template-columns: repeat(4, 1fr);
      }

      ${mq.lg} {
        grid-template-columns: repeat(6, 1fr);
      }

      ${mq.xl} {
        grid-template-columns: repeat(8, 1fr);
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
