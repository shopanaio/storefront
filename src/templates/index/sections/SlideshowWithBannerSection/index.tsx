/* eslint-disable @atlaskit/design-system/ensure-design-token-usage */
"use client";

import { Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import type { SectionProps } from "@shopana/storefront-sdk/core/types";
import { useHomeCategory } from "@shopana/storefront-sdk/modules/home/react/hooks/useHomeCategories";
import { useCategoryProducts } from "@shopana/storefront-sdk/modules/home/react/hooks/useCategoryProducts";
import type { HomeProduct } from "@shopana/storefront-sdk/modules/home/core/types";
import Banner from "./Banner";
import { mq } from "@src/ui-kit/Theme/breakpoints";
import { useRef } from "react";
import type { Swiper as SwiperType } from "swiper";
import { UniversalSlider, ViewAllButton, SliderNavButtons } from "../../../shared/atoms";
import { useRoutes } from "@src/hooks/useRoutes";
import { HomeSlideshowProductCard } from "../HomeSlideshowSection/ProductCard";

type CategoryKey = "electronics" | "sport" | "toys";

interface SlideshowWithBannerSectionSettings {
  categoryKey: CategoryKey;
  title?: string;
  bannerPlacement?: "before" | "after";
}

export default function SlideshowWithBannerSection({
  settings,
}: SectionProps<SlideshowWithBannerSectionSettings>) {
  const routes = useRoutes();
  const { styles } = useStyles();

  const category = useHomeCategory(settings.categoryKey);
  const allProducts = useCategoryProducts(settings.categoryKey);

  const bannerProduct = allProducts[0];
  const products = allProducts;

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
              renderItem={(product: HomeProduct) => (
                <HomeSlideshowProductCard product={product} />
              )}
              swiperRef={swiperRef}
              breakpoints={{
                0: { slidesPerView: 2, spaceBetween: 12 },
                520: { slidesPerView: 4, spaceBetween: 12 },
                768: { slidesPerView: 4, spaceBetween: 16 },
                1280: { slidesPerView: 6, spaceBetween: 16 },
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
      gap: ${token.margin}px;

      ${mq.md} {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: ${token.margin}px;
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

    swiperDynamic: css`
      position: relative;

      ${mq.lg} {
        padding-left: ${token.padding}px;
      }

      .swiper-pagination {
        position: absolute;
        top: 50%;
        left: -66px !important;
        transform: translateY(-50%) rotate(90deg) !important;
        z-index: 2;
        height: 6px;
        min-width: 140px;
        max-width: 140px;
      }

      .swiper-pagination-bullet {
        height: 6px !important;
        width: 6px !important;
      }

      .swiper-pagination-bullet-active {
        height: 6px;
        width: 24px !important;
        border-radius: 3px;
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

      ${mq.md} {
        grid-column: span 4;
      }

      ${mq.lg} {
        grid-column: span 4;
      }

      ${mq.xl} {
        grid-column: span 6;
      }

      ${mq.xxl} {
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
