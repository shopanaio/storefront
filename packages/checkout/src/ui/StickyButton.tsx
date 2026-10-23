'use client';

import { Button } from 'antd';
import type { ButtonProps } from 'antd';

export type StickyButtonProps = ButtonProps;

export function StickyButton(props: StickyButtonProps) {
  return <Button type="primary" size="large" block {...props} />;
}
