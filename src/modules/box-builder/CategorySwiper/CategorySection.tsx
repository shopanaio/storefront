"use client";

import React from "react";
import { Suspense } from "react";
import { useLazyLoadQuery } from "react-relay";
import { CategoryQuery } from "@src/relay/queries/CategoryQuery.shopana";
import { CategoryQuery as CategoryQueryType } from "@src/relay/queries/__generated__/CategoryQuery.graphql";
import SwiperSection from "./SwiperSection";
import { BoxBuilderSwiperSectionSkeleton } from "../skeletons/SwiperSectionSkeleton";

interface CategorySectionProps {
  handle: string;
}

function CategorySectionInner({ handle }: CategorySectionProps) {
  const data = useLazyLoadQuery<CategoryQueryType>(
    CategoryQuery,
    { handle },
    { fetchPolicy: "store-or-network" }
  );

  const category = data?.category ?? null;
  if (!category) return null;

  return <SwiperSection category={category} />;
}

export default function CategorySection(props: CategorySectionProps) {
  return (
    <Suspense fallback={<BoxBuilderSwiperSectionSkeleton />}>
      <CategorySectionInner {...props} />
    </Suspense>
  );
}
