'use client';

import { useEffect, useMemo, useState } from 'react';
import { moduleRegistry } from '@shopana/storefront-sdk/registry';
import { ProviderModuleType } from '#checkout/vendors/types';
import type { PaymentSdkModuleApi } from '#checkout/vendors/types';
import { CLIENT_SDK_UNAVAILABLE_CODE } from '#checkout/state/placement/outcome';
import { usePlacementStore } from '#checkout/state/placement/placementStore';
import type { PlacementCustomerAction } from '#checkout/state/placement/types';

/**
 * Hands a `CLIENT_SDK` customer action to the module registered for its `sdk` (decision 1.10).
 * Without such a module the payment method is reported unavailable.
 */
export const PaymentSdkHost = ({
  action,
  onSettled,
}: {
  action: PlacementCustomerAction;
  onSettled: () => void;
}) => {
  const setPhase = usePlacementStore((state) => state.setPhase);
  const loader = useMemo(
    () =>
      action.sdk
        ? moduleRegistry.resolve<PaymentSdkModuleApi>(ProviderModuleType.PaymentSdk, action.sdk)
        : undefined,
    [action.sdk]
  );
  const [api, setApi] = useState<PaymentSdkModuleApi | null>(null);

  useEffect(() => {
    if (!loader) {
      setPhase({ name: 'rejected', code: CLIENT_SDK_UNAVAILABLE_CODE });
      return;
    }
    let cancelled = false;
    Promise.resolve(loader())
      .then((module) => {
        if (!cancelled) setApi(module);
      })
      .catch(() => {
        if (!cancelled) setPhase({ name: 'rejected', code: CLIENT_SDK_UNAVAILABLE_CODE });
      });
    return () => {
      cancelled = true;
    };
  }, [loader, setPhase]);

  if (!api) return null;
  const { Component } = api;
  return <Component action={action} onComplete={onSettled} onCancel={onSettled} />;
};
