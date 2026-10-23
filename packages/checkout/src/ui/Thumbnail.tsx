'use client';

import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { ProductImage } from './ProductImage';

export interface ThumbnailProps {
  src?: string | null;
  alt?: string;
  className?: string;
}

export function Thumbnail({ src, alt = '', className }: ThumbnailProps) {
  const { styles, cx } = useStyles();
  return (
    <Button className={cx(styles.root, className)} type="default">
      <ProductImage src={src} alt={alt} className={styles.image} />
    </Button>
  );
}

/** Side of a product thumbnail, the same on a phone and on a desktop. */
export const THUMBNAIL_SIZE = 50;
/** Space between the image and the frame of the thumbnail. */
export const THUMBNAIL_INSET = 2;

const useStyles = createStyles(({ css, token }) => ({
  root: css`
    padding: ${THUMBNAIL_INSET}px;
    overflow: hidden;
    min-height: 48px;
    height: unset;
    flex-shrink: 0;
    aspect-ratio: 1;
    border-radius: ${token.borderRadius}px;
  `,
  image: css`
    width: 100%;
    height: 100%;
    object-fit: contain;
    /* Follows the frame: its radius less the inset. */
    border-radius: ${Math.max(token.borderRadius - THUMBNAIL_INSET, 0)}px;
  `,
}));
