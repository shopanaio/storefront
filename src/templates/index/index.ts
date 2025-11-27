import type { Template } from '@shopana/storefront-sdk/core/types';
import ProductGridSection from './sections/ProductGridSection';
import HomeProductGridSection from './sections/HomeProductGridSection';
import HomeSlideshowSection from './sections/HomeSlideshowSection';
import SlideshowWithBannerSection from './sections/SlideshowWithBannerSection';

const homeTemplate: Template = {
  sections: {
    order: [
      'homeSlideshowSection',
      'slideshowWithBannerLeft',
      'productGridSection',
      'homeProductGridSection',
      'slideshowWithBannerRight',
    ],
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
    productGridSection: {
      component: ProductGridSection,
      settings: { categoryHandle: 'electronics' },
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
