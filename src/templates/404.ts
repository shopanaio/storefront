// 404 page template (placeholder)
import type { Template } from "@shopana/storefront-sdk/core/types";
import MainLayout from '@/layout/MainLayout';
import HelloSection from '@/sections/HelloSection';

const notFoundTemplate: Template = {
  layout: { component: MainLayout },
  sections: {
    order: ['placeholder'],
    placeholder: {
      component: HelloSection,
      settings: {
        title: '404 - Page Not Found',
        subtitle: 'The page you are looking for does not exist.',
      },
    },
  },
};

export default notFoundTemplate;
