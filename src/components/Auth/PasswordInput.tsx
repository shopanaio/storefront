import React, { useState } from "react";
import { Input, Button } from "antd";
import { TbLock, TbEye, TbEyeClosed } from "react-icons/tb";
import { createStyles } from "antd-style";

interface PasswordInputProps {
  value: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  eyeBtn: boolean;
  status?: "" | "error";
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  placeholder,
  onChange,
  eyeBtn,
  status,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { styles } = useStyles();

  return (
    <Input
      className={styles.styledPasswordInput}
      placeholder={placeholder}
      prefix={<TbLock className={styles.styledPasswordInput} size={20} />}
      type={isPasswordVisible ? "text" : "password"}
      value={value}
      onChange={onChange}
      status={status}
      suffix={
        eyeBtn ? (
          <Button
            className={styles.inputEyeBtn}
            onClick={() => setIsPasswordVisible((prev) => !prev)}
          >
            {isPasswordVisible ? (
              <TbEyeClosed size={20} />
            ) : (
              <TbEye size={20} />
            )}
          </Button>
        ) : null
      }
    />
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    styledPasswordInput: css`
      height: 40px;
    `,
    inputIcon: css`
      color: var(--ant-color-text-placeholder);
    `,
    inputEyeBtn: css`
      display: flex;
      align-items: center;
      justify-content: center;

      padding: 0 ${token.paddingXXS}px;
      background-color: transparent;
      border: 0;
      color: ${token.colorTextPlaceholder};
    `,
  };
});
export default PasswordInput;
