import type { LayoutSchema } from '@src/core/page-builder/types';

export const fullWidthLayoutSchema: LayoutSchema = {
  slug: 'full-width',
  name: 'Full Width Layout',
  description: 'Full-width layout without max-width constraints',
  templates: ['home', 'page', 'product', 'collection'],
  settings: [
    {
      type: 'color',
      id: 'backgroundColor',
      label: 'Background Color',
      default: '#ffffff',
      helpText: 'Background color for the entire layout',
    },
    {
      type: 'checkbox',
      id: 'includeHeader',
      label: 'Include Header',
      default: true,
      helpText: 'Show header section',
    },
    {
      type: 'checkbox',
      id: 'includeFooter',
      label: 'Include Footer',
      default: true,
      helpText: 'Show footer section',
    },
  ],
  sections: {
    types: ['hero', 'features', 'footer'],
    max: 10,
  },
};
