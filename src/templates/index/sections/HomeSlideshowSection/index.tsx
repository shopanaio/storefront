'use client';

import type { SectionProps } from '@shopana/storefront-sdk/core/types';
import { useHomeCategory } from '@shopana/storefront-sdk/modules/home/react/hooks/useHomeCategories';
import { useCategoryProducts } from '@shopana/storefront-sdk/modules/home/react/hooks/useCategoryProducts';
import type { HomeProduct } from '@shopana/storefront-sdk/modules/home/core/types';
import { Flex } from 'antd';
import { useRef } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { useRoutes } from '@src/hooks/useRoutes';
import { SectionTitle, SliderNavButtons, ViewAllButton, SwiperContainer, UniversalSlider } from '../../../shared/atoms';
import { HomeSlideshowProductCard } from './ProductCard';

type CategoryKey = 'electronics' | 'sport' | 'toys';

interface HomeSlideshowSectionSettings {
  categoryKey: CategoryKey;
  pagination?: boolean;
}

export default function HomeSlideshowSection({
  settings,
}: SectionProps<HomeSlideshowSectionSettings>) {
  const routes = useRoutes();
  const swiperRef = useRef<SwiperType | null>(null);

  const category = useHomeCategory(settings.categoryKey);
  const products = useCategoryProducts(settings.categoryKey);

  if (!category || products.length === 0) {
    return null;
  }

  return (
    <Flex vertical gap={16}>
      <SectionTitle title={category.title}>
        <Flex gap={16}>
          <SliderNavButtons
            swiperRef={swiperRef}
            itemsLength={products.length}
          />
          <ViewAllButton href={routes.collection.path(category.handle)} />
        </Flex>
      </SectionTitle>
      <SwiperContainer itemsLength={products.length}>
        <UniversalSlider
          paginationProp={settings.pagination ?? true}
          items={products}
          swiperRef={swiperRef}
          renderItem={(product: HomeProduct) => (
            <HomeSlideshowProductCard product={product} />
          )}
        />
      </SwiperContainer>
    </Flex>
  );
}
