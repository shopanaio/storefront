'use client';

import { Segmented } from 'antd';
import type { MethodTabsProps } from '../AuthUIProvider';

/** Phone | Email, when both codes are enabled. */
export const DefaultMethodTabs = ({
  value,
  onChange,
  items,
  label,
  disabled,
  className,
  style,
}: MethodTabsProps) => (
  <Segmented
    block
    size="large"
    aria-label={label}
    className={className}
    style={style}
    value={value}
    disabled={disabled}
    options={items.map((item) => ({ value: item.value, label: item.label }))}
    onChange={(next) => onChange(next as MethodTabsProps['value'])}
  />
);
