import type { BlockProps } from '@src/core/page-builder/types';

export interface ImageSettings {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fit: 'contain' | 'cover' | 'fill';
}

export default function Image({ settings }: BlockProps<ImageSettings>) {
  const { src, alt, width, height, fit } = settings;

  const fitClasses = {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill',
  };

  return (
    <div className="relative w-full">
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`w-full h-auto ${fitClasses[fit]}`}
      />
    </div>
  );
}
