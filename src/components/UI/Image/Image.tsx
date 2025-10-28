'use client';

import { Image as AntImage, Skeleton } from 'antd';
import type { ImageProps as AntImageProps } from 'antd';
import { createStyles } from 'antd-style';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { fallbackImageBase64 } from '@src/components/Listing/fallbackImageBase64';
import {
  isImageCached,
  preloadImage,
  releaseImageCache,
  retainImageCache,
} from './imageCache';

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
 * Image component with optimistic preloading:
 * - Uses a shared in-memory cache to reuse decoded images across component mounts
 * - Sequentially attempts primary src followed by fallback until one resolves
 * - Keeps placeholder visible until a cached or newly decoded image is ready
 * - Allows external consumers to supply a custom placeholder or fallback source
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

  const [visibleSrc, setVisibleSrc] = useState<string | null>(null);
  const [isImageVisible, setIsImageVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const sources = Array.from(
      new Set([src, fallbackSrc].filter(Boolean))
    ) as string[];

    setIsImageVisible(false);
    setVisibleSrc(null);

    if (!sources.length) {
      return;
    }

    let isActive = true;

    const preloadSources = async () => {
      for (const candidate of sources) {
        if (!isActive) {
          return;
        }

        if (isImageCached(candidate)) {
          setVisibleSrc(candidate);
          setIsImageVisible(true);
          return;
        }

        try {
          await preloadImage(candidate);

          if (!isActive) {
            return;
          }

          setVisibleSrc(candidate);
          return;
        } catch {
          // Try the next source.
        }
      }

      if (!isActive) {
        return;
      }

      const fallbackToShow = fallbackSrc ?? null;

      if (fallbackToShow) {
        setVisibleSrc(fallbackToShow);
        setIsImageVisible(true);
      }

      onError?.(new Event('error') as any);
    };

    void preloadSources();

    return () => {
      isActive = false;
    };
  }, [src, fallbackSrc, onError]);

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsImageVisible(true);
    onLoad?.(event);
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsImageVisible(false);
    if (fallbackSrc && visibleSrc && visibleSrc !== fallbackSrc) {
      void preloadImage(fallbackSrc)
        .then(() => {
          setVisibleSrc(fallbackSrc);
        })
        .catch(() => undefined);
    }
    onError?.(event);
  };

  const placeholderContent = useMemo(
    () =>
      placeholder ?? (
        <Skeleton.Image active={false} className={styles.skeleton} />
      ),
    [placeholder, styles.skeleton]
  );

  const placeholderVisible = !visibleSrc || !isImageVisible;

  useEffect(() => {
    if (!visibleSrc) {
      return;
    }

    retainImageCache(visibleSrc);

    return () => {
      releaseImageCache(visibleSrc);
    };
  }, [visibleSrc]);

  return (
    <div className={styles.wrapper} style={style}>
      <div
        className={cx(
          styles.placeholderWrapper,
          !placeholderVisible && styles.placeholderHidden
        )}
        aria-hidden={!placeholderVisible}
      >
        <div className={styles.placeholderContent}>{placeholderContent}</div>
      </div>
      {visibleSrc && (
        <AntImage
          {...rest}
          className={cx(
            styles.image,
            isImageVisible && styles.imageVisible,
            className
          )}
          src={visibleSrc}
          alt={alt}
          preview={preview}
          loading={loading}
          width="100%"
          height="100%"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
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
        overflow: hidden;
      `,
      placeholderWrapper: css`
        position: absolute;
        inset: 0;
        display: flex;
        transition: opacity 180ms ease;
        opacity: 1;
        pointer-events: none;
      `,
      placeholderHidden: css`
        opacity: 0;
      `,
      placeholderContent: css`
        width: 100%;
        height: 100%;
        aspect-ratio: ${aspectRatio};
        border-radius: ${token.borderRadius}px;
        background-color: ${token.colorFillSecondary};
        display: flex;
        align-items: stretch;
        overflow: hidden;
      `,
      image: css`
        width: 100%;
        height: 100%;
        aspect-ratio: ${aspectRatio};
        object-fit: cover;
        display: block;
        opacity: 0;
        transition: opacity 180ms ease;
      `,
      imageVisible: css`
        opacity: 1;
      `,
      skeleton: css`
        width: 100% !important;
        height: 100% !important;
        aspect-ratio: ${aspectRatio};
        display: block !important;

        .ant-skeleton-image {
          width: 100%;
          height: 100%;
        }
      `,
    };
  }
);

export default Image;
