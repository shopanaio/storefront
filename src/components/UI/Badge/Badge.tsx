import React from 'react';
import { Badge as AntdBadge, BadgeProps as AntdBadgeProps } from 'antd';
import useToken from 'antd/es/theme/useToken';

export interface BadgeProps extends AntdBadgeProps {
  /**
   * Color variant for the badge
   * - 'primary': Uses theme's primary color
   * - Other standard antd badge colors
   */
  variant?: 'primary' | 'default';
}

/**
 * Badge component wrapper around antd Badge with custom color handling
 *
 * @example
 * ```tsx
 * <Badge variant="primary" count={5}>
 *   <Button>Messages</Button>
 * </Badge>
 * ```
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  color,
  ...props
}) => {
  const [, token] = useToken();

  // If variant is 'primary', use the primary color from theme
  const badgeColor = variant === 'primary' ? token.colorPrimary : color;

  return <AntdBadge color={badgeColor} {...props} />;
};
