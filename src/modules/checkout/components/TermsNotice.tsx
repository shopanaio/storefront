"use client";

import { Button, Typography } from "antd";
import { useTranslations } from "next-intl";

const { Text } = Typography;

/**
 * Renders a notice with Terms of Service and Privacy Policy links
 * to be displayed near the submit action on the checkout page.
 */
export interface TermsNoticeProps {
  /**
   * Optional class name applied to link-styled buttons to match
   * the surrounding page typography or underline styles.
   */
  linkClassName?: string;
}

export const TermsNotice = ({ linkClassName }: TermsNoticeProps) => {
  const t = useTranslations("Checkout");

  return (
    <Text>
      {t("confirm-note")} {" "}
      <Button className={linkClassName} type="link">
        {t("terms-service")}
      </Button>{" "}
      {t("and")} {" "}
      <Button className={linkClassName} type="link">
        {t("privacy-notice")}
      </Button>
    </Text>
  );
};

export default TermsNotice;
