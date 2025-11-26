import React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { TbUserCircle, TbUser } from "react-icons/tb";
import { HeaderLinkButton } from "./HeaderLinkButton";
import { useSession as useSessionStore } from "@src/hooks/useSession";
import { useModalStore } from "@src/store/appStore";
import { useRoutes } from "@src/hooks/useRoutes";

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
  const routes = useRoutes();
  const session = useSessionStore((state) => state.session);
  const setIsAuthModalVisible = useModalStore(
    (state) => state.setIsAuthModalVisible
  );

  const isAuthenticated = !!session?.user;

  const onClick = () => {
    if (isAuthenticated) {
      router.push(routes.profile.path('general'));
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
