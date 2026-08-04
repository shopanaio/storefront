import React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { CircleUserRound, User } from 'lucide-react';
import { HeaderLinkButton } from './HeaderLinkButton';
import { useSessionStore } from '@shopana/storefront-sdk/modules/session/react';
import { useModalStore } from '@src/store/appStore';
import { useRoutes } from '@src/hooks/useRoutes';
import type { HeaderTextBreakpoint } from './HeaderSection.types';

type AccountButtonProps = {
  className?: string;
  iconSize?: number;
  iconColor?: string;
  showTextFrom?: HeaderTextBreakpoint;
};

export const AccountButton: React.FC<AccountButtonProps> = ({
  className,
  iconSize = 24,
  iconColor = 'currentColor',
  showTextFrom = 'md',
}) => {
  const t = useTranslations('Header');
  const router = useRouter();
  const routes = useRoutes();
  const session = useSessionStore()((state) => state.session);
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
          <CircleUserRound size={iconSize} color={iconColor} />
        ) : (
          <User size={iconSize} color={iconColor} />
        )
      }
      topText={isAuthenticated ? t('my-account') : t('sign-in')}
      bottomText={t('account')}
      className={className}
      onClick={onClick}
      showTextFrom={showTextFrom}
    />
  );
};
