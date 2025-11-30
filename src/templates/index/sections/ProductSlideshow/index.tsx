'use client';

import type { SectionProps } from '@shopana/storefront-sdk/core/types';
import { Flex } from 'antd';
import { useRef } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { useRoutes } from '@src/hooks/useRoutes';
import { useCategory } from '@src/hooks/useCategory';
import { usePaginationFragment } from 'react-relay';
import Listing from '@shopana/storefront-sdk/queries/Listing';
import { SectionTitle, SliderNavButtons, ViewAllButton, SwiperContainer, UniversalSlider } from '@src/templates/shared/atoms';
import { ListingProductCardRelay } from '@src/templates/collection/blocks/ProductCard';

interface HomeSlideshowSectionSettings {
  categoryHandle: string;
  pagination?: boolean;
}

export default function HomeSlideshowSection({
  settings,
}: SectionProps<HomeSlideshowSectionSettings>) {
  const routes = useRoutes();
  const swiperRef = useRef<SwiperType | null>(null);

  const { category } = useCategory(settings.categoryHandle, 12);

  const { data } = usePaginationFragment(Listing, category);

  const products = data?.listing?.edges?.map((edge) => edge.node) ?? [];

  return (
    <Flex vertical gap={16} style={{ marginBottom: 64 }}>
      <SectionTitle title={category?.title ?? ''}>
        <Flex gap={16}>
          <SliderNavButtons
            swiperRef={swiperRef}
            itemsLength={products.length}
          />
          <ViewAllButton href={routes.collection.path(category?.handle ?? '')} />
        </Flex>
      </SectionTitle>
      <SwiperContainer itemsLength={products.length}>
        <UniversalSlider
          paginationProp={settings.pagination ?? true}
          items={products}
          swiperRef={swiperRef}
          renderItem={(product: any) => (
            <ListingProductCardRelay $productRef={product} />
          )}
        />
      </SwiperContainer>
    </Flex>
  );
}
