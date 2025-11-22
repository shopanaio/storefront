import type { BlockProps } from '@src/core/page-builder/types';

export interface ButtonSettings {
  label: string;
  variant: 'primary' | 'secondary' | 'outline';
  size: 'small' | 'medium' | 'large';
  url?: string;
}

export default function Button({ settings }: BlockProps<ButtonSettings>) {
  const { label, variant, size, url } = settings;

  const baseClasses = 'inline-block rounded-lg font-semibold transition-colors';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  };

  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  };

  const className = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;

  if (url) {
    return (
      <a href={url} className={className}>
        {label}
      </a>
    );
  }

  return (
    <button className={className}>
      {label}
    </button>
  );
}
