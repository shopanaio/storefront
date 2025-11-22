// Import registry initialization to register all sections and blocks on the server
import '@src/core/page-builder/registry-init';

import { PageBuilderSSR } from '@src/core/page-builder/PageBuilderSSR';
import type { PageTemplate } from '@src/core/page-builder/types';
import type { ShopConfig } from '@src/core/shop/types';
import type { DynamicModulePageProps } from '@src/modules/registry';

// Mock shop configuration
const mockShopConfig: ShopConfig = {
  name: 'Test Shop',
  domain: 'test-shop.com',
  email: 'test@test-shop.com',
  locale: {
    code: 'en',
    name: 'English',
    direction: 'ltr',
  },
  availableLocales: [{ code: 'en', name: 'English', direction: 'ltr' }],
  currency: {
    code: 'USD',
    symbol: '$',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimals: 2,
  },
  availableCurrencies: [
    {
      code: 'USD',
      symbol: '$',
      symbolPosition: 'before',
      decimalSeparator: '.',
      thousandsSeparator: ',',
      decimals: 2,
    },
  ],
  timezone: 'America/New_York',
  moneyFormat: {
    currency: {
      code: 'USD',
      symbol: '$',
      symbolPosition: 'before',
      decimalSeparator: '.',
      thousandsSeparator: ',',
      decimals: 2,
    },
    locale: {
      code: 'en',
      name: 'English',
      direction: 'ltr',
    },
  },
  dateFormat: 'MM/DD/YYYY',
  weightUnit: 'kg',
  measurementUnit: 'metric',
  features: {
    cart: true,
    wishlist: true,
    reviews: true,
    compareProducts: false,
    giftCards: false,
    subscriptions: false,
    multiCurrency: false,
    inventory: true,
  },
};

// Test page template with Layout
const testPageTemplate: PageTemplate = {
  id: 'test-page',
  name: 'Test Page Builder',
  pageType: 'home',
  // Layout configuration (wraps the entire page)
  layout: {
    id: 'main-layout',
    type: 'default',
    settings: {
      backgroundColor: '#f5f5f5',
      maxWidth: 1440,
      stickyHeader: true,
    },
    sections: [
      // Footer in layout (will appear on all pages using this layout)
      {
        id: 'footer-1',
        type: 'footer',
        settings: {
          copyrightText:
            '© 2025 Page Builder Framework. Built with ❤️ and Next.js',
          backgroundColor: '#1a1a2e',
          textColor: '#ffffff',
          showSocial: true,
        },
        blocks: [
          {
            id: 'footer-text-1',
            type: 'text',
            settings: {
              content:
                'About Us\n\nWe build amazing page builder frameworks for modern web applications.',
              align: 'left',
              size: 'small',
            },
          },
          {
            id: 'footer-text-2',
            type: 'text',
            settings: {
              content: 'Quick Links\n\nHome\nFeatures\nDocumentation\nContact',
              align: 'left',
              size: 'small',
            },
          },
          {
            id: 'footer-text-3',
            type: 'text',
            settings: {
              content: 'Contact\n\nemail@example.com\n+1 (555) 123-4567',
              align: 'left',
              size: 'small',
            },
          },
        ],
      },
    ],
  },
  // Page-specific sections
  sections: [
    // Hero Section
    {
      id: 'hero-1',
      type: 'hero',
      settings: {
        title: 'Welcome to Page Builder Test',
        subtitle:
          'This is a demonstration of the page builder framework with sections and blocks',
        backgroundColor: '#1a1a2e',
        textColor: '#ffffff',
      },
      blocks: [
        {
          id: 'hero-btn-1',
          type: 'button',
          settings: {
            label: 'Get Started',
            variant: 'primary',
            size: 'large',
            url: '#features',
          },
        },
        {
          id: 'hero-btn-2',
          type: 'button',
          settings: {
            label: 'Learn More',
            variant: 'outline',
            size: 'large',
            url: '#about',
          },
        },
      ],
    },
    // Features Section
    {
      id: 'features-1',
      type: 'features',
      settings: {
        title: 'Amazing Features',
        description: 'Discover what makes our page builder framework special',
        columns: 3,
      },
      blocks: [
        {
          id: 'feature-1',
          type: 'text',
          settings: {
            content:
              '🚀 Fast & Performant - Built with Next.js and React for optimal performance',
            align: 'center',
            size: 'medium',
          },
        },
        {
          id: 'feature-2',
          type: 'text',
          settings: {
            content:
              '🎨 Flexible & Customizable - Easily create and customize sections and blocks',
            align: 'center',
            size: 'medium',
          },
        },
        {
          id: 'feature-3',
          type: 'text',
          settings: {
            content:
              '💪 Type-Safe - Full TypeScript support with type inference',
            align: 'center',
            size: 'medium',
          },
        },
        {
          id: 'feature-4',
          type: 'text',
          settings: {
            content:
              '📦 Modular - Component-based architecture for easy maintenance',
            align: 'center',
            size: 'medium',
          },
        },
        {
          id: 'feature-5',
          type: 'text',
          settings: {
            content:
              '🔄 State Management - Powered by Zustand for efficient state updates',
            align: 'center',
            size: 'medium',
          },
        },
        {
          id: 'feature-6',
          type: 'text',
          settings: {
            content:
              '✅ Validated - Built-in validation for templates and configurations',
            align: 'center',
            size: 'medium',
          },
        },
      ],
    },
  ],
};

export default async function PageBuilderModulePage(_props: DynamicModulePageProps) {
  return <PageBuilderSSR template={testPageTemplate} />;
}
