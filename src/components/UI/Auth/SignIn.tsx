import React from "react";
import { Controller } from "react-hook-form";
import {
  Flex,
  Divider,
  Button,
  Input,
  Typography,
  Checkbox,
  Alert,
} from "antd";
import { createStyles } from "antd-style";
import { TbUser, TbBrandGoogleFilled } from "react-icons/tb";
import PasswordInput from "@src/components/Auth/PasswordInput";
import type { Control, FieldErrors } from "react-hook-form";

const { Text } = Typography;

interface SignInFormData {
  email: string;
  password: string;
}

interface SignInProps {
  onSwitchForm: (form: "signUp" | "forgotPassword") => void;
  control: Control<SignInFormData>;
  errors: FieldErrors<SignInFormData>;
  error: string | null;
  isInFlight: boolean;
  onSubmit: (e: React.FormEvent) => void;
  t: (key: string) => string;
}

export const SignIn: React.FC<SignInProps> = ({
  onSwitchForm,
  control,
  errors,
  error,
  isInFlight,
  onSubmit,
  t,
}) => {
  const { styles } = useStyles();

  return (
    <>
      <Text className={styles.modalTitle}>{t("sign-in")}</Text>
      <Button
        className={styles.googleBtn}
        size="large"
        icon={<TbBrandGoogleFilled size={16} />}
      >
        {t("continue-with-google")}
      </Button>
      <Divider className={styles.orDivider} orientation="center">
        {t("or-divider")}
      </Divider>
      <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles.inputWrapper}>
          <Controller
            name="email"
            control={control}
            rules={{ required: t("email-required") }}
            render={({ field }) => (
              <Input
                {...field}
                size="large"
                placeholder={t("email")}
                prefix={<TbUser className={styles.inputUserIcon} size={18} />}
                status={errors.email ? "error" : ""}
              />
            )}
          />
          {errors.email && <Text type="danger">{errors.email.message}</Text>}
        </div>

        <div className={styles.inputWrapper}>
          <Controller
            name="password"
            control={control}
            rules={{ required: t("password-required") }}
            render={({ field }) => (
              <PasswordInput
                value={field.value}
                placeholder={t("password")}
                onChange={field.onChange}
                eyeBtn={true}
                status={errors.password ? "error" : ""}
              />
            )}
          />
          {errors.password && (
            <Text type="danger">{errors.password.message}</Text>
          )}
        </div>

        <Flex className={styles.rememberWrapper}>
          <Checkbox>{t("remember-me")}</Checkbox>
          <Button
            className={styles.forgotPasswordBtn}
            variant="link"
            color="primary"
            onClick={() => onSwitchForm("forgotPassword")}
          >
            {t("forgot-link")}
          </Button>
        </Flex>

        {error && (
          <Alert
            className={styles.styledAlert}
            message={error}
            type="error"
            showIcon
            closable
          />
        )}

        <Button
          className={styles.submitBtn}
          type="primary"
          size="large"
          htmlType="submit"
          loading={isInFlight}
        >
          {t("sign-in")}
        </Button>
      </form>

      <Flex className={styles.modalFooter}>
        <Text>{t("don't-account")}</Text>
        <Button
          className={styles.modalFooterBtn}
          variant="link"
          color="primary"
          onClick={() => onSwitchForm("signUp")}
        >
          {t("sign-up")}
        </Button>
      </Flex>
    </>
  );
};

// ... existing code ...
const useStyles = createStyles(({ token, css }) => {
  return {
    modalTitle: css`
      font-weight: var(--font-weight-700);
      font-size: ${token.fontSizeHeading3}px;
      text-align: center;
      margin-bottom: var(--spacing-9);
    `,
    googleBtn: css`
      font-size: ${token.fontSizeLG}px;
      margin-bottom: ${token.marginSM}px;
    `,
    orDivider: css`
      margin-top: 0 !important;
      margin-bottom: ${token.marginSM}px;
      color: ${token.colorTextPlaceholder} !important;
    `,
    form: css`
      margin-bottom: ${token.marginXL * 2}px;
    `,
    inputWrapper: css`
      margin-bottom: ${token.margin}px;
    `,
    inputUserIcon: css`
      color: var(--ant-color-text-placeholder);
    `,
    rememberWrapper: css`
      justify-content: space-between;
      align-items: center;
      margin-bottom: ${token.marginSM}px;
    `,
    forgotPasswordBtn: css`
      padding: 0;
      height: auto;
    `,
    styledAlert: css`
      margin-bottom: ${token.marginSM}px;
    `,
    submitBtn: css`
      width: 100%;
    `,
    modalFooter: css`
      justify-content: center;
      align-items: center;
      gap: ${token.marginXS}px;
    `,
    modalFooterBtn: css`
      padding: 0;
    `,
  };
});
