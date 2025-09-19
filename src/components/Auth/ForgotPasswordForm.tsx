import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Flex, Button, Input, Typography, Alert } from "antd";
import { TbUser, TbCircleKey } from "react-icons/tb";
import { useTranslations } from "next-intl";
import { createStyles } from "antd-style";
import useForgotPassword from "@src/hooks/auth/useForgorPassword";

const { Text } = Typography;

interface ForgotPasswordFormProps {
  onSwitchForm: (form: "signIn" | "resetPassword") => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSwitchForm,
}) => {
  const [commit, isInFlight] = useForgotPassword();
  const [error, setError] = React.useState<string | null>(null);

  const t = useTranslations("Auth");
  const { styles } = useStyles();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: { email: string }) => {
    try {
      setError(null);

      await commit({
        variables: {
          email: data.email,
        },
      });

      // If successful, switch to password reset form
      onSwitchForm("resetPassword");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <>
      <TbCircleKey className={styles.modalImg} size={52} />
      <Text className={styles.modalTitle}>{t("forgot-title")}</Text>

      <Text className={styles.underTitle}>{t("no-worries")}</Text>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
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
          disabled={isInFlight}
        >
          {t("continue")}
        </Button>
      </form>

      <Text className={styles.privacyText}>
        {t("privacy-paragraph")}{" "}
        <Button className={styles.privacyLink} size="small" type="link">
          {t("terms-link")}
        </Button>{" "}
        {t("and")}{" "}
        <Button className={styles.privacyLink} size="small" type="link">
          {t("privacy-link")}
        </Button>
        .
      </Text>

      <Flex className={styles.ModalFooter}>
        <Text>{t("have-account")}</Text>
        <Button
          className={styles.ModalFooterBtn}
          onClick={() => onSwitchForm("signIn")}
          type="link"
        >
          {t("sign-in")}
        </Button>
      </Flex>
    </>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    modalImg: css`
      display: block;
      margin-right: auto;
      margin-left: auto;
      margin-bottom: ${token.marginLG}px;
      color: ${token.colorPrimary};
    `,
    modalTitle: css`
      font-weight: var(--font-weight-700);
      font-size: ${token.fontSizeHeading3}px;
      text-align: center;
      margin-top: 0;
      margin-bottom: ${token.marginSM}px;
    `,
    underTitle: css`
      font-size: ${token.fontSize}px;
      text-align: center;
      margin-top: 0;
      margin-bottom: ${token.marginLG}px;
    `,

    form: css`
      display: flex;
      flex-direction: column;
    `,

    inputWrapper: css`
      margin-bottom: ${token.marginLG}px;
    `,

    inputUserIcon: css`
      color: ${token.colorTextPlaceholder};
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

    ModalFooter: css`
      justify-content: center;
      align-items: center;
      font-size: ${token.fontSize}px;
    `,

    ModalFooterBtn: css`
      color: ${token.colorPrimary};
      border: 0;
      box-shadow: none;
    `,
  };
});
