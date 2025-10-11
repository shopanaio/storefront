'use client';

import { Image as AntImage, Skeleton } from 'antd';
import type { ImageProps as AntImageProps } from 'antd';
import { createStyles } from 'antd-style';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { fallbackImageBase64 } from '@src/components/Listing/fallbackImageBase64';
import clsx from 'clsx';

export interface UiImageProps
  extends Omit<AntImageProps, 'placeholder' | 'fallback'> {
  /** Custom placeholder while image is loading */
  placeholder?: ReactNode;
  /** Fallback image when `src` fails */
  fallbackSrc?: string;
  /** Placeholder aspect ratio; accepts number (e.g., 1) or CSS string (e.g., "4 / 3") */
  ratio?: number | string;
}

/**
 * Image component that avoids broken-image flash:
 * - Shows placeholder until the actual image is fully loaded
 * - On error, swaps to `fallbackSrc` and waits for it to load before revealing
 */
export const Image: React.FC<UiImageProps> = ({
  src,
  alt,
  className,
  style,
  preview = false,
  loading = 'lazy',
  placeholder,
  fallbackSrc = fallbackImageBase64,
  ratio = 1,
  onLoad,
  onError,
  ...rest
}) => {
  const { styles, cx } = useStyles({ ratio });

  const [resolvedSrc, setResolvedSrc] = useState<string>(src || fallbackSrc);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [minDelayElapsed, setMinDelayElapsed] = useState<boolean>(false);

  useEffect(() => {
    setResolvedSrc(src || fallbackSrc);
    setIsLoaded(false);
  }, [src, fallbackSrc]);

  // Ensure skeleton is shown for at least 500ms for the current image src
  useEffect(() => {
    setMinDelayElapsed(false);
    const timer = setTimeout(() => setMinDelayElapsed(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError: NonNullable<AntImageProps['onError']> = (e) => {
    if (resolvedSrc !== fallbackSrc) {
      setResolvedSrc(fallbackSrc);
      setIsLoaded(false);
    } else {
      setIsLoaded(true);
    }
    onError?.(e);
  };

  const placeholderNode = useMemo(() => {
    if (placeholder) return placeholder;
    return <Skeleton.Image active={false} className={styles.skeleton} />;
  }, [placeholder, styles.skeleton]);

  const showSkeleton = !isLoaded || !minDelayElapsed;

  return (
    <div className={styles.wrapper} style={style}>
      {showSkeleton && placeholderNode}
      <AntImage
        {...rest}
        className={styles.image}
        src={resolvedSrc}
        alt={alt}
        preview={preview}
        loading={loading}
        width="100%"
        height="100%"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          visibility: showSkeleton ? 'hidden' : 'visible',
        }}
      />
    </div>
  );
};

const useStyles = createStyles(
  ({ css, token }, params: { ratio: number | string }) => {
    const aspectRatio =
      typeof params.ratio === 'number' ? `${params.ratio} / 1` : params.ratio;
    return {
      wrapper: css`
        width: 100%;
        position: relative;
        aspect-ratio: ${aspectRatio};
      `,
      image: css`
        width: 100%;
        height: 100%;
        aspect-ratio: ${aspectRatio};
        object-fit: cover;
        display: block;
      `,
      placeholderImg: css`
        width: 100%;
        height: 100%;
        aspect-ratio: ${aspectRatio};
        border-radius: ${token.borderRadius}px;
        object-fit: cover;
        display: block;
        background-color: ${token.colorFillSecondary};
      `,
      skeleton: css`
        width: 100% !important;
        height: 100% !important;
        aspect-ratio: ${aspectRatio};
        position: absolute;
        inset: 0;

        .ant-skeleton-image {
          width: 100%;
          height: 100%;
        }
      `,
    };
  }
);

export default Image;
