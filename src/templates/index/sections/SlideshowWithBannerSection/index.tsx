/* eslint-disable @atlaskit/design-system/ensure-design-token-usage */
"use client";

import { Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import { ProductCard } from "@src/components/UI/ProductCards/ListingCard/ProductCard";
import type { model } from "@shopana/storefront-sdk";
import Banner from "./Banner";
import { mq } from "@src/components/Theme/breakpoints";
import { useMemo, useRef } from "react";
import type { Swiper as SwiperType } from "swiper";
import { UniversalSlider, ViewAllButton, SliderNavButtons } from "../../../shared/atoms";
import { useRoutes } from "@src/hooks/useRoutes";
import React from "react";

export interface SlideshowWithBannerSectionProps {
  title: string;
  sources: model.Category[];
  banner: {
    placement: "before" | "after";
    entry: model.Product | model.Category;
  };
  pagination: boolean;
}

export default function SlideshowWithBannerSection({
  title,
  sources,
  banner,
}: // pagination,
SlideshowWithBannerSectionProps) {
  const routes = useRoutes();
  const { styles } = useStyles();

  const products = useMemo(
    () =>
      sources
        .map((cat) =>
          cat.listing?.edges?.map((edge: { node: any }) => edge.node)
        )
        .flat(),
    [sources]
  );

  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <Flex className={styles.container} gap={16}>
      <div className={styles.grid}>
        {banner.placement === "before" && (
          <div className={styles.banner}>
            <Banner banner={banner.entry as any} />
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
                itemsLength={sources[0].listing.edges.length}
              />
              <ViewAllButton href={routes.collection.path(sources[0]?.handle)} />
            </Flex>
          </Flex>

          <div>
            <UniversalSlider
              items={products}
              renderItem={(product) => (
                <ProductCard product={product} hoverable={false} />
              )}
              swiperRef={swiperRef}
              breakpoints={{
                1024: { slidesPerView: 3, spaceBetween: 16 },
                1440: { slidesPerView: 4, spaceBetween: 16 },
              }}
            />
          </div>
        </Flex>

        {banner.placement === "after" && (
          <div className={styles.banner}>
            <Banner banner={banner.entry as any} />
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
        grid-template-columns: repeat(4, 1fr);
        gap: ${token.margin}px;
        width: 100%;
        align-items: stretch;
      }

      ${mq.lg} {
        grid-template-columns: repeat(5, 1fr);
      }

      ${mq.xl} {
        grid-template-columns: repeat(5, 1fr);
      }

      ${mq.xxl} {
        grid-template-columns: repeat(6, 1fr);
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
      //aspect-ratio: 1/1;
      border-radius: ${token.borderRadiusLG}px;
      overflow: hidden;

      grid-column: span 4;

      ${mq.lg} {
        grid-column: span 2;
        //aspect-ratio: 16/9;
      }
    `,

    sideContainer: css`
      ${mq.md} {
        overflow: hidden;
        grid-column: span 4;
      }

      ${mq.lg} {
        grid-column: span 3;
      }

      ${mq.xl} {
        grid-column: span 3;
      }

      ${mq.xxl} {
        grid-column: span 4;
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
