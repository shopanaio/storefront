import type { Template } from '@shopana/storefront-sdk/core/types';
import CategoryGridSection from './sections/CategoryGridSection';
import HomeProductGridSection from './sections/HomeProductGridSection';
import HomeSlideshowSection from './sections/HomeSlideshowSection';
import SlideshowWithBannerSection from './sections/SlideshowWithBannerSection';

const homeTemplate: Template = {
  sections: {
    order: [
      'categoryGridSection',
      'homeProductGridSection',
      'slideshowWithBannerLeft',
      'homeSlideshowSection',
      'slideshowWithBannerRight',
    ],
    categoryGridSection: {
      component: CategoryGridSection,
      settings: {
        categoryHandle: 'electronics',
        title: 'Categories',
        repeatCount: 8,
      },
    },
    homeSlideshowSection: {
      component: HomeSlideshowSection,
      settings: { categoryKey: 'electronics', pagination: true },
    },
    slideshowWithBannerLeft: {
      component: SlideshowWithBannerSection,
      settings: {
        categoryKey: 'electronics',
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
        categoryKey: 'electronics',
        bannerPlacement: 'after',
      },
    },
  },
};

export default homeTemplate;
