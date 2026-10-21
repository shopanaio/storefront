'use client';

import { Button } from 'antd';
import { createStyles } from 'antd-style';

export interface ThumbnailProps {
  src?: string | null;
  alt?: string;
  className?: string;
  width?: number;
}

export function Thumbnail({ src, alt = '', className, width }: ThumbnailProps) {
  const { styles, cx } = useStyles();
  return (
    <Button className={cx(styles.root, className)} type="default">
      {src ? (
        <img src={src} alt={alt} width={width} className={styles.image} />
      ) : null}
    </Button>
  );
}

/** Space between the image and the frame of the thumbnail. */
const INSET = 2;

const useStyles = createStyles(({ css, token }) => ({
  root: css`
    padding: ${INSET}px;
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
    border-radius: ${Math.max(token.borderRadius - INSET, 0)}px;
  `,
}));
