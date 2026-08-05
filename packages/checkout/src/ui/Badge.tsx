import { Badge as AntdBadge } from 'antd';
import type { BadgeProps as AntdBadgeProps } from 'antd';
import useToken from 'antd/es/theme/useToken';

export interface BadgeProps extends AntdBadgeProps {
  variant?: 'primary' | 'default';
}

export function Badge({ variant = 'default', color, ...props }: BadgeProps) {
  const [, token] = useToken();
  return (
    <AntdBadge
      color={variant === 'primary' ? token.colorPrimary : color}
      {...props}
    />
  );
}
