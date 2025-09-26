"use client";

import { Button } from "antd";
import { createStyles } from "antd-style";
import { ReactNode } from "react";
import FallbackAwareImage from "@src/components/UI/Image";
import clsx from "clsx";
import { useHover } from "@src/components/UI/hooks/useHover";

export interface ThumbnailProps {
  src?: string;
  alt?: string;
  /** Gallery of images for hover effect (overrides src) */
  gallery?: string[];
  /** Highlights the thumbnail as selected */
  selected?: boolean;
  /** Temporarily highlights the thumbnail, e.g., on external hover */
  hovered?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onMouseOver?: () => void;
  /** Optional overlay element (e.g., Radio / Checkbox) */
  overlay?: ReactNode;
  className?: string;
}

/**
 * Generic image thumbnail component with built-in selected state and overlay container.
 * Can be used across the project as a reusable UI-kit primitive.
 */
export const Thumbnail = ({
  src,
  alt = "thumbnail",
  gallery = [],
  selected = false,
  hovered = false,
  disabled,
  onClick,
  onMouseOver,
  overlay,
  className,
}: ThumbnailProps) => {
  const { styles } = useStyles();
  const [isHovering, hoverHandlers] = useHover();

  // Use gallery if provided, otherwise fallback to src
  const firstImage = gallery.length > 0 ? gallery[0] : src;
  const secondImage = gallery.length > 1 ? gallery[1] : undefined;

  return (
    <Button
      className={clsx(className, styles.thumbnailButton, {
        "ant-btn-color-primary": selected,
        [styles.hovered]: hovered,
      })}
      color="default"
      disabled={disabled}
      variant="outlined"
      onClick={onClick}
      {...hoverHandlers}
    >
      <div className={styles.imageWrapper} onMouseOver={onMouseOver}>
        {/* Second image for hover effect */}
        {secondImage && (
          <div
            className={styles.imageContainer}
            style={{ opacity: isHovering ? 1 : 0 }}
          >
            <FallbackAwareImage
              className={styles.img}
              src={secondImage}
              alt={alt}
              ratio={1}
              preview={false}
              loading="lazy"
            />
          </div>
        )}
        {/* First image */}
        <div
          className={styles.imageContainer}
          style={{ opacity: secondImage && isHovering ? 0 : 1 }}
        >
          <FallbackAwareImage
            className={styles.img}
            src={firstImage}
            alt={alt}
            ratio={1}
            preview={false}
            loading="lazy"
          />
        </div>
        {overlay && <div className={styles.overlay}>{overlay}</div>}
      </div>
    </Button>
  );
};

const useStyles = createStyles(({ css, token }) => {
  return {
    thumbnailButton: css`
      /* Height inherits from external class when necessary */
      padding: ${token.paddingXXS}px;
      border-radius: ${token.borderRadius}px;
      transition: all 0.2s ease;
      min-height: 48px;
      height: unset;
      flex-shrink: 0 !important;
      aspect-ratio: 1 / 1;
      box-sizing: border-box;

      &.ant-btn-color-primary {
        box-shadow: 0 0 0 1px ${token.colorPrimary};
      }
    `,
    hovered: css`
      border-color: ${token.colorPrimary};
    `,
    imageWrapper: css`
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: ${token.borderRadius}px;
    `,
    imageContainer: css`
      position: absolute;
      inset: 0;
      transition: opacity 0.2s ease;
    `,
    img: css`
      width: 100%;
      height: 100%;
      object-fit: cover;
      aspect-ratio: 1 / 1;
      border-radius: ${token.borderRadius}px;
    `,
    placeholder: css`
      width: 100%;
      border-radius: ${token.borderRadius}px;
      background-color: ${token.colorFillSecondary};
    `,
    overlay: css`
      position: absolute;
      top: 0px;
      right: 2px;
      z-index: 3;
    `,
  };
});
