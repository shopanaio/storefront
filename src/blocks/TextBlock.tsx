'use client';

import type { BlockProps } from '@shopana/next-ecommerce-core';

interface TextBlockSettings {
  text: string;
  variant?: 'default' | 'highlight' | 'muted';
}

export default function TextBlock({ id, settings }: BlockProps<TextBlockSettings>) {
  const variantClasses = {
    default: 'text-gray-800 bg-white',
    highlight: 'text-blue-900 bg-blue-100',
    muted: 'text-gray-600 bg-gray-50',
  };

  const variant = settings.variant || 'default';

  return (
    <div
      id={id}
      className={`p-4 rounded-lg ${variantClasses[variant]}`}
    >
      <p className="text-base leading-relaxed">{settings.text}</p>
    </div>
  );
}
