import useToken from 'antd/es/theme/useToken';
import * as React from 'react';
import { TbCreditCard } from 'react-icons/tb';

export function BTLogo({ size = 20, ...props }: { size?: number }) {
  const [, token] = useToken();
  return <TbCreditCard color={token.colorPrimary} {...props} size={size} />;
}
