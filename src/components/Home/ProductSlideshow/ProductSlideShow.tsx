"use client";

import { Flex, Segmented } from "antd";
import ViewAllButton from "@src/components/Home/ViewAllButton";
import { useLocale } from "next-intl";
import React, { useEffect, useRef, useState } from "react";
import { Swiper as SwiperType } from "swiper";
import SectionTitle from "../SectionTitle";
import SliderNavButtons from "../SliderNavButtons";
import SwiperContainer from "./SwiperContainer";
import { UniversalSlider } from "./UniversalSwiper";
import { ListingProductCardRelay } from "@src/components/Listing/ProductCard";
import useProductSlideShowFragment from "@src/components/Home/ProductSlideshow/relay";
import { ProductSlideShowRelay_category$key } from "@src/components/Home/ProductSlideshow/relay/__generated__/ProductSlideShowRelay_category.graphql";

export interface ProductSlideShowProps {
  title: string;
  sources: readonly ProductSlideShowRelay_category$key[];
  pagination: boolean;
}

export const ProductSlideShow = ({
  title,
  sources,
  pagination,
}: ProductSlideShowProps) => {
  const locale = useLocale();

  const categories = useProductSlideShowFragment(sources);

  const [selectedTitle, setSelectedTitle] = useState(
    categories[0]?.title || ""
  );
  const swiperRef = useRef<SwiperType | null>(null);
  const selectedSource =
    categories.find((cat) => cat.title === selectedTitle) || categories[0];

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(0);
    }
  }, [selectedTitle]);

  return (
    <Flex vertical gap={16}>
      <SectionTitle title={title}>
        {categories.length === 1 ? (
          <Flex gap={16}>
            <SliderNavButtons
              swiperRef={swiperRef}
              itemsLength={selectedSource?.listing?.edges?.length || 0}
            />
            <ViewAllButton href={`${locale}/l/${selectedSource?.handle}`} />
          </Flex>
        ) : (
          <Segmented
            size="large"
            options={categories.map((cat) => cat.title)}
            value={selectedTitle}
            onChange={(val) => {
              setSelectedTitle(val as string);
            }}
          />
        )}
      </SectionTitle>
      <SwiperContainer
        itemsLength={selectedSource?.listing?.edges?.length || 0}
      >
        <UniversalSlider
          paginationProp={pagination}
          items={selectedSource?.listing?.edges?.map((edge) => edge.node) || []}
          swiperRef={swiperRef}
          renderItem={(product: any) => {
            return (
              <ListingProductCardRelay
                $productRef={product}
                title={{ rows: 1, size: "default" }}
                hoverable={false}
              />
            );
          }}
        />
      </SwiperContainer>
    </Flex>
  );
};
