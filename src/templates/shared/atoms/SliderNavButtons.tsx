import { Button, Flex } from 'antd';
import { TbArrowLeft, TbArrowRight } from 'react-icons/tb';
import type { Swiper as SwiperType } from 'swiper';
import { useBreakpoints } from '@src/hooks/useBreakpoints';
import { useEffect, useState } from 'react';
import { createStyles, cx } from 'antd-style';
import { mq } from '@src/ui-kit/Theme/breakpoints';

interface SliderNavButtonsProps {
  swiperRef: React.MutableRefObject<SwiperType | null>;
  itemsLength: number;
  breakpoints?: { [width: number]: number };
  className?: string;
}

const defaultBreakpoints = {
  0: 2,
  520: 3,
  768: 4,
  1024: 5,
  1280: 8,
};

function getSlidesPerView(
  breakpoints: { [width: number]: number },
  activeBreakpoints: ReturnType<typeof useBreakpoints>,
  fallback = 1
): number {
  const { isXxl, isXl, isLg, isMd, isSm } = activeBreakpoints;

  if (isXxl) return breakpoints[1280] ?? fallback;
  if (isXl) return breakpoints[1280] ?? fallback;
  if (isLg) return breakpoints[1024] ?? fallback;
  if (isMd) return breakpoints[768] ?? fallback;
  if (isSm) return breakpoints[520] ?? fallback;

  return breakpoints[0] ?? fallback;
}

export function SliderNavButtons({
  swiperRef,
  itemsLength,
  breakpoints = defaultBreakpoints,
  className,
}: SliderNavButtonsProps) {
  const activeBreakpoints = useBreakpoints();
  const { styles } = useStyles();
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;

    const updateState = () => {
      setIsBeginning(swiper.isBeginning);
      setIsEnd(swiper.isEnd);
    };

    swiper.on('slideChange', updateState);
    swiper.on('reachBeginning', updateState);
    swiper.on('reachEnd', updateState);
    swiper.on('fromEdge', updateState);
    updateState();

    return () => {
      swiper.off('slideChange', updateState);
      swiper.off('reachBeginning', updateState);
      swiper.off('reachEnd', updateState);
      swiper.off('fromEdge', updateState);
    };
  }, [swiperRef]);

  const slidesPerView = getSlidesPerView(breakpoints, activeBreakpoints, 1);
  const pageCount = Math.ceil(itemsLength / slidesPerView);

  if (pageCount <= 1) return null;

  return (
    <Flex gap={10} className={cx(className, styles.navButtons)}>
      <Button
        icon={<TbArrowLeft />}
        onClick={() => swiperRef.current?.slidePrev()}
        disabled={isBeginning}
      />
      <Button
        icon={<TbArrowRight />}
        onClick={() => swiperRef.current?.slideNext()}
        disabled={isEnd}
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
