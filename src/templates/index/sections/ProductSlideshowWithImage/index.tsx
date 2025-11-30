/* eslint-disable @atlaskit/design-system/ensure-design-token-usage */
"use client";

import { Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import type { SectionProps } from "@shopana/storefront-sdk/core/types";
import type { HomeProduct } from "@shopana/storefront-sdk/modules/home/core/types";
import Banner from "@src/templates/index/blocks/Banner";
import { mq } from "@src/ui-kit/Theme/breakpoints";
import { useRef, useMemo } from "react";
import type { Swiper as SwiperType } from "swiper";
import { UniversalSlider, ViewAllButton, SliderNavButtons } from "@src/templates/shared/atoms";
import { useRoutes } from "@src/hooks/useRoutes";
import { useCategory } from "@src/hooks/useCategory";
import { usePaginationFragment } from "react-relay";
import Listing from "@shopana/storefront-sdk/queries/Listing";
import { ListingProductCardRelay } from "@src/templates/collection/blocks/ProductCard";

interface SlideshowWithBannerSectionSettings {
  categoryHandle: string;
  title?: string;
  bannerPlacement?: "before" | "after";
}

export default function SlideshowWithBannerSection({
  settings,
}: SectionProps<SlideshowWithBannerSectionSettings>) {
  const routes = useRoutes();
  const { styles } = useStyles();

  const { category } = useCategory(settings.categoryHandle, 12);

  const { data } = usePaginationFragment(Listing, category);

  const products = (data as any)?.listing?.edges?.map((edge: any) => edge.node) ?? [];

  const bannerProduct = useMemo((): HomeProduct | null => {
    const first = products[0];
    if (!first) return null;
    return {
      id: first.id,
      title: first.title,
      handle: first.handle,
      price: first.price,
      compareAtPrice: first.compareAtPrice,
      image: (first as any).cover,
      product: (first as any).product,
    };
  }, [products]);

  const swiperRef = useRef<SwiperType | null>(null);

  const title = settings.title ?? category?.title ?? "";
  const bannerPlacement = settings.bannerPlacement ?? "before";

  return (
    <Flex className={styles.container} gap={16}>
      <div className={styles.grid}>
        {bannerPlacement === "before" && bannerProduct && (
          <div className={styles.banner}>
            <Banner banner={bannerProduct} />
          </div>
        )}
        <Flex className={styles.sideContainer} vertical gap={16}>
          <Flex
            className={styles.sectionTitleWrapper}
            justify="space-between"
            align="center"
          >
            <Typography.Text strong className={styles.sectionTitle}>
              {title}
            </Typography.Text>
            <Flex gap={16}>
              <SliderNavButtons
                swiperRef={swiperRef}
                itemsLength={products.length}
              />
              <ViewAllButton href={routes.collection.path(category?.handle ?? '')} />
            </Flex>
          </Flex>
          <div>
            <UniversalSlider
              items={products}
              renderItem={(product: any) => (
                <ListingProductCardRelay $productRef={product} />
              )}
              swiperRef={swiperRef}
              breakpoints={{
                0: { slidesPerView: 2.3, slidesPerGroup: 2, spaceBetween: 12 },
                520: { slidesPerView: 3.3, slidesPerGroup: 3, spaceBetween: 12 },
                768: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 12 },
                1024: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 12 },
                1280: { slidesPerView: 6, slidesPerGroup: 6, spaceBetween: 12 },
              }}
            />
          </div>
        </Flex>

        {bannerPlacement === "after" && bannerProduct && (
          <div className={styles.banner}>
            <Banner banner={bannerProduct} />
          </div>
        )}
      </div>
    </Flex>
  );
}

const useStyles = createStyles(({ css, token }) => {
  return {
    container: css`
      width: 100%;
      padding-inline: ${token.padding}px;
      margin-bottom: 64px;

      ${mq.xl} {
        --container-width: 1280px;
        --offset: max(
          ${token.padding}px,
          calc((100vw - var(--container-width)) / 2)
        );

        margin-inline: auto;
        padding-inline: calc(
          var(--offset) - ((100vw - var(--container-width)) / 2)
        );
        width: var(--container-width);
      }

      ${mq.xxl} {
        padding-inline: 0;
        width: 1400px;
      }
    `,

    grid: css`
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: 12px;

      ${mq.md} {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 12px;
        width: 100%;
        align-items: stretch;
      }

      ${mq.lg} {
        grid-template-columns: repeat(6, 1fr);
      }

      ${mq.xl} {
        grid-template-columns: repeat(8, 1fr);
      }

      ${mq.xxl} {
        grid-template-columns: repeat(8, 1fr);
      }
    `,

    banner: css`
      width: 100%;
      border-radius: ${token.borderRadiusLG}px;
      overflow: hidden;

      ${mq.md} {
        grid-column: span 2;
      }
    `,

    sideContainer: css`
      overflow: hidden;
      padding-bottom: 24px;

      ${mq.md} {
        grid-column: span 3;
      }

      ${mq.lg} {
        grid-column: span 4;
      }

      ${mq.xl} {
        grid-column: span 6;
      }
    `,
    sectionTitleWrapper: css`
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: ${token.margin}px;
      flex-wrap: wrap;
    `,
    sectionTitle: css`
      font-size: 18px;

      ${mq.lg} {
        font-size: 24px;
      }
    `,
  };
});
