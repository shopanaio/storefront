'use client';

import { createStyles } from 'antd-style';
import { useState } from 'react';
import { PiImageDuotone } from 'react-icons/pi';

export interface ProductImageProps {
  src?: string | null;
  alt?: string;
  /** Applied to the picture; the placeholder fills the same box. */
  className?: string;
}

/** Largest placeholder icon, however large the thumbnail. */
const MAX_ICON_PX = 64;

/**
 * Picture of a product in the checkout, or the same placeholder everywhere when it has none or
 * it does not load: the order summary, the shipments, the undeliverable lines. The placeholder
 * icon grows with the box it fills, up to 64px.
 */
export function ProductImage({ src, alt = '', className }: ProductImageProps) {
  const { styles, cx } = useStyles();
  /** Source that failed to load; another source is tried again. */
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src) {
    return (
      <span
        className={cx(styles.placeholder, className)}
        {...(alt
          ? { role: 'img', 'aria-label': alt }
          : { 'aria-hidden': true })}
      >
        <PiImageDuotone className={styles.icon} aria-hidden />
      </span>
    );
  }
  return (
    // A plain image: the pictures come from the store's media host, which the theme's
    // `next/image` configuration need not allow, and a failed load shows the placeholder.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(src)}
    />
  );
}

const useStyles = createStyles(({ css, token }) => ({
  // A light grey box in place of the picture; a size container, so the icon follows its
  // smaller side.
  placeholder: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    container-type: size;
    color: ${token.colorTextTertiary};
    background-color: ${token.colorFillTertiary};
  `,
  icon: css`
    width: min(50cqmin, ${MAX_ICON_PX}px);
    height: min(50cqmin, ${MAX_ICON_PX}px);
  `,
}));
