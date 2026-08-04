import React, { useCallback } from 'react';
import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { HeaderLinkButton } from './HeaderLinkButton';
import { useWishlistCounts } from '@src/modules/wishlist';
import { useRouter } from 'next/navigation';
import { useRoutes } from '@src/hooks/useRoutes';

type WishlistButtonProps = {
  badgeCount?: number | null;
  className?: string;
  onClick?: () => void;
  iconSize?: number;
  showTextOnDesktop?: boolean;
};

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  badgeCount,
  className,
  onClick,
  iconSize = 24,
  showTextOnDesktop = true,
}) => {
  const t = useTranslations('Header');
  const router = useRouter();
  const routes = useRoutes();
  const { totalItems } = useWishlistCounts();
  const resolvedBadgeCount = badgeCount ?? totalItems ?? undefined;

  const handleClick = useCallback(() => {
    onClick?.();
    router.push(routes.wishlist.path());
  }, [onClick, router, routes]);

  return (
    <HeaderLinkButton
      icon={<Heart size={iconSize} />}
      topText={t('my-items')}
      bottomText={t('wishlist')}
      badgeCount={resolvedBadgeCount}
      className={className}
      onClick={handleClick}
      showTextOnDesktop={showTextOnDesktop}
      badgeColor="var(--header-badge-background)"
    />
  );
};
