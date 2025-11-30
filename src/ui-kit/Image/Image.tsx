'use client';

import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import { fallbackImageBase64 } from '@src/ui-kit/fallbackImageBase64';
import { releaseImageCache, retainImageCache } from './imageCache';

export interface UiImageProps {
  /** Image source URL */
  src?: string;
  /** Alt text for the image */
  alt?: string;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles for the wrapper */
  style?: React.CSSProperties;
  /** Custom placeholder while image is loading */
  placeholder?: ReactNode;
  /** Fallback image when `src` fails */
  fallbackSrc?: string;
  /** Placeholder aspect ratio; accepts number (e.g., 1) or CSS string (e.g., "4 / 3") */
  ratio?: number | string;
  /** Callback when image loads successfully */
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  /** Callback when image fails to load */
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  /** Pixels before viewport to trigger loading */
  threshold?: number;
  /** Show image immediately without lazy loading */
  visibleByDefault?: boolean;
}

/**
 * Image component with lazy loading:
 * - Uses react-lazy-load-image-component for efficient lazy loading
 * - Uses a shared in-memory cache to reuse decoded images across component mounts
 * - Sequentially attempts primary src followed by fallback until one resolves
 * - Shows placeholder while loading with smooth opacity transition
 * - Allows external consumers to supply a custom placeholder or fallback source
 */
const isServer = typeof window === 'undefined';

export const Image: React.FC<UiImageProps> = ({
  src,
  alt,
  className,
  style,
  placeholder,
  fallbackSrc = fallbackImageBase64,
  ratio = 1,
  onLoad,
  onError,
  threshold = 100,
  visibleByDefault = isServer,
}) => {
  const { styles, cx } = useStyles({ ratio });
  const { styles: skeletonClassNames } = useSkeletonStyles();

  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset state when src changes
  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  // Retain/release image cache
  useEffect(() => {
    if (!currentSrc) {
      return;
    }

    retainImageCache(currentSrc);

    return () => {
      releaseImageCache(currentSrc);
    };
  }, [currentSrc]);

  const handleLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoaded(true);
      onLoad?.(event);
    },
    [onLoad]
  );

  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      if (!hasError && fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        setHasError(true);
      } else {
        onError?.(event);
      }
    },
    [hasError, fallbackSrc, currentSrc, onError]
  );

  const placeholderElement = placeholder ?? (
    <Skeleton.Image classNames={skeletonClassNames} />
  );

  const showPlaceholder = !isLoaded;

  return (
    <div className={cx(styles.wrapper, className)} style={style}>
      <div
        className={cx(
          styles.placeholderWrapper,
          !showPlaceholder && styles.placeholderHidden
        )}
        aria-hidden={!showPlaceholder}
      >
        <div className={styles.placeholderContent}>{placeholderElement}</div>
      </div>
      <LazyLoadImage
        src={currentSrc}
        alt={alt}
        effect="opacity"
        threshold={threshold}
        visibleByDefault={visibleByDefault}
        wrapperClassName={styles.imageWrapper}
        className={styles.image}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

const useSkeletonStyles = createStyles(({ css }) => ({
  root: css`
    width: 100% !important;
    height: 100% !important;
    container-type: inline-size;

    @container (min-width: 300px) {
      .ant-skeleton-image {
        --ant-control-height: 48px;
      }
    }

    @container (max-width: 100px) {
      .ant-skeleton-image {
        --ant-control-height: 24px;
      }
    }

    @container (max-width: 80px) {
      .ant-skeleton-image {
        --ant-control-height: 20px;
      }
    }
  `,
  content: css`
    width: 100% !important;
    height: 100% !important;
  `,
}));

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
        z-index: 1;
      `,
      placeholderHidden: css`
        opacity: 0;
      `,
      placeholderContent: css`
        width: 100%;
        height: 100%;
        aspect-ratio: ${aspectRatio};
        border-radius: ${token.borderRadius}px;
        display: flex;
        align-items: stretch;
        overflow: hidden;
      `,
      imageWrapper: css`
        width: 100% !important;
        height: 100% !important;
        display: block !important;
      `,
      image: css`
        width: 100%;
        height: 100%;
        aspect-ratio: ${aspectRatio};
        object-fit: cover;
        display: block;
      `,
    };
  }
);

export default Image;
