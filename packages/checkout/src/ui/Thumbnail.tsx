'use client';

import { Button } from 'antd';
import { createStyles } from 'antd-style';
import clsx from 'clsx';

export interface ThumbnailProps {
  src?: string | null;
  alt?: string;
  className?: string;
  width?: number;
}

export function Thumbnail({ src, alt = '', className, width }: ThumbnailProps) {
  const { styles } = useStyles();
  return (
    <Button className={clsx(styles.root, className)} type="default">
      {src ? (
        <img src={src} alt={alt} width={width} className={styles.image} />
      ) : null}
    </Button>
  );
}

const useStyles = createStyles(({ css, token }) => ({
  root: css`
    padding: 2px;
    overflow: hidden;
    min-height: 48px;
    aspect-ratio: 1;
    border-radius: ${token.borderRadius}px;
  `,
  image: css`
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
  `,
}));
