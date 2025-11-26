import { InputRef } from 'antd';
import { createStyles } from 'antd-style';
import 'react-phone-number-input/style.css';
import PhoneInput, {
  Country,
  Props as PhoneInputProps,
} from 'react-phone-number-input/react-hook-form-input';
import {
  isValidPhoneNumber,
  isPossiblePhoneNumber,
} from 'react-phone-number-input';
import {
  FloatingLabelInput,
  FloatingLabelInputProps,
} from '@src/ui-kit/FloatingLabelInput';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useController } from 'react-hook-form';
import { PhoneCountrySelect } from './PhoneCountrySelect';

/**
 * Creates validation rules for phone number field using react-phone-number-input utilities
 * @param messages - Translation messages for validation errors
 * @returns Validation rules for react-hook-form
 */
export const createPhoneValidationRules = (messages: {
  required?: string;
  invalidFormat?: string;
  invalidLength?: string;
}) => ({
  required: messages.required || 'Phone number is required',
  validate: {
    possibleNumber: (value: string | undefined) => {
      if (!value) return true; // Let required rule handle empty values
      return (
        isPossiblePhoneNumber(value) ||
        messages.invalidLength ||
        'Phone number has invalid length'
      );
    },
    validNumber: (value: string | undefined) => {
      if (!value) return true; // Let required rule handle empty values
      return (
        isValidPhoneNumber(value) ||
        messages.invalidFormat ||
        'Phone number format is invalid'
      );
    },
  },
});

const InputWrapper = forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ placeholder, value, onChange, onFocus, onBlur, label, ...rest }, ref) => {
    const antRef = useRef<InputRef>(null);

    useImperativeHandle(ref, () => antRef.current?.input!, []);

    return (
      <FloatingLabelInput
        ref={antRef}
        label={label}
        placeholder={placeholder}
        value={value}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={onChange}
        {...rest}
      />
    );
  }
);

interface PhoneInputFieldProps
  extends Omit<PhoneInputProps<any, any>, 'inputComponent' | 'label'> {
  /**
   * Show country select dropdown. Default is true.
   */
  countrySelect?: boolean;
  /**
   * Label for the floating label input
   */
  label?: string;
  /**
   * Validation rules for react-hook-form
   */
  rules?: any;
  /**
   * Validation messages for custom error handling
   */
  validationMessages?: {
    required?: string;
    invalidFormat?: string;
    invalidLength?: string;
  };
  /**
   * Status for error display (from react-hook-form)
   */
  status?: 'error' | 'warning' | undefined;
  /**
   * Error message to display
   */
  error?: string;
}

export const PhoneInputField = ({
  control,
  name,
  label,
  countrySelect,
  country,
  rules,
  validationMessages,
  ...restProps
}: PhoneInputFieldProps) => {
  const countryFieldName = `${name}Country`;

  const { field: countryField } = useController<{
    [k: string]: Country | undefined;
  }>({
    name: countryFieldName,
    control,
  });

  // Merge custom rules with validation utilities
  const mergedRules = validationMessages
    ? { ...createPhoneValidationRules(validationMessages), ...rules }
    : rules;

  const addonBefore = countrySelect ? (
    <PhoneCountrySelect
      value={country}
      onChange={(country) => countryField.onChange(country)}
    />
  ) : undefined;

  return (
    <PhoneInput
      name={name}
      control={control}
      label={label || ''}
      country={country}
      inputComponent={InputWrapper}
      addonBefore={addonBefore}
      rules={mergedRules}
      {...restProps}
    />
  );
};
