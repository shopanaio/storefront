'use client';

import { forwardRef, type CSSProperties } from 'react';
import type { ImageComponent, ImageProps } from '../core/facade-types';

export type { ImageProps };

const fillStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
};

/**
 * The image of the `next/image` contract as a plain `<img>`: React Router has no image
 * optimizer, so the source is served as is (`quality` and `unoptimized` change nothing). `fill`
 * covers the positioned parent, `priority` loads eagerly with a high fetch priority, and a
 * `blur` placeholder shows behind the image until it loads.
 */
const Image: ImageComponent = forwardRef<HTMLImageElement, ImageProps>(
  function Image(
    {
      src,
      alt,
      width,
      height,
      fill,
      priority,
      loading,
      placeholder,
      blurDataURL,
      quality,
      unoptimized,
      style,
      ...props
    },
    ref
  ) {
    void quality;
    void unoptimized;
    const staticImage = typeof src === 'string' ? null : src;
    const blur =
      placeholder === 'blur'
        ? (blurDataURL ?? staticImage?.blurDataURL)
        : undefined;

    return (
      // React Router has no image optimizer: this is the plain image the contract allows.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={ref}
        src={staticImage ? staticImage.src : (src as string)}
        alt={alt}
        width={fill ? undefined : (width ?? staticImage?.width)}
        height={fill ? undefined : (height ?? staticImage?.height)}
        loading={priority ? 'eager' : (loading ?? 'lazy')}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        style={{
          color: 'transparent',
          ...(fill ? fillStyle : undefined),
          ...(blur
            ? {
                backgroundImage: `url("${blur}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined),
          ...style,
        }}
        {...props}
      />
    );
  }
);

export default Image;
export { Image };
