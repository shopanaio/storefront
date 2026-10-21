'use client';

import { Flex } from 'antd';
import { CheckoutBanner } from '#checkout/ui/banner/CheckoutBanner';
import { SectionId } from '#checkout/state/interface';
import { resetReasonMessageKey } from '#checkout/state/banners/messages';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { ProviderRenderer } from '#checkout/infra/ProviderRenderer';
import { MethodPanelsSkeleton } from '#checkout/components/common/MethodPanelsSkeleton';
import { LoadingBoundary } from '#checkout/ui/LoadingBoundary';
import { useState, useCallback, useRef } from 'react';
import type { PaymentFormData, PaymentMethod } from '../types';
import { ProviderMethod, ProviderModuleType } from '#checkout/vendors/types';
import { useCheckoutApi } from '#checkout/context/CheckoutApiContext';

/**
 * View component for the payment section.
 *
 * Renders payment methods in API order, each through the UI module of its
 * provider; a method without a module is hidden (see ProviderRenderer).
 * Shows the picked method at once while its save is on the way.
 */
export interface PaymentSectionViewProps {
  /** Current form data */
  data: PaymentFormData | null;
}

export const PaymentSectionView = ({ data }: PaymentSectionViewProps) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const { paymentMethods = [], selectedPaymentMethod, resetReason } = data ?? {};
  const { selectPaymentMethod } = useCheckoutApi();

  /**
   * The method the buyer picked while its save is on the way. Answers to other changes of
   * the checkout do not move the switch meanwhile (BR-wxuh).
   */
  const [picked, setPicked] = useState<PaymentMethod | null>(null);
  const confirmedHandle = selectedPaymentMethod?.handle ?? null;
  const localSelectedMethod =
    picked ??
    paymentMethods.find((method) => method.handle === confirmedHandle) ??
    selectedPaymentMethod ??
    null;

  /** The pick whose save is the latest; an older save settling does not clear a newer pick. */
  const latestPick = useRef(0);

  /**
   * Saves the picked method. On failure the switch goes back to the method the server
   * confirmed last, as the checkout shows it now, not as it was when the buyer clicked.
   */
  const handleSelectMethod = useCallback(
    async (selected: ProviderMethod) => {
      const method = paymentMethods.find((m) => m.handle === selected.handle);
      if (!method) {
        return;
      }

      const pick = (latestPick.current += 1);
      setPicked(method);
      try {
        await selectPaymentMethod({
          methodHandle: method.handle,
          customerInput: selected.data as object | undefined,
        });
      } catch (error) {
        console.error('Failed to select payment method:', error);
      } finally {
        if (latestPick.current === pick) {
          setPicked(null);
        }
      }
    },
    [selectPaymentMethod, paymentMethods]
  );

  return (
    <Flex vertical gap={12} className={styles.container}>
      {resetReason && !localSelectedMethod && (
        <CheckoutBanner
          tone="action"
          title={t(resetReasonMessageKey(resetReason, SectionId.Payment))}
          description={t('payment-selection-reset')}
        />
      )}
      {paymentMethods.map((method) => (
        // Each method loads on its own: a new one (cash on delivery after a Nova Poshta
        // delivery) does not hide the methods already shown.
        <LoadingBoundary
          key={method.handle}
          fallback={<MethodPanelsSkeleton count={1} />}
        >
          <ProviderRenderer
            moduleType={ProviderModuleType.Payment}
            provider={method.provider}
            availableMethods={[method]}
            selectedMethod={localSelectedMethod}
            onSelectMethod={handleSelectMethod}
          />
        </LoadingBoundary>
      ))}
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default PaymentSectionView;
