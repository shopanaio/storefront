import React, { useCallback } from 'react';
import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { HeaderLinkButton } from './HeaderLinkButton';
import { useWishlistCounts } from '@src/modules/wishlist';
import { useRouter } from '@shopana/storefront/next/navigation';
import { useRoutes } from '@src/hooks/useRoutes';
import type { HeaderTextBreakpoint } from './HeaderSection.types';

type WishlistButtonProps = {
  badgeCount?: number | null;
  className?: string;
  onClick?: () => void;
  iconSize?: number;
  iconColor?: string;
  showTextFrom?: HeaderTextBreakpoint;
};

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  badgeCount,
  className,
  onClick,
  iconSize = 24,
  iconColor = 'currentColor',
  showTextFrom = 'md',
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
      icon={<Heart size={iconSize} color={iconColor} />}
      topText={t('my-items')}
      bottomText={t('wishlist')}
      badgeCount={resolvedBadgeCount}
      className={className}
      onClick={handleClick}
      showTextFrom={showTextFrom}
      badgeColor="var(--header-badge-background)"
    />
  );
};
