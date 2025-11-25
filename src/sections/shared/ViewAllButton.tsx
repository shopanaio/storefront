import { Button } from "antd";
import { TbArrowRight } from "react-icons/tb";
import React from "react";
import { useTranslations } from "next-intl";

interface ViewAllButtonProps {
  href: string;
}

export default function ViewAllButton({ href }: ViewAllButtonProps) {
  const t = useTranslations("Home");
  return (
    <Button href={href} icon={<TbArrowRight />} iconPosition="end">
      {t("view-all")}
    </Button>
  );
}
