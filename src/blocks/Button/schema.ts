import type { BlockSchema } from '@src/core/page-builder/types';

export const buttonSchema: BlockSchema = {
  slug: 'button',
  name: 'Button',
  description: 'A clickable button or link',
  settings: [
    {
      type: 'text',
      id: 'label',
      label: 'Button Label',
      default: 'Click me',
    },
    {
      type: 'select',
      id: 'variant',
      label: 'Variant',
      default: 'primary',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Outline', value: 'outline' },
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
    {
      type: 'text',
      id: 'url',
      label: 'URL (optional)',
      default: '',
    },
  ],
};
