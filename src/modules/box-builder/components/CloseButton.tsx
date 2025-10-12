"use client";

import { Button } from "antd";
import { TbX } from "react-icons/tb";
import { useTranslations } from "next-intl";
import { useConfirm } from "@src/components/UI/Confirm/useConfirm";

interface CloseButtonProps {
  onConfirm?: () => void;
}

export const CloseButton: React.FC<CloseButtonProps> = ({ onConfirm }) => {
  const t = useTranslations("BoxBuilder");
  const confirm = useConfirm();

  const handleClick = async () => {
    const ok = await confirm({
      icon: null,
      title: t("exit-confirm.title"),
      content: t("exit-confirm.content"),
      okText: t("exit-confirm.leave"),
      cancelText: t("exit-confirm.stay"),
    });
    if (ok) onConfirm?.();
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
