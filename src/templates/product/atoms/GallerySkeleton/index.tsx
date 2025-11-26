import { Flex } from "antd";
import { createStyles } from "antd-style";
import { mq } from "@src/components/Theme/breakpoints";
import { SwiperOptions } from "swiper/types";
import { Swiper, SwiperSlide } from "swiper/react";

export const GallerySkeleton = ({
  breakpoints,
}: {
  breakpoints?: Record<number, SwiperOptions>;
}) => {
  const { styles } = useStyles();

  return (
    <Flex className={styles.galleryBox} gap={10}>
      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        className={styles.bigImgWrapper}
      >
        <SwiperSlide className={styles.swiperSlide}>
          <div className={styles.swiperImage} />
        </SwiperSlide>
      </Swiper>
      <Swiper
        className={styles.thumbnailsSwiper}
        spaceBetween={10}
        breakpoints={breakpoints}
      >
        <SwiperSlide className={styles.thumbnailImageContainer}>
          <div className={styles.swiperImage} />
        </SwiperSlide>
        <SwiperSlide className={styles.thumbnailImageContainer}>
          <div className={styles.swiperImage} />
        </SwiperSlide>
        <SwiperSlide className={styles.thumbnailImageContainer}>
          <div className={styles.swiperImage} />
        </SwiperSlide>
        <SwiperSlide className={styles.thumbnailImageContainer}>
          <div className={styles.swiperImage} />
        </SwiperSlide>
        <SwiperSlide className={styles.thumbnailImageContainer}>
          <div className={styles.swiperImage} />
        </SwiperSlide>
        <SwiperSlide className={styles.thumbnailImageContainer}>
          <div className={styles.swiperImage} />
        </SwiperSlide>
        <SwiperSlide className={styles.thumbnailImageContainer}>
          <div className={styles.swiperImage} />
        </SwiperSlide>
      </Swiper>
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  galleryBox: css`
    flex-direction: column;
    width: 100%;
    border-radius: ${token.borderRadius}px;
    ${mq.xl} {
      flex-direction: row-reverse;
    }
  `,

  bigImgWrapper: css`
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    border-radius: ${token.borderRadius}px;

    ${mq.xl} {
      width: calc(100% - 80px - 16px);
      flex: 1 1 auto;
    }
  `,

  swiperSlide: css`
    border-radius: ${token.borderRadius}px;
    aspect-ratio: var(--gallery-aspect-ratio);
    height: unset;
    overflow: hidden;
  `,

  swiperImage: css`
    /* TODO: mobile size of a slide */
    width: 100%;
    object-fit: cover !important;
    aspect-ratio: var(--gallery-aspect-ratio);

    ${mq.xl} {
      height: 100%;
    }
  `,

  thumbnailsSwiper: css`
    display: none;
    padding: 1px;
    margin: 0;

    ${mq.lg} {
      display: block;
      /* Desktop: use size variables from parent */
      width: var(--thumbnails-width);
      height: var(--thumbnails-height);
      max-height: var(--gallery-size);
    }
  `,

  thumbnailImageContainer: css`
    height: 100%;
    padding: ${token.paddingXXS}px;
    border-radius: ${token.borderRadius}px;
    /* Uses --thumb-size variables from parent component */
    width: var(--thumb-size);
    height: var(--thumb-size);
    transform: scale(0.96);
  `,
}));
