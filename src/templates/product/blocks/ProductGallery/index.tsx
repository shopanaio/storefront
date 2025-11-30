/* eslint-disable @next/next/no-img-element */
'use client';

import { Button, Flex } from 'antd';
import { createStyles, cx } from 'antd-style';
import { mq } from '@src/ui-kit/Theme/breakpoints';
import { A11y, Pagination, Thumbs } from 'swiper/modules';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useSwiperSync } from '@src/hooks/useSwiperSync';
import 'swiper/css';
import 'swiper/css/virtual';
import 'swiper/css/pagination';
import 'swiper/css/a11y';
import 'swiper/css/thumbs';
import {
  TbChevronDown,
  TbChevronLeft,
  TbChevronRight,
  TbChevronUp,
} from 'react-icons/tb';
import { Thumbnail } from '@src/ui-kit/Thumbnail/Thumbnail';
import type { model } from '@shopana/storefront-sdk';
import { useMemo } from 'react';
import { IsomorphicSwiper } from '@src/ui-kit/IsomorphicSwiper';
import type { SwiperOptions } from 'swiper/types';
import Image from '@src/ui-kit/Image';

interface Prop {
  gallery: model.Media[];
  /** Method for switching slides by thumbnails: click or hover */
  thumbnailTrigger?: 'click' | 'hover';
  breakpoints?: Record<number, SwiperOptions>;
}

