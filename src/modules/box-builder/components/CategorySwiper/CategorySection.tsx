"use client";

import React, { useEffect, useRef, useState } from "react";
import { Suspense } from "react";
import { useLazyLoadQuery } from "react-relay";
import { CategoryQuery } from "@src/relay/queries/CategoryQuery.shopana";
import { CategoryQuery as CategoryQueryType } from "@src/relay/queries/__generated__/CategoryQuery.graphql";
import SwiperSection from "./SwiperSection";
import { BoxBuilderSwiperSectionSkeleton } from "@src/modules/box-builder/skeletons/SwiperSectionSkeleton";

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
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Отключаем наблюдение после первого появления
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px", // Начинаем загрузку немного раньше
        threshold: 0,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref}>
      {isVisible ? (
        <Suspense fallback={<BoxBuilderSwiperSectionSkeleton />}>
          <CategorySectionInner {...props} />
        </Suspense>
      ) : (
        <BoxBuilderSwiperSectionSkeleton />
      )}
    </div>
  );
}
