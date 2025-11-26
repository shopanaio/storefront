import React from "react";
import { Controller } from "react-hook-form";
import { Flex, Divider, Button, Input, Typography, Alert } from "antd";
import { TbUser, TbBrandGoogleFilled } from "react-icons/tb";
import PasswordInput from "@src/templates/auth/atoms/PasswordInput";
import { createStyles } from "antd-style";
import type { Control, FieldErrors } from "react-hook-form";

const { Text } = Typography;

interface SignUpFormData {
  email: string;
  password: string;
}

interface SignUpProps {
  onSwitchForm: (form: "signIn") => void;
  control: Control<SignUpFormData>;
  errors: FieldErrors<SignUpFormData>;
  error: string | null;
  isInFlight: boolean;
  onSubmit: (e: React.FormEvent) => void;
  t: (key: string) => string;
}

export const SignUp: React.FC<SignUpProps> = ({
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
      <Text className={styles.modalTitle}>{t("sign-up")}</Text>

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

      <form onSubmit={onSubmit}>
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
                prefix={<TbUser className={styles.inputIcon} size={18} />}
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
          {t("continue")}
        </Button>
      </form>

      <Text className={styles.privacyText}>
        {t("privacy-paragraph")}{" "}
        <Button className={styles.privacyLink} size="small" variant="link" color="primary">
          {t("terms-link")}
        </Button>{" "}
        {t("and")}{" "}
        <Button className={styles.privacyLink} size="small" variant="link" color="primary">
          {t("privacy-link")}
        </Button>
        .
      </Text>

      <Flex className={styles.modalFooter}>
        <Text>{t("have-account")}</Text>
        <Button
          className={styles.modalFooterBtn}
          variant="link"
          color="primary"
          onClick={() => onSwitchForm("signIn")}
        >
          {t("sign-in")}
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
    inputWrapper: css`
      margin-bottom: ${token.margin}px;
    `,
    inputIcon: css`
      color: ${token.colorTextPlaceholder};
    `,
    styledAlert: css`
      margin-bottom: ${token.marginSM}px;
    `,
    submitBtn: css`
      width: 100%;
      margin-bottom: ${token.marginSM}px;
    `,
    privacyText: css`
      font-size: ${token.fontSizeSM}px;
      margin-bottom: ${token.marginXL * 2}px;
    `,
    privacyLink: css`
      font-size: ${token.fontSizeSM}px;
      letter-spacing: 0%;
      color: ${token.colorPrimary};
      border: 0;
      box-shadow: none;
      padding: 0;
      text-decoration: underline;
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
