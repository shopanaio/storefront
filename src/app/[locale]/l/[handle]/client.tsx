"use client";

import React from "react";
import { PageLayout } from "@src/components/Layout/PageLayout";
import useCategoryClientQuery from "@src/hooks/category/useCategoryClientQuery";
import { ListingPageContent } from "@src/components/Listing/ListingPageContent";
import { useParams } from "next/navigation";

export const ListingPageClient = () => {
  const { handle } = useParams();

  const categoryData = useCategoryClientQuery(handle as string);

  if (!categoryData) {
    return <div>Loading...</div>;
  }

  return (
    <PageLayout>
      <div>
        <ListingPageContent category={categoryData} />
      </div>
    </PageLayout>
  );
};
