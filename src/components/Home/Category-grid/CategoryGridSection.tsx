"use client";

import { Flex } from "antd";
import type { model } from "@shopana/storefront-sdk";
import ViewAllButton from "../ViewAllButton";
import SectionTitle from "../SectionTitle";
import { useLocale } from "next-intl";
import { useMemo } from "react";
import CategoryCardCircle from "./CategoryCardCircle";
import { createStyles } from "antd-style";
import { mq } from "@src/components/Theme/breakpoints";
import CategoryCard from "./CategoryCard";

export interface CategoryGridSectionProps {
  title: string;
  sources: model.Category[];
  pagination: boolean;
  renderItem: "CategoryCardCircle" | "CategoryCard";
}

export default function CategoryGridSection({
  title,
  sources,
  // pagination,
  renderItem,
}: CategoryGridSectionProps) {
  const locale = useLocale();
  const { styles } = useStyles();

  const children = useMemo(
    () => sources[0].children.edges.map((edge) => edge.node),
    [sources[0].children.edges]
  );

  return (
    <Flex vertical gap={16}>
      <SectionTitle title={title}>
        <ViewAllButton href={`${locale}/l/${sources[0]?.handle}`} />
      </SectionTitle>

      <Flex className={styles.container} justify="space-between">
        {children.map((category) =>
          renderItem === "CategoryCardCircle" ? (
            <CategoryCardCircle key={category.id} category={category} />
          ) : (
            <CategoryCard
              key={category.id}
              category={category}
              /* categoryRef={category} */
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
