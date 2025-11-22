import type { SectionSchema } from '@src/core/page-builder/types';

export const featuresSchema: SectionSchema = {
  slug: 'features',
  name: 'Features Section',
  description: 'A grid of features with icons and descriptions',
  templates: ['home', 'page'],
  settings: [
    {
      type: 'text',
      id: 'title',
      label: 'Title',
      default: 'Our Features',
    },
    {
      type: 'textarea',
      id: 'description',
      label: 'Description',
      default: 'Discover what makes us special',
    },
    {
      type: 'select',
      id: 'columns',
      label: 'Columns',
      default: 3,
      options: [
        { label: '2 Columns', value: 2 },
        { label: '3 Columns', value: 3 },
        { label: '4 Columns', value: 4 },
      ],
    },
  ],
  blocks: {
    types: ['text', 'image', 'button'],
    max: 12,
  },
};
