import { useState, useCallback, useRef } from 'react';
import type { Swiper as SwiperType } from 'swiper/types';

interface UseSwiperSyncOptions {
  totalSlides: number;
}

export const useSwiperSync = ({ totalSlides }: UseSwiperSyncOptions) => {
  const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canGoPrev, setCanGoPrev] = useState(false);
  const [canGoNext, setCanGoNext] = useState(true);

  // Flag to prevent circular synchronization
  const isUpdatingRef = useRef(false);

  // Update navigation button states for thumbnails
  const updateNavigationButtons = useCallback((swiper: SwiperType) => {
    if (!swiper || !swiper.params?.slidesPerView) return;

    const slidesPerView = Math.floor(swiper.params.slidesPerView as number);
    const currentIndex = swiper.activeIndex;
    const maxIndex = Math.max(0, totalSlides - slidesPerView);

    setCanGoPrev(currentIndex > 0);
    setCanGoNext(currentIndex < maxIndex);
  }, [totalSlides]);

  // Ensure the required thumbnail is visible
  const ensureThumbnailVisible = useCallback((targetIndex: number) => {
    if (!thumbsSwiper || isUpdatingRef.current) return;

    const slidesPerView = Math.floor(thumbsSwiper.params.slidesPerView as number) || 1;
    const currentActiveIndex = thumbsSwiper.activeIndex;

    // Check if target index is visible in current viewport
    const firstVisibleIndex = currentActiveIndex;
    const lastVisibleIndex = currentActiveIndex + slidesPerView - 1;

    if (targetIndex < firstVisibleIndex || targetIndex > lastVisibleIndex) {
      // Calculate optimal position to center the target element
      const optimalPosition = Math.max(
        0,
        Math.min(
          targetIndex - Math.floor(slidesPerView / 2),
          totalSlides - slidesPerView
        )
      );

      isUpdatingRef.current = true;
      thumbsSwiper.slideTo(optimalPosition);
      updateNavigationButtons(thumbsSwiper);

      // Reset flag after animation
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 300);
    }
  }, [thumbsSwiper, totalSlides, updateNavigationButtons]);

  // Handle thumbnail click
  const handleThumbnailClick = useCallback((index: number) => {
    if (!mainSwiper || isUpdatingRef.current) return;

    isUpdatingRef.current = true;

    // For loop mode use slideToLoop
    mainSwiper.slideToLoop(index);
    setActiveIndex(index);

    // Reset flag after animation
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 300);
  }, [mainSwiper]);

  // Handle thumbnail hover without blocking and animation
  const handleThumbnailHover = useCallback(
    (index: number) => {
      if (!mainSwiper) return;

      // Instant switch without animation
      mainSwiper.slideToLoop(index, 0);
      setActiveIndex(index);

      // Ensure thumbnail visibility
      ensureThumbnailVisible(index);
    },
    [mainSwiper, ensureThumbnailVisible]
  );

  // Thumbnail navigation
  const handleThumbnailNavigation = useCallback((direction: 'prev' | 'next') => {
    if (!thumbsSwiper) return;

    const slidesToMove = Math.min(4, Math.floor(thumbsSwiper.params.slidesPerView as number) || 1);
    const currentIndex = thumbsSwiper.activeIndex;

    let targetIndex;
    if (direction === 'prev') {
      targetIndex = Math.max(0, currentIndex - slidesToMove);
    } else {
      const maxIndex = Math.max(0, totalSlides - (thumbsSwiper.params.slidesPerView as number || 1));
      targetIndex = Math.min(maxIndex, currentIndex + slidesToMove);
    }

    thumbsSwiper.slideTo(targetIndex);
    // Update button state after animation
    setTimeout(() => updateNavigationButtons(thumbsSwiper), 300);
  }, [thumbsSwiper, totalSlides, updateNavigationButtons]);

  // Handle main slider change
  const handleMainSlideChange = useCallback((swiper: SwiperType) => {
    if (isUpdatingRef.current) return;

    // In loop mode use realIndex to get the true index
    const newIndex = swiper.realIndex;
    setActiveIndex(newIndex);

    // Synchronize thumbnails
    ensureThumbnailVisible(newIndex);
  }, [ensureThumbnailVisible]);

  // Initialize main slider
  const handleMainSwiperInit = useCallback((swiper: SwiperType) => {
    setMainSwiper(swiper);
  }, []);

  // Initialize thumbnails
  const handleThumbsSwiperInit = useCallback((swiper: SwiperType) => {
    setThumbsSwiper(swiper);
    // Initialize button state after loading
    setTimeout(() => updateNavigationButtons(swiper), 100);
  }, [updateNavigationButtons]);

  return {
    mainSwiper,
    thumbsSwiper,
    activeIndex,
    canGoPrev,
    canGoNext,
    handleThumbnailClick,
    handleThumbnailNavigation,
    handleMainSlideChange,
    handleMainSwiperInit,
    handleThumbsSwiperInit,
    handleThumbnailHover,
  };
};
