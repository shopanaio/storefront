"use client";

import { ActivityComponentType } from "@stackflow/react";
import { Flex } from "antd";
import { createStyles } from "antd-style";
import { useTranslations } from "next-intl";
import { StepHeader } from "@src/modules/box-builder/components/StepHeader";

import CategorySection from "@src/modules/box-builder/components/CategorySwiper/CategorySection";
import React from "react";

import Progress from "@src/modules/box-builder/components/Progress";
import Layout from "@src/modules/box-builder/components/Layout";
import { useBoxBuilderProgress } from "@src/modules/box-builder/hooks/useCartProgress";
import { useBoxBuilderCategories } from "@src/modules/box-builder/hooks/useBoxBuilderCategories";
import { Suspense } from "react";
import { BoxBuilderSwiperSectionSkeleton } from "@src/modules/box-builder/skeletons/SwiperSectionSkeleton";
import ProductsOnlyFooterButton from "@src/modules/box-builder/components/ProductsOnlyFooterButton";

const CategoriesSections: React.FC = () => {
  const { categories } = useBoxBuilderCategories();

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <>
      {categories.map((category, idx) => {
        if (!category) return null;
        return (
          <CategorySection
            key={category.handle ?? idx}
            handle={category.handle}
          />
        );
      })}
    </>
  );
};

const Step2: ActivityComponentType = () => {
  const { styles, theme } = useStyles();
  const t = useTranslations("BoxBuilder");

  const { progress } = useBoxBuilderProgress();

  const footerContent = <ProductsOnlyFooterButton />;

  return (
    <Layout footer={footerContent}>
      <Flex vertical gap={32} className={styles.container}>
        <StepHeader
          stepNumber={2}
          title={t("step2.title")}
          description={t("step2.description")}
        />
        <Progress percent={progress} description={true} />
      </Flex>
      <Flex vertical gap={theme.marginLG}>
        <Suspense fallback={<BoxBuilderSwiperSectionSkeleton />}>
          <CategoriesSections />
        </Suspense>
      </Flex>
    </Layout>
  );
};

export default Step2;

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      padding: 0 ${token.padding}px;
      margin-bottom: ${token.marginLG}px;
    `,
  };
});
