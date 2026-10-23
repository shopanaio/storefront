'use client';

import { Button } from 'antd';
import { useState } from 'react';
import { LuEye, LuEyeOff } from 'react-icons/lu';
import { useStorefrontUI } from './StorefrontUIProvider';
import {
  FloatingLabelInput,
  type FloatingLabelInputProps,
} from './FloatingLabelInput';

export interface FloatingLabelPasswordProps extends Omit<
  FloatingLabelInputProps,
  'type'
> {
  /**
   * Accessible names of the reveal button; the `showPassword` and `hidePassword` texts of
   * `StorefrontUIProvider`.
   */
  toggleLabels?: { show: string; hide: string };
}

/**
 * Password in the floating-label field, with a button that shows and hides it; a `suffix` of
 * its own goes before the button. The input keeps its `autoComplete`, so password managers fill
 * and save it as usual.
 */
export const FloatingLabelPassword = ({
  toggleLabels,
  suffix,
  ...inputProps
}: FloatingLabelPasswordProps) => {
  const { texts } = useStorefrontUI();
  const [visible, setVisible] = useState(false);
  const Icon = visible ? LuEyeOff : LuEye;
  const labels = toggleLabels ?? {
    show: texts.showPassword,
    hide: texts.hidePassword,
  };
  return (
    <FloatingLabelInput
      {...inputProps}
      type={visible ? 'text' : 'password'}
      suffix={
        <>
          {suffix}
          <Button
            type="text"
            size="small"
            icon={<Icon size={18} aria-hidden />}
            aria-label={visible ? labels.hide : labels.show}
            aria-pressed={visible}
            disabled={inputProps.disabled}
            // Keeps the focus in the field while the buyer reveals what they typed.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setVisible((value) => !value)}
          />
        </>
      }
    />
  );
};
