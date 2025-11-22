import dynamic from 'next/dynamic';
import type { PageTemplate } from '../core/types';
import type { HomePageData } from '../sdk/types';

const HeroSection = dynamic(() => import('../sections/Hero'));

export const homeTemplate: PageTemplate<HomePageData> = {
  name: 'home',
  sections: [
    {
      id: 'hero-default',
      component: HeroSection,
      settings: {
        title: 'Next Commerce Core',
        subtitle: 'RSC-first storefront builder with type-safe templates and islands.',
        ctaText: 'Explore products',
      },
    },
  ],
};
