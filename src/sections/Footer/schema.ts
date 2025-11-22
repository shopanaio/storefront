import type { SectionSchema } from '@src/core/page-builder/types';

export const footerSchema: SectionSchema = {
  slug: 'footer',
  name: 'Footer Section',
  description: 'A footer with links and copyright information',
  settings: [
    {
      type: 'text',
      id: 'copyrightText',
      label: 'Copyright Text',
      default: '© 2025 Your Company. All rights reserved.',
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
    {
      type: 'checkbox',
      id: 'showSocial',
      label: 'Show Social Links',
      default: true,
    },
  ],
  blocks: {
    types: ['text', 'button'],
    max: 6,
  },
};
