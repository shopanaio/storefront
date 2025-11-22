import type { BlockSchema } from '@src/core/page-builder/types';

export const imageSchema: BlockSchema = {
  slug: 'image',
  name: 'Image',
  description: 'An image block',
  settings: [
    {
      type: 'image',
      id: 'src',
      label: 'Image URL',
      default: 'https://via.placeholder.com/800x400',
    },
    {
      type: 'text',
      id: 'alt',
      label: 'Alt Text',
      default: 'Image',
    },
    {
      type: 'number',
      id: 'width',
      label: 'Width',
      default: 800,
    },
    {
      type: 'number',
      id: 'height',
      label: 'Height',
      default: 400,
    },
    {
      type: 'select',
      id: 'fit',
      label: 'Object Fit',
      default: 'cover',
      options: [
        { label: 'Contain', value: 'contain' },
        { label: 'Cover', value: 'cover' },
        { label: 'Fill', value: 'fill' },
      ],
    },
  ],
};
