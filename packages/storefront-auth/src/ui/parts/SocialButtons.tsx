'use client';

import { Button, Flex } from 'antd';
import type { SocialButtonsProps } from '../AuthUIProvider';

/** One full-width button per provider, its logo and name. */
export const DefaultSocialButtons = ({
  providers,
  onSelect,
  label,
  buttonLabel,
  disabled,
  className,
  style,
}: SocialButtonsProps) => (
  <Flex
    vertical
    gap={8}
    role="group"
    aria-label={label}
    className={className}
    style={{ width: '100%', ...style }}
  >
    {providers.map((provider) => (
      <Button
        key={provider.provider}
        block
        size="large"
        icon={provider.icon}
        aria-label={buttonLabel(provider)}
        disabled={disabled}
        onClick={() => onSelect(provider.provider)}
      >
        {provider.name}
      </Button>
    ))}
  </Flex>
);
