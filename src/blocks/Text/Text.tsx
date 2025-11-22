import type { BlockProps } from '@src/core/page-builder/types';

export interface TextSettings {
  content: string;
  align: 'left' | 'center' | 'right';
  size: 'small' | 'medium' | 'large';
}

export default function Text({ settings }: BlockProps<TextSettings>) {
  const { content, align, size } = settings;

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  // Preserve line breaks in content
  return (
    <div className={`${alignClasses[align]} ${sizeClasses[size]}`}>
      {content.split('\n').map((line, index) => (
        <p key={index}>{line}</p>
      ))}
    </div>
  );
}
