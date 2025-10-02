import { Flex, Input, InputRef } from 'antd';
import { createStyles } from 'antd-style';
import 'react-phone-number-input/style.css';
import PhoneInput, {
  Country,
} from 'react-phone-number-input/react-hook-form-input';
import {
  FloatingLabelInput,
  FloatingLabelInputProps,
} from '@src/components/UI/FloatingLabelInput';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

const InputWrapper = forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ placeholder, value, onChange, onFocus, onBlur, label }, ref) => {
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
      />
    );
  }
);

interface PhoneInputFieldProps extends FloatingLabelInputProps {
  control: any;
  name: string;
}

export const PhoneInputField = ({
  control,
  name,
  label,
  placeholder,
}: PhoneInputFieldProps) => {
  const [country] = useState<Country>('UA');

  return (
    <PhoneInput
      name={name}
      control={control}
      label={label}
      placeholder={placeholder}
      country={country}
      // international={false}
      international
      withCountryCallingCode
      inputComponent={InputWrapper}
      useNationalFormatForDefaultCountryValue={true}
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
