// Home page template
import type { Template, PageDataLoader } from '@shopana/next-ecommerce-core';
import type { Metadata } from 'next';

// Import components
import MainLayout from '@/layout/MainLayout';
import HelloSection from '@/sections/HelloSection';
import TextBlock from '@/blocks/TextBlock';

// Define the data structure for the home page
interface HomeData {
  message: string;
}

// Define the template structure
const homeTemplate: Template<HomeData> = {
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

// Data loader for the home page
export const loadData: PageDataLoader<HomeData> = async () => {
  // In a real app, this would fetch data from your backend/CMS
  // For now, return mock data
  return {
    message: 'Framework successfully integrated and working!',
  };
};

// Metadata builder
export async function buildMetadata(): Promise<Metadata> {
  return {
    title: 'Home - Shopana Store',
    description: 'Welcome to Shopana - A modern e-commerce platform built with Next.js',
  };
}

// Export template as default
export default homeTemplate;
