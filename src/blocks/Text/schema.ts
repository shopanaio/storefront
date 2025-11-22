import type { BlockSchema } from '@src/core/page-builder/types';

export const textSchema: BlockSchema = {
  slug: 'text',
  name: 'Text',
  description: 'A text paragraph block',
  settings: [
    {
      type: 'textarea',
      id: 'content',
      label: 'Text Content',
      default: 'Enter your text here...',
    },
    {
      type: 'select',
      id: 'align',
      label: 'Alignment',
      default: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
    {
      type: 'select',
      id: 'size',
      label: 'Size',
      default: 'medium',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
    },
  ],
};
