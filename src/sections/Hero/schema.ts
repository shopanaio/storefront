import type { SectionSchema } from '@src/core/page-builder/types';

export const heroSchema: SectionSchema = {
  slug: 'hero',
  name: 'Hero Section',
  description: 'A hero section with title, subtitle and call-to-action buttons',
  templates: ['home', 'page'],
  settings: [
    {
      type: 'text',
      id: 'title',
      label: 'Title',
      default: 'Welcome to Our Site',
    },
    {
      type: 'textarea',
      id: 'subtitle',
      label: 'Subtitle',
      default: 'Your one-stop solution for everything you need',
    },
    {
      type: 'image',
      id: 'backgroundImage',
      label: 'Background Image (optional)',
      default: '',
    },
    {
      type: 'color',
      id: 'backgroundColor',
      label: 'Background Color',
      default: '#1a1a2e',
    },
    {
      type: 'color',
      id: 'textColor',
      label: 'Text Color',
      default: '#ffffff',
    },
  ],
  blocks: {
    types: ['button', 'text'],
    max: 3,
  },
};
