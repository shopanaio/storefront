"use client";

import { createStyles, cx } from "antd-style";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { mq } from "@src/ui-kit/Theme/breakpoints";
import { useBreakpoints } from "@src/hooks/useBreakpoints";

interface Prop {
  children: React.ReactNode;
  showOverflowRightPaddingAbove?: number;
  itemsLength?: number;
  slidesPerView?: number;
}

export default function SwiperContainer({
  children,
  showOverflowRightPaddingAbove = 1536,
  itemsLength,
  slidesPerView,
}: Prop) {
  const { styles } = useStyles();
  const [shouldNoLeftPadding, setShouldNoLeftPadding] = useState(false);
  const { isXxl, isXl, isLg, isMd } = useBreakpoints();

  const shouldShowPadding = useMediaQuery({
    query: `(min-width: ${showOverflowRightPaddingAbove}px)`,
  });

  useEffect(() => {
    let spv = 1;
    if (isXxl) spv = 6;
    else if (isXl) spv = 5;
    else if (isLg) spv = 4;
    else if (isMd) spv = 2;

    if (typeof slidesPerView === "number") spv = slidesPerView;

    setShouldNoLeftPadding(
      typeof itemsLength === "number" && itemsLength <= spv
    );
  }, [isXxl, isXl, isLg, isMd, slidesPerView, itemsLength]);

  return (
    <div
      className={cx(
        styles.swiperContainer,
        shouldShowPadding && styles.paddingRight,
        shouldNoLeftPadding && styles.noLeftPadding
      )}
    >
      {children}
    </div>
  );
}

const useStyles = createStyles(({ css, token }) => {
  return {
    swiperContainer: css`
      overflow: hidden;
      padding-left: ${token.paddingSM}px;
      padding-right: ${token.paddingSM}px;
      padding-bottom: 24px;

      --container-width: 100%;
      --offset: 0px;

      ${mq.lg} {
        margin-left: ${token.margin}px;
        padding-left: calc(${token.margin}px + 1px);
      }

      ${mq.xl} {
        --container-width: 1280px;
        --offset: max(16px, calc((100vw - var(--container-width)) / 2));
        margin-left: var(--offset);
        margin-right: var(--offset);
        padding-left: 0;
        padding-right: 0;
        width: auto;
        max-width: var(--container-width);
      }

      ${mq.xxl} {
        --container-width: 1400px;
        --offset: calc((100vw - var(--container-width)) / 2);
        margin-left: var(--offset);
        margin-right: var(--offset);
        max-width: var(--container-width);
      }
    `,

    paddingRight: css`
      padding-right: 0 !important;
    `,

    noLeftPadding: css`
      ${mq.lg} {
        padding-left: 0 !important;
      }
    `,
  };
});
