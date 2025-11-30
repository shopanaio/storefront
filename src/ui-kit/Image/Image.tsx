'use client';

import { createStyles } from 'antd-style';
import React, { ReactNode, useCallback } from 'react';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import clsx from 'clsx';
import NextImage from 'next/image';
import { fallbackImageBase64 } from '@src/ui-kit/fallbackImageBase64';

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
  /** Width of the image in pixels */
  width?: number;
}

export const Image: React.FC<UiImageProps> = ({
  src,
  alt,
  className,
  style,
  ratio = 1,
  width,
  onLoad,
}) => {
  if (width !== undefined && width <= 0) {
    throw new Error('Width must be a positive number.');
  }

  const { styles } = useStyles({ ratio });

  const handleLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      onLoad?.(event);
    },
    [onLoad]
  );

  return (
    <div className={clsx(styles.wrapper, className)} style={style}>
      <NextImage
        width={width || 1000}
        height={(width || 1000) / (typeof ratio === 'number' ? ratio : 1)}
        src={src || fallbackImageBase64 || ''}
        alt={alt || ''}
        className={styles.image}
        onLoad={handleLoad}
        loading="lazy"
        placeholder="empty"
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
