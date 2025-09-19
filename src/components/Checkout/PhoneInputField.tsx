import { Flex } from "antd";
import { createStyles } from "antd-style";
import { Controller } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface PhoneInputFieldProps {
  control: any;
  name: string;
  label?: string;
  placeholder?: string;
}

export const PhoneInputField = ({
  control,
  name,
  label,
  placeholder,
}: PhoneInputFieldProps) => {
  const { styles } = useStyles();

  return (
    <Flex vertical gap={8}>
      {label && <label htmlFor={name}>{label}</label>}

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <PhoneInput
            {...field}
            id={name}
            international
            defaultCountry="UA"
            countryCallingCodeEditable={false}
            placeholder={placeholder}
            className={styles.phoneInput}
          />
        )}
      />
    </Flex>
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
      transition: border-color 0.3s, box-shadow 0.3s;
      height: 40px;
      
    }

    .PhoneInputInput:focus {
      border-color: ${token.colorPrimary};
      box-shadow: 0 0 0 2px ${token.colorPrimaryHover}33;
      outline: none;
    }
  `,
}));
