import type { LayoutSchema } from '@src/core/page-builder/types';

export const defaultLayoutSchema: LayoutSchema = {
  slug: 'default',
  name: 'Default Layout',
  description: 'Standard layout with header and footer sections',
  templates: ['home', 'page', 'product', 'collection', 'blog', 'article'],
  settings: [
    {
      type: 'color',
      id: 'backgroundColor',
      label: 'Background Color',
      default: '#ffffff',
      helpText: 'Main background color for the layout',
    },
    {
      type: 'number',
      id: 'maxWidth',
      label: 'Max Content Width (px)',
      default: 1440,
      min: 960,
      max: 1920,
      step: 80,
      helpText: 'Maximum width of the main content area',
    },
    {
      type: 'checkbox',
      id: 'stickyHeader',
      label: 'Sticky Header',
      default: true,
      helpText: 'Keep header fixed at top when scrolling',
    },
  ],
  sections: {
    types: ['hero', 'features', 'footer'],
    max: 10,
  },
};
