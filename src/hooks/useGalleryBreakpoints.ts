import { useMemo } from "react";
import { GalleryBreakpointSettings } from "@src/utils/galleryStyles";

interface UseGalleryBreakpointsResult {
  styleBreakpoints: Record<number, GalleryBreakpointSettings>;
  swiperBreakpoints: Record<
    number,
    { slidesPerView?: number; direction?: "vertical" | "horizontal" }
  >;
}

export const useGalleryBreakpoints = (
  galleryBreakpoints: Record<number, GalleryBreakpointSettings>,
  galleryLength: number
): UseGalleryBreakpointsResult => {
  return useMemo(() => {
    const styleBreakpoints: Record<number, GalleryBreakpointSettings> = {};
    const swiperBreakpoints: Record<
      number,
      { slidesPerView?: number; direction?: "vertical" | "horizontal" }
    > = {};

    for (const width in galleryBreakpoints) {
      const settings = galleryBreakpoints[width];
      const limitedThumbnailsPerView = Math.min(
        settings.thumbnailsPerView ?? 8,
        galleryLength
      );
      styleBreakpoints[width] = {
        ...settings,
        thumbnailsPerView: settings.thumbnailsPerView,
        thumbnailsCount: limitedThumbnailsPerView,
      };
      swiperBreakpoints[width] = {
        slidesPerView: limitedThumbnailsPerView,
        direction: settings.thumbnailDirection,
      };
    }
    return { styleBreakpoints, swiperBreakpoints };
  }, [galleryBreakpoints, galleryLength]);
};
