import { InputRef } from 'antd';
import { createStyles } from 'antd-style';
import 'react-phone-number-input/style.css';
import PhoneInput, {
  Country,
  Props as PhoneInputProps,
} from 'react-phone-number-input/react-hook-form-input';
import {
  FloatingLabelInput,
  FloatingLabelInputProps,
} from '@src/components/UI/FloatingLabelInput';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useController } from 'react-hook-form';
import { PhoneCountrySelect } from './PhoneCountrySelect';

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
}

export const PhoneInputField = ({
  control,
  name,
  label,
  countrySelect,
  country,
  ...restProps
}: PhoneInputFieldProps) => {
  const countryFieldName = `${name}Country`;

  const { field: countryField } = useController<{
    [k: string]: Country | undefined;
  }>({
    name: countryFieldName,
    control,
  });

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
      {...restProps}
    />
  );
};

const useStyles = createStyles(({ css, token }) => ({
  phoneInput: css`
    .PhoneInput {
      display: flex;
      align-items: center;
      gap: ${token.marginXS}px;
    }

    .PhoneInputInput {
      width: 100%;
      padding: ${token.paddingXS}px ${token.paddingSM}px;
      font-size: ${token.fontSize}px;
      border: 1px solid ${token.colorBorder};
      border-radius: ${token.borderRadiusLG}px;
      transition:
        border-color 0.3s,
        box-shadow 0.3s;
      height: 40px;
    }

    .PhoneInputInput:focus {
      border-color: ${token.colorPrimary};
      box-shadow: 0 0 0 2px ${token.colorPrimaryHover}33;
      outline: none;
    }
  `,
}));
