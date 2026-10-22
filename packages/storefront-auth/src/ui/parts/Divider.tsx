'use client';

import { Divider } from 'antd';
import type { DividerProps } from '../AuthUIProvider';

/** "or" between the code form and the social buttons. */
export const DefaultDivider = ({ label, className, style }: DividerProps) => (
  <Divider plain className={className} style={{ margin: 0, ...style }}>
    {label}
  </Divider>
);
