import React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { TbUserCircle, TbUser } from "react-icons/tb";
import { HeaderLinkButton } from "./HeaderLinkButton";
import { useSession as useSessionStore } from "@src/hooks/useSession";
import { useModalStore } from "@src/store/appStore";

type AccountButtonProps = {
  className?: string;
  iconSize?: number;
};

export const AccountButton: React.FC<AccountButtonProps> = ({
  className,
  iconSize = 24,
}) => {
  const t = useTranslations("Header");
  const router = useRouter();
  const locale = useLocale();
  const session = useSessionStore((state) => state.session);
  const setIsAuthModalVisible = useModalStore(
    (state) => state.setIsAuthModalVisible
  );

  const isAuthenticated = !!session?.user;

  const onClick = () => {
    if (isAuthenticated) {
      router.push(`/${locale}/profile/general`);
    } else {
      setIsAuthModalVisible(true);
    }
  };

  return (
    <HeaderLinkButton
      icon={
        isAuthenticated ? (
          <TbUserCircle size={iconSize} />
        ) : (
          <TbUser size={iconSize} />
        )
      }
      topText={isAuthenticated ? t("my-account") : t("sign-in")}
      bottomText={t("account")}
      className={className}
      onClick={onClick}
    />
  );
};
