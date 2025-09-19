"use client";

import React from "react";
import { PageLayout } from "@src/components/Layout/PageLayout";
import useCategoryClientQuery from "@src/hooks/category/useCategoryClientQuery";
import { ListingPageContent } from "@src/components/Listing/ListingPageContent";

export const ListingPageClient = () => {
  const handle = window.location.pathname.split("/").pop() || "";

  const categoryData = useCategoryClientQuery(handle, 12);

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
