import { Badge as AntdBadge, theme } from 'antd';
import type { BadgeProps as AntdBadgeProps } from 'antd';

export interface BadgeProps extends AntdBadgeProps {
  variant?: 'primary' | 'default';
}

export function Badge({ variant = 'default', color, ...props }: BadgeProps) {
  const { token } = theme.useToken();
  return (
    <AntdBadge
      color={variant === 'primary' ? token.colorPrimary : color}
      {...props}
    />
  );
}
