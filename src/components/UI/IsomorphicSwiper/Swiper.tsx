import React from "react";
import { createStyles } from "antd-style";
import type { SwiperProps } from "swiper/react";
import type { SwiperOptions } from "swiper/types";
import { ctx } from "@src/components/ui/IsomorphicSwiper/context";
import clsx from "clsx";

export const StaticSwiper = ({
  children,
  className,
  slidesPerView,
  initialSlide = 0,
  spaceBetween = 0,
  direction = "horizontal",
  grabCursor = false,
  centeredSlides = false,
  breakpoints,
  ...props
}: SwiperProps) => {
  const { styles } = useSwiperStyles({
    slidesPerView,
    spaceBetween,
    direction,
    grabCursor,
    centeredSlides,
    breakpoints,
    initialSlide,
  });

  const childArray = React.Children.toArray(children);

  // Handle slidesPerView for limitedChildren
  const limitedChildren =
    slidesPerView === "auto"
      ? childArray.slice(initialSlide) // If auto, take all elements starting from initialSlide
      : childArray;

  return (
    <ctx.Provider
      value={{
        slidesPerView,
        direction,
        breakpoints,
        spaceBetween,
      }}
    >
      <div
        className={clsx(
          "swiper",
          "swiper-initialized",
          "swiper-backface-hidden",
          direction === "horizontal" ? "swiper-horizontal" : "swiper-vertical",
          styles.container,
          className
        )}
        {...props}
      >
        <div className={clsx("swiper-wrapper", styles.swiperWrapper)}>
          {centeredSlides ? childArray : limitedChildren}
        </div>
      </div>
    </ctx.Provider>
  );
};

type BreakpointProps = {
  slidesPerView?: number | "auto";
  spaceBetween?: number;
  direction?: "horizontal" | "vertical";
  centeredSlides?: boolean;
  initialSlide?: number;
};

const getBreakpointCss = (props: BreakpointProps): string => {
  const {
    slidesPerView = "auto",
    spaceBetween = 0,
    direction = "horizontal",
    centeredSlides = false,
    initialSlide = 0,
  } = props;

  const baseSize =
    slidesPerView === "auto"
      ? "auto"
      : `calc((100% - ${spaceBetween}px * ${
          slidesPerView - 1
        }) / ${slidesPerView})`;

  return `
    gap: ${spaceBetween}px;
    flex-direction: ${direction === "horizontal" ? "row" : "column"};
    ${
      direction === "horizontal" && centeredSlides
        ? `
        transform: translateX(calc(
          50% - (${initialSlide} * (${baseSize} + ${spaceBetween}px)) - (${baseSize} / 2)
        ));
      `
        : ""
    }
  `;
};

const useSwiperStyles = createStyles(
  (
    { css },
    {
      direction,
      grabCursor,
      spaceBetween,
      slidesPerView,
      breakpoints,
      centeredSlides,
      initialSlide,
    }: {
      direction?: "horizontal" | "vertical";
      grabCursor?: boolean;
      spaceBetween?: number;
      slidesPerView?: number | "auto";
      breakpoints?: SwiperOptions["breakpoints"];
      centeredSlides?: boolean;
      initialSlide?: number;
    }
  ) => {
    const baseOptions: BreakpointProps = {
      slidesPerView,
      spaceBetween,
      direction,
      centeredSlides,
      initialSlide,
    };

    const baseStyles = getBreakpointCss(baseOptions);

    const responsiveStyles = Object.entries(breakpoints || {})
      .map(([bp, options]) => {
        const mergedOptions = { ...baseOptions, ...options };
        return `
          @media (min-width: ${bp}px) {
            ${getBreakpointCss(mergedOptions)}
          }
        `;
      })
      .join("\n");

    return {
      container: css`
        cursor: ${grabCursor ? "grab" : "default"};
        overflow: hidden;
      `,
      swiperWrapper: css`
        display: flex;
        ${baseStyles}
        ${responsiveStyles}
      `,
    };
  }
);
