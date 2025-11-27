import "swiper/css";
import "swiper/css/pagination";
import { useRef } from "react";
import type { Swiper as SwiperType } from "swiper";
import type { SwiperOptions } from "swiper/types";
import { A11y, Pagination, FreeMode } from "swiper/modules";
import { createStyles, cx } from "antd-style";
import { useIsMobile } from "@src/hooks/useIsMobile";
import { useBreakpoints } from "@src/hooks/useBreakpoints";
import { IsomorphicSwiper } from "@src/ui-kit/IsomorphicSwiper";

export type DataSource = {
  id: string;
};

export interface UniversalSliderProps<T extends DataSource> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  slidesPerView?: number;
  spaceBetween?: number;
  freeMode?: SwiperOptions["freeMode"];
  breakpoints?: SwiperOptions["breakpoints"];
  swiperRef?: React.MutableRefObject<SwiperType | null>;
  className?: string;
  slideClassName?: string;
  paginationProp?: boolean;
}

const defaultBreakpoints: NonNullable<SwiperOptions["breakpoints"]> = {
  0: {
    slidesPerView: 2.3,
    slidesPerGroup: 2,
    spaceBetween: 12,
  },
  520: {
    slidesPerView: 3.3,
    slidesPerGroup: 3,
    spaceBetween: 12,
  },
  768: {
    slidesPerView: 4.3,
    slidesPerGroup: 4,
    spaceBetween: 12,
  },
  1024: {
    slidesPerView: 5.3,
    slidesPerGroup: 5,
    spaceBetween: 12,
  },
  1280: {
    slidesPerView: 8,
    slidesPerGroup: 8,
    spaceBetween: 12,
  },
};

function getEnhancedBreakpoints(
  breakpoints: NonNullable<SwiperOptions["breakpoints"]>
): NonNullable<SwiperOptions["breakpoints"]> {
  return Object.fromEntries(
    Object.entries(breakpoints).map(([key, value]) => {
      const v = value as SwiperOptions;
      return [Number(key), { ...v }];
    })
  );
}

function getCurrentSlidesPerView(
  breakpoints: NonNullable<SwiperOptions["breakpoints"]>,
  activeBreakpoints: ReturnType<typeof useBreakpoints>,
  fallback: number = 1
): number {
  const { isXxl, isXl, isLg, isMd, isSm, isXs } = activeBreakpoints;

  if (isXxl && breakpoints[1440]?.slidesPerView)
    return breakpoints[1440].slidesPerView as number;
  if (isXl && breakpoints[1440]?.slidesPerView)
    return breakpoints[1440].slidesPerView as number;
  if (isLg && breakpoints[1024]?.slidesPerView)
    return breakpoints[1024].slidesPerView as number;
  if (isMd && breakpoints[768]?.slidesPerView)
    return breakpoints[768].slidesPerView as number;
  if (isXs && breakpoints[375]?.slidesPerView)
    return breakpoints[375].slidesPerView as number;

  return fallback;
}

function getSwiperModules(paginationEnabled: boolean) {
  const modules = [A11y];
  if (paginationEnabled) {
    modules.push(Pagination);
  }
  return modules;
}

export function UniversalSlider<T extends DataSource>({
  items,
  renderItem,
  slidesPerView,
  spaceBetween,
  freeMode,
  breakpoints,
  swiperRef,
  className,
  slideClassName,
  paginationProp = true,
}: UniversalSliderProps<T>) {
  const internalRef = useRef<SwiperType | null>(null);
  const { styles } = useStyles();
  const activeBreakpoints = useBreakpoints();
  const isMobile = useIsMobile();

  const mergedBreakpoints: NonNullable<SwiperOptions["breakpoints"]> = {
    ...defaultBreakpoints,
    ...breakpoints,
  };

  const currentSlidesPerView = getCurrentSlidesPerView(
    mergedBreakpoints,
    activeBreakpoints,
    slidesPerView || 1
  );

  const enhancedBreakpoints = getEnhancedBreakpoints(mergedBreakpoints);

  const resolvedSlidesPerView = currentSlidesPerView;

  const pageCount = Math.ceil(items.length / resolvedSlidesPerView);
  const dynamicBullets = pageCount >= 5;

  const paginationEnabled = !isMobile;
  const pagination =
    paginationProp && paginationEnabled
      ? {
          clickable: true,
          dynamicBullets,
        }
      : undefined;

  const modules = getSwiperModules(paginationProp && paginationEnabled);

  return (
    <IsomorphicSwiper>
      {({ Swiper, SwiperSlide }) => {
        return (
          <Swiper
            key={isMobile ? "mobile" : "desktop"}
            className={cx(
              className
                ? className
                : dynamicBullets
                ? styles.swiperContainerDynamic
                : styles.swiperContainer
            )}
            slidesPerView={currentSlidesPerView}
            /* slidesPerGroup={currentSlidesPerView} */
            freeMode={freeMode}
            modules={freeMode ? [...modules, FreeMode] : modules}
            spaceBetween={spaceBetween}
            pagination={pagination} /*
      centeredSlides={true}
      initialSlide={2} */
            breakpoints={enhancedBreakpoints}
            onBeforeInit={(swiper) => {
              if (swiperRef) {
                swiperRef.current = swiper;
              } else {
                internalRef.current = swiper;
              }
            }}
            style={{ overflow: "hidden" }}
          >
            {items.map((item) => (
              <SwiperSlide key={item.id} className={slideClassName}>
                {renderItem(item)}
              </SwiperSlide>
            ))}
          </Swiper>
        );
      }}
    </IsomorphicSwiper>
  );
}

const useStyles = createStyles(({ css }) => ({
  swiperContainer: css`
    position: relative;

    .swiper-pagination {
      position: absolute;
      top: 50%;
      left: calc(-50% - 2px) !important;
      transform: translateY(-50%) rotate(90deg) !important;
      z-index: 2;
      height: 6px;
    }

    .swiper-pagination-bullet {
      height: 6px !important;
      width: 6px !important;
    }

    .swiper-pagination-bullet-active {
      height: 6px !important;
      width: 24px !important;
      border-radius: 3px;
    }
  `,

  swiperContainerDynamic: css`
    position: relative;

    .swiper-pagination {
      position: absolute;
      top: 50%;
      left: -85px !important;
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
}));
