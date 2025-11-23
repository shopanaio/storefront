// Home page template
import type { Template } from '@shopana/next-ecommerce-core';

// Import components
import MainLayout from '@/layout/MainLayout';
import HelloSection from '@/sections/HelloSection';
import TextBlock from '@/blocks/TextBlock';

// Define the template structure
const homeTemplate: Template = {
  layout: {
    component: MainLayout,
  },
  sections: {
    order: ['hero'],
    hero: {
      component: HelloSection,
      settings: {
        title: 'Hello World!',
        subtitle: 'Welcome to the Shopana Page Builder Framework',
      },
      blocks: {
        order: ['intro', 'features', 'status'],
        intro: {
          component: TextBlock,
          settings: {
            text: 'This is a demonstration of the @shopana/next-ecommerce-core framework integration.',
            variant: 'default',
          },
        },
        features: {
          component: TextBlock,
          settings: {
            text: 'The framework provides a type-safe, code-first approach to building e-commerce pages with React Server Components.',
            variant: 'highlight',
          },
        },
        status: {
          component: TextBlock,
          settings: {
            text: 'Task #11: Framework integration is complete! ✓',
            variant: 'muted',
          },
        },
      },
    },
  },
};

export default homeTemplate;
