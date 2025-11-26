import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Typography, Alert } from "antd";
import PasswordInput from "@src/templates/auth/atoms/PasswordInput";
import { useTranslations } from "next-intl";
import { createStyles } from "antd-style";
import { useResetPasswordMutation } from "@src/hooks/useResetPasswordMutation";

const { Text } = Typography;

export const ResetPasswordForm: React.FC = () => {
  const [showMismatchError, setShowMismatchError] = useState(false);
  const [commit] = useResetPasswordMutation();
  const t = useTranslations("Auth");
  const { styles } = useStyles();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<{ password: string; confirmPassword: string }>({
    defaultValues: { password: "", confirmPassword: "" },
  });


  const onSubmit = (data: { password: string; confirmPassword: string }) => {
    if (data.password !== data.confirmPassword) {
      setShowMismatchError(true);
      return;
    }
    setShowMismatchError(false);
    commit({
      variables: {
        input: {
          email: data.email,
          token: data.token,
          password: data.password,
        },
      },
    });
  };

  return (
    <>
      <Text className={styles.modalTitle}>{t("create-new-pass")}</Text>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
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
                eyeBtn={false}
                status={errors.password ? "error" : ""}
              />
            )}
          />
          {errors.password && (
            <Text type="danger">{errors.password.message}</Text>
          )}
        </div>

        <div className={styles.inputWrapper}>
          <Controller
            name="confirmPassword"
            control={control}
            rules={{ required: t("confirm-required") }}
            render={({ field }) => (
              <PasswordInput
                value={field.value}
                placeholder={t("confirm-password")}
                onChange={field.onChange}
                eyeBtn={true}
                status={errors.confirmPassword ? "error" : ""}
              />
            )}
          />
          {errors.confirmPassword && (
            <Text type="danger">{errors.confirmPassword.message}</Text>
          )}
        </div>

        {showMismatchError && (
          <Alert
            className={styles.styledAlert}
            message={t("pass-not-match")}
            type="error"
            showIcon
            closable
            onClose={() => setShowMismatchError(false)}
          />
        )}

        <Button
          className={styles.submitBtn}
          type="primary"
          size="large"
          htmlType="submit"
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
    </>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    modalTitle: css`
      font-size: ${token.fontSizeHeading3}px;
      font-weight: var(--font-weight-700);
      text-align: center;
      margin-top: 0;
      margin-bottom: ${token.marginXL}px;
    `,
    form: css`
      display: flex;
      flex-direction: column;
    `,
    inputWrapper: css`
      margin-bottom: ${token.margin}px;
    `,
    styledAlert: css`
      margin-bottom: ${token.margin}px;
    `,
    submitBtn: css`
      width: 100%;
      font-size: ${token.fontSizeLG}px;
      margin-bottom: ${token.marginSM}px;
    `,
    privacyText: css`
      font-size: ${token.fontSizeSM}px;
      letter-spacing: 0%;
      margin-bottom: var(--spacing-20);
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
  };
});
