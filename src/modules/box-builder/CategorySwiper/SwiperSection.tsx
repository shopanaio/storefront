"use client";

import { Flex } from "antd";
import { createStyles } from "antd-style";
import { ProductCardRelay } from "@src/modules/box-builder/ProductCardRelay";
import BoxBuilderSwiperHeader from "./SwiperHeader";
import { UniversalSlider } from "@src/components/Home/ProductSlideshow/UniversalSwiper";
import { usePaginationFragment } from "react-relay";
import { Listing } from "@src/relay/queries/Listing.shopana";
import { Listing$key } from "@src/relay/queries/__generated__/Listing.graphql";
import { SwiperOptions } from "swiper/types";

const swiperBreakpoints: NonNullable<SwiperOptions["breakpoints"]> = {
  0: { slidesPerView: 1.5 },
  375: { slidesPerView: 2.5 },
  576: { slidesPerView: 3.5 },
  768: { slidesPerView: 4.5 },
  1024: { slidesPerView: 5.5 },
  1440: { slidesPerView: 6.5 },
};

interface Props {
  category: Listing$key;
}

export default function BoxBuilderSwiperSection({ category }: Props) {
  const { styles } = useStyles();

  const { data } = usePaginationFragment(Listing, category);

  const products = data?.listing?.edges?.map((edge) => edge.node) ?? [];

  return (
    <Flex vertical gap={12}>
      <BoxBuilderSwiperHeader title={data?.title} handle={data?.handle} />
      <div className={styles.swiperContainer}>
        <UniversalSlider
          items={products}
          slidesPerView={3}
          spaceBetween={10}
          freeMode={{
            enabled: true,
            sticky: false,
            momentum: true,
            momentumRatio: 0.85,
            momentumVelocityRatio: 0.85,
            momentumBounce: false,
            minimumVelocity: 0.1,
          }}
          breakpoints={swiperBreakpoints}
          paginationProp={false}
          renderItem={(product) => (
            <ProductCardRelay product={product} allowCount={true} />
          )}
        />
      </div>
    </Flex>
  );
}

const useStyles = createStyles(({ token, css }) => {
  return {
    swiperContainer: css`
      width: 100%;
      overflow: hidden;
      padding: 1px ${token.padding}px;
    `,
  };
});
