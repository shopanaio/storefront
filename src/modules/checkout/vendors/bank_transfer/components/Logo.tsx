import * as React from 'react';
import { TbCreditCard } from 'react-icons/tb';

export function BTLogo({ size = 20, ...props }: { size?: number }) {
  return <TbCreditCard {...props} size={size} />;
}
