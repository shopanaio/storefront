'use client';

import { Button } from 'antd';
import { useTranslations } from 'next-intl';
import { AuthModal } from '@src/components/Auth/AuthModal';
import { useModalStore } from '@src/store/appStore';

export interface CheckoutAuthProps {
  /** Optional className applied to the login button */
  className?: string;
}

/**
 * Renders a login button and mounts the authentication modal.
 * When the button is clicked, the modal becomes visible.
 */
export const CheckoutAuth = ({ className }: CheckoutAuthProps) => {
  const t = useTranslations('Checkout');
  const setIsAuthModalVisible = useModalStore((state) => state.setIsAuthModalVisible);

  return (
    <>
      <Button
        className={className}
        size="large"
        type="link"
        onClick={() => setIsAuthModalVisible(true)}
     >
        {t('log-in')}
      </Button>
      <AuthModal />
    </>
  );
};

export default CheckoutAuth;
