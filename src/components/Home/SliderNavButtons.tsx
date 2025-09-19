import { Button, Flex } from "antd";
import { TbArrowLeft, TbArrowRight } from "react-icons/tb";
import type { Swiper as SwiperType } from "swiper";
import { useBreakpoints } from "@src/hooks/useBreakpoints";
import { useEffect, useState } from "react";
import { createStyles, cx } from "antd-style";
import { mq } from "@src/components/Theme/breakpoints";

interface SliderNavButtonsProps {
  swiperRef: React.MutableRefObject<SwiperType | null>;
  itemsLength: number;
  breakpoints?: { [width: number]: number };
  className?: string;
}

const defaultBreakpoints = {
  0: 1,
  375: 2,
  768: 4,
  1024: 5,
  1440: 6,
};

function getSlidesPerView(
  breakpoints: { [width: number]: number },
  activeBreakpoints: ReturnType<typeof useBreakpoints>,
  fallback = 1
): number {
  const { isXxl, isXl, isLg, isMd, isSm } = activeBreakpoints;

  if (isXxl) return breakpoints[1440];
  if (isXl) return breakpoints[1024];
  if (isLg) return breakpoints[768];
  if (isMd) return breakpoints[375];
  if (isSm) return breakpoints[0];

  return fallback;
}

export function SliderNavButtons({
  swiperRef,
  itemsLength,
  breakpoints = defaultBreakpoints,
  className,
}: SliderNavButtonsProps) {
  const activeBreakpoints = useBreakpoints();
  const { styles } = useStyles();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;

    const handle = () => setActiveIndex(swiper.activeIndex);
    swiper.on("slideChange", handle);
    setActiveIndex(swiper.activeIndex);

    return () => {
      swiper.off("slideChange", handle);
    };
  }, [swiperRef]);

  const slidesPerView = getSlidesPerView(breakpoints, activeBreakpoints, 1);
  const pageCount = Math.ceil(itemsLength / slidesPerView);

  if (pageCount <= 1) return null;

  const isFirst = activeIndex === 0;
  const isLast = activeIndex >= itemsLength - slidesPerView;

  return (
    <Flex gap={10} className={cx(className, styles.navButtons)}>
      <Button
        size="large"
        icon={<TbArrowLeft />}
        onClick={() => swiperRef.current?.slidePrev()}
        disabled={isFirst}
      />
      <Button
        size="large"
        icon={<TbArrowRight />}
        onClick={() => swiperRef.current?.slideNext()}
        disabled={isLast}
      />
    </Flex>
  );
}

const useStyles = createStyles(({ css }) => ({
  navButtons: css`
    display: none;

    ${mq.lg} {
      display: flex;
    }
  `,
}));

export default SliderNavButtons;
