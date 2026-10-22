'use client';

import { Button } from 'antd';
import type { InputRef } from 'antd/es/input';
import { forwardRef, useState } from 'react';
import { LuEye, LuEyeOff } from 'react-icons/lu';
import {
  FloatingLabelInput,
  type FloatingLabelInputProps,
} from './FloatingLabelInput';

export interface FloatingLabelPasswordProps
  extends Omit<FloatingLabelInputProps, 'type' | 'suffix'> {
  /** Accessible names of the reveal button; English by default. */
  toggleLabels?: { show: string; hide: string };
}

/**
 * Password in the floating-label field, with a button that shows and hides it. The input keeps
 * its `autoComplete`, so password managers fill and save it as usual.
 */
export const FloatingLabelPassword = forwardRef<
  InputRef,
  FloatingLabelPasswordProps
>(
  (
    {
      toggleLabels = { show: 'Show password', hide: 'Hide password' },
      ...inputProps
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false);
    const Icon = visible ? LuEyeOff : LuEye;
    return (
      <FloatingLabelInput
        ref={ref}
        {...inputProps}
        type={visible ? 'text' : 'password'}
        suffix={
          <Button
            type="text"
            size="small"
            icon={<Icon size={18} aria-hidden />}
            aria-label={visible ? toggleLabels.hide : toggleLabels.show}
            aria-pressed={visible}
            disabled={inputProps.disabled}
            // Keeps the focus in the field while the buyer reveals what they typed.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setVisible((value) => !value)}
          />
        }
      />
    );
  }
);

FloatingLabelPassword.displayName = 'FloatingLabelPassword';
