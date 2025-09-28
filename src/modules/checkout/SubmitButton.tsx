"use client";

import { Button } from "antd";
import { useTranslations } from "next-intl";

export interface SubmitButtonProps {
  /**
   * Optional click handler. When used within a form with htmlType="submit",
   * form submission will be triggered regardless of this handler.
   */
  onClick?: () => void;
}

/**
 * Submit button for the checkout form. Uses large primary AntD button
 * and localized label from Checkout namespace.
 */
export const SubmitButton = ({ onClick }: SubmitButtonProps) => {
  const t = useTranslations("Checkout");

  return (
    <Button
      style={{ height: 48 }}
      type="primary"
      size="large"
      htmlType="submit"
      onClick={onClick}
    >
      {t("confirm-order")}
    </Button>
  );
};

export default SubmitButton;
