import { useContext } from "react";
import { createStyles } from "antd-style";
import type { SwiperProps, SwiperSlideProps } from "swiper/react";
import type { SwiperOptions } from "swiper/types";
import { ctx } from "@src/components/ui/IsomorphicSwiper/context";
import clsx from "clsx";

export const StaticSwiperSlide = ({
  children,
  className,
  ...props
}: SwiperSlideProps) => {
  const { slidesPerView, direction, breakpoints, spaceBetween } =
    useContext(ctx);

  const { styles } = useSlideStyles({
    slidesPerView,
    direction,
    breakpoints,
    spaceBetween: spaceBetween ?? 0, // Adding fallback
  });

  return (
    <div className={clsx("swiper-slide", styles.slide, className)} {...props}>
      {typeof children === "function"
        ? children({
            // TODO: Set correct values
            isActive: true,
            isNext: false,
            isPrev: false,
            isVisible: true,
          })
        : children}
    </div>
  );
};

const getSlideBreakpointCss = (props: SwiperOptions): string => {
  const {
    slidesPerView = "auto",
    spaceBetween = 0,
    direction = "horizontal",
  } = props;

  const size =
    slidesPerView === "auto"
      ? "auto"
      : `calc((100% - ${spaceBetween}px * ${
          slidesPerView - 1
        }) / ${slidesPerView})`;

  return `
    ${
      direction === "horizontal"
        ? `min-width: ${size}; max-width: ${size};`
        : `min-width: 100%; max-width: 100%; min-height: ${size}; max-height: ${size};`
    }
  `;
};

const useSlideStyles = createStyles(
  (
    { css },
    { direction, slidesPerView, breakpoints, spaceBetween }: SwiperProps
  ) => {
    const baseOptions: SwiperOptions = {
      slidesPerView,
      spaceBetween,
      direction,
    };

    const baseStyles = getSlideBreakpointCss(baseOptions);

    const responsiveStyles = Object.entries(breakpoints || {})
      .map(([bp, options]) => {
        const mergedOptions = { ...baseOptions, ...options };
        return `
          @media (min-width: ${bp}px) {
            ${getSlideBreakpointCss(mergedOptions)}
          }
        `;
      })
      .join("\n");

    return {
      slide: css`
        flex-shrink: 1;
        ${baseStyles}
        ${responsiveStyles}
      `,
    };
  }
);
