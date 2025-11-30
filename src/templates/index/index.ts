import type { Template } from '@shopana/storefront-sdk/core/types';
import CategoryGridSection from './sections/CategoryGrid';
import HomeProductGridSection from './sections/ProductGrid';
import HomeSlideshowSection from './sections/ProductSlideshow';
import SlideshowWithBannerSection from './sections/ProductSlideshowWithImage';

const homeTemplate: Template = {
  sections: {
    order: [
      'categoryGridSection',
      'homeProductGridSection',
      'slideshowWithBannerLeft',
      'homeSlideshowSection',
      'slideshowWithBannerRight',
    ],
    homeSlideshowSection: {
      component: HomeSlideshowSection,
      settings: { categoryHandle: 'electronics', pagination: true },
    },
    slideshowWithBannerLeft: {
      component: SlideshowWithBannerSection,
      settings: {
        categoryHandle: 'electronics',
        bannerPlacement: 'before',
      },
    },
    homeProductGridSection: {
      component: HomeProductGridSection,
      settings: {
        categoryHandle: 'electronics',
        first: 16,
        paginationCount: 16,
      },
    },
    slideshowWithBannerRight: {
      component: SlideshowWithBannerSection,
      settings: {
        categoryHandle: 'electronics',
        bannerPlacement: 'after',
      },
    },
  },
};

export default homeTemplate;