export const ProductGallery = ({
  gallery,
  thumbnailTrigger = 'click',
  breakpoints,
}: Prop) => {
  const { styles } = useStyles();

  const {
    mainSwiper,
    thumbsSwiper,
    activeIndex,
    canGoPrev,
    canGoNext,
    handleThumbnailClick,
    handleThumbnailHover,
    handleThumbnailNavigation,
    handleMainSlideChange,
    handleMainSwiperInit,
    handleThumbsSwiperInit,
  } = useSwiperSync({ totalSlides: gallery.length });

  const thumbnailDirection = useMemo(() => {
    if (thumbsSwiper && !thumbsSwiper.destroyed) {
      return thumbsSwiper?.params?.direction;
    }
    return 'horizontal';
  }, [thumbsSwiper]);

  return (
    <Flex className={cx(styles.container, 'product-gallery-container')}>
      <div className={cx(styles.swiperContainer, 'main-swiper-container')}>
        <IsomorphicSwiper>
          {({ Swiper, SwiperSlide }) => (
            <Swiper
              modules={[A11y, Thumbs, Pagination]}
              spaceBetween={0}
              slidesPerView={1}
              breakpoints={{
                1024: {
                  pagination: false,
                },
              }}
              pagination={{
                el: '.swiper-pagination',
                type: 'fraction',
              }}
              thumbs={thumbsSwiper ? { swiper: thumbsSwiper } : undefined}
              loop
              onSwiper={handleMainSwiperInit}
              onSlideChange={handleMainSlideChange}
            >
              {gallery.map((it, idx) => (
                <SwiperSlide key={idx} className={styles.swiperSlide}>
                  <Image
                    src={it.url || ''}
                    className={styles.swiperImage}
                    alt=""
                    ratio={'var(--gallery-aspect-ratio)'}
                    width={800}
                  />
                </SwiperSlide>
              ))}
              <Button
                className={cx(
                  styles.prevNextBtn,
                  styles.mainSwiperBtn,
                  styles.mainPrevBtn
                )}
                onClick={() => mainSwiper?.slidePrev()}
                icon={<LeftOutlined />}
                size="large"
              />
              <Button
                className={cx(
                  styles.prevNextBtn,
                  styles.mainSwiperBtn,
                  styles.mainNextBtn
                )}
                onClick={() => mainSwiper?.slideNext()}
                icon={<RightOutlined />}
                size="large"
              />
            </Swiper>
          )}
        </IsomorphicSwiper>
        <div className={cx('swiper-pagination', styles.swiperPagination)} />
      </div>
      <div className="thumbnails-container">
        <IsomorphicSwiper>
          {({ Swiper, SwiperSlide }) => (
            <Swiper
              onSwiper={handleThumbsSwiperInit}
              className={styles.thumbnailsSwiper}
              allowTouchMove={false}
              simulateTouch={false}
              spaceBetween={8}
              breakpoints={breakpoints}
              observer={true}
              observeParents={true}
              resizeObserver={true}
            >
              {gallery.map((it, idx) => (
                <SwiperSlide key={idx}>
                  <Thumbnail
                    alt=""
                    className={styles.thumbnailImageContainer}
                    src={it.url || ''}
                    selected={activeIndex === idx}
                    width={100}
                    {...(thumbnailTrigger === 'hover'
                      ? { onMouseOver: () => handleThumbnailHover(idx) }
                      : { onClick: () => handleThumbnailClick(idx) })}
                  />
                </SwiperSlide>
              ))}
              <Button
                size="large"
                variant="outlined"
                color="default"
                className={cx(
                  styles.prevNextBtn,
                  styles.thumbnailSwiperBtn,
                  thumbnailDirection === 'horizontal'
                    ? styles.galleryHorizontalPrevBtn
                    : styles.navigationPrevButton
                )}
                onClick={() => handleThumbnailNavigation('prev')}
                disabled={!canGoPrev}
                icon={
                  thumbnailDirection === 'horizontal' ? (
                    <TbChevronLeft />
                  ) : (
                    <TbChevronUp />
                  )
                }
              />
              <Button
                className={cx(
                  styles.prevNextBtn,
                  styles.thumbnailSwiperBtn,
                  thumbnailDirection === 'horizontal'
                    ? styles.galleryHorizontalNextBtn
                    : styles.navigationNextButton
                )}
                size="large"
                variant="outlined"
                color="default"
                onClick={() => handleThumbnailNavigation('next')}
                disabled={!canGoNext}
                icon={
                  thumbnailDirection === 'horizontal' ? (
                    <TbChevronRight />
                  ) : (
                    <TbChevronDown />
                  )
                }
              />
            </Swiper>
          )}
        </IsomorphicSwiper>
      </div>
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    position: relative;
    flex-direction: column;
    /* Uses --thumb-gap variable from parent component */
    gap: calc(var(--thumb-gap) - 2px);
    position: sticky;
    top: calc(var(--sticky-header-height) + ${token.padding}px);
    overflow: hidden;

    ${mq.lg} {
      /* Overall dimensions of the entire gallery container */
      width: var(--gallery-container-width);
      height: var(--gallery-container-height);
      max-width: var(--gallery-container-width);
      max-height: var(--gallery-container-height);
    }

    ${mq.xl} {
      /* Flex direction from parent variables */
      flex-direction: var(--gallery-flex-direction);
    }
  `,
  swiperContainer: css`
    /* Mobile: full width with automatic height */
    width: 100%;
    border-radius: ${token.borderRadius}px;
    overflow: hidden;

    ${mq.lg} {
      /* Desktop: use variables from parent */
      width: var(--gallery-width);
      height: var(--gallery-height);
      max-height: var(--gallery-size);
      max-width: var(--gallery-size);
    }

    ${mq.xl} {
      /* Uses --gallery-size variable from parent component */
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
  swiperPagination: css`
    color: ${token.colorWhite};
    background-color: rgba(0, 0, 0, 0.5);
    width: max-content;
    border-radius: ${token.borderRadiusLG}px;
    padding: 2px ${token.paddingXS}px;
    left: 50%;
    transform: translateX(-50%);
    font-size: ${token.fontSizeSM}px;
  `,
  mainPrevBtn: css`
    top: 50%;
    left: ${token.padding}px;
    transform: translateY(-50%);
  `,
  mainNextBtn: css`
    top: 50%;
    right: ${token.padding}px;
    transform: translateY(-50%);
  `,
  stickyMainPrevBtn: css`
    left: ${token.paddingXL + 80}px !important;
  `,
  prevNextBtn: css`
    display: none;
    opacity: 0;
    transition: opacity 0.3s ease;

    ${mq.xl} {
      display: flex;
      position: absolute;
      padding: ${token.padding}px;
      border-radius: 50%;
      z-index: 2;
    }
  `,
  mainSwiperBtn: css`
    .product-gallery-container:hover & {
      opacity: 1;
    }
  `,
  thumbnailSwiperBtn: css`
    .thumbnails-container:hover & {
      opacity: 1;
    }

    &:disabled {
      opacity: 0 !important;
      pointer-events: none;
    }
  `,
  galleryHorizontalNextBtn: css`
    ${mq.xl} {
      top: 50%;
      transform: translateY(-50%);
      right: ${token.paddingMD}px;
    }
    ${mq.xxl} {
      right: ${token.padding}px;
    }
  `,
  galleryHorizontalPrevBtn: css`
    ${mq.xl} {
      top: 50%;
      transform: translateY(-50%);
      left: ${token.padding}px;
    }
    ${mq.xxl} {
      left: ${token.paddingMD}px;
    }
  `,
  navigationNextButton: css`
    ${mq.lg} {
      bottom: ${token.paddingLG}px;
      left: 50%;
      transform: translateX(-50%);
    }
    ${mq.xxl} {
      bottom: ${token.paddingMD}px;
    }
  `,
  navigationPrevButton: css`
    ${mq.lg} {
      top: ${token.padding}px;
      left: 50%;
      transform: translateX(-50%);
    }
    ${mq.xxl} {
      top: ${token.paddingMD}px;
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

      /* Force slide dimensions via CSS to prevent Swiper miscalculation */
      .swiper-slide {
        width: var(--thumb-size) !important;
        height: var(--thumb-size) !important;
      }
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
  thumbnailImage: css`
    aspect-ratio: 1 / 1;
    height: 100%;
    width: 100%;
    object-fit: cover;
    border-radius: ${token.borderRadius}px;
  `,
}));
