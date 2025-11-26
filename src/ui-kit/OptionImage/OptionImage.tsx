"use client";

import { Image, ImageProps } from "antd";
import { createStyles, cx } from "antd-style";
import { fallbackImageBase64 } from "@src/ui-kit/fallbackImageBase64";

export interface OptionImageProps
  extends Omit<ImageProps, "fallback" | "preview"> {
  /** Size variant */
  size?: "small" | "medium" | "large" | "custom";
  /** Custom size in pixels (when size="custom") */
  customSize?: number;
  /** Whether to show border */
  bordered?: boolean;
  /** Aspect ratio */
  aspectRatio?: "1/1" | "4/3" | "16/9" | "auto";
}

/**
 * Universal image component for product options.
 * Automatically applies fallback and common styles.
 */
export const OptionImage = ({
  size = "medium",
  customSize,
  bordered = false,
  aspectRatio = "1/1",
  className,
  src,
  alt = "option image",
  loading = "lazy",
  ...imageProps
}: OptionImageProps) => {
  const { styles, theme } = useStyles();

  return (
    <Image
      className={cx(styles.image, className)}
      src={src}
      alt={alt}
      loading={loading}
      preview={false}
      fallback={fallbackImageBase64}
      style={
        {
          "--image-size": `var(--thumb-size)`,
          "--aspect-ratio": aspectRatio,
          "--border": bordered ? `1px solid ${theme.colorBorder}` : "none",
        } as React.CSSProperties
      }
      {...imageProps}
    />
  );
};

const useStyles = createStyles(({ css, token }) => ({
  image: css`
    min-width: var(--image-size);
    min-height: var(--image-size);
    max-width: var(--image-size);
    max-height: var(--image-size);
    flex-shrink: 0;
    border-radius: ${token.borderRadius}px;
    object-fit: cover;
    aspect-ratio: var(--aspect-ratio);
    border: var(--border);
  `,
}));
