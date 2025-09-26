"use client";

import { App, Button } from "antd";
import { TbX } from "react-icons/tb";
import { useTranslations } from "next-intl";

interface CloseButtonProps {
  onConfirm?: () => void;
}

export const CloseButton: React.FC<CloseButtonProps> = ({ onConfirm }) => {
  const { modal } = App.useApp();
  const t = useTranslations("BoxBuilder");

  const handleClick = () => {
    modal.confirm({
      icon: null,
      title: t("exit-confirm.title"),
      content: t("exit-confirm.content"),
      okText: t("exit-confirm.leave"),
      cancelText: t("exit-confirm.stay"),
      onOk: () => {
        onConfirm?.();
      },
    });
  };

  return (
    <Button
      variant="text"
      color="default"
      size="large"
      icon={<TbX size={24} />}
      onClick={handleClick}
    />
  );
};
