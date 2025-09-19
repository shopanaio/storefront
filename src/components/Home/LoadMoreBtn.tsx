"use client";

import { Button } from "antd";
import React from "react";
import { useTranslations } from "next-intl";

interface Props {
  hasNext: boolean;
  handleLoadMore: () => void;
  isLoadingNext: boolean;
}

export const LoadMoreBtn = ({
  hasNext,
  handleLoadMore,
  isLoadingNext,
}: Props) => {
  const t = useTranslations("Product");

  return (
    hasNext && (
      <Button
        style={{
          width: "fit-content",
        }}
        size="large"
        onClick={handleLoadMore}
        loading={isLoadingNext}
        type="primary"
      >
        {t("load-more")}
      </Button>
    )
  );
};
