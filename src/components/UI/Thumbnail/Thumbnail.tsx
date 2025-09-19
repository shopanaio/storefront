"use client";

import { Button } from "antd";
import { createStyles } from "antd-style";
import { ReactNode } from "react";
import FallbackAwareImage from "@src/components/UI/Image";
import clsx from "clsx";

export interface ThumbnailProps {
  src?: string;
  alt?: string;
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
  selected = false,
  hovered = false,
  disabled,
  onClick,
  onMouseOver,
  overlay,
  className,
}: ThumbnailProps) => {
  const { styles } = useStyles();

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
    >
      <div className={styles.imageWrapper} onMouseOver={onMouseOver}>
        <FallbackAwareImage
          className={styles.img}
          src={src}
          alt={alt}
          ratio={1}
          preview={false}
          loading="lazy"
        />
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
    `,
    img: css`
      width: 100%;
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
    `,
  };
});
