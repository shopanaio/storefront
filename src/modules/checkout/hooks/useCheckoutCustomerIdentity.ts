import { useCheckoutData } from '@src/modules/checkout/context/CheckoutDataContext';
import { useMemo } from 'react';

export interface CheckoutCustomerIdentity {
  firstName: string;
  lastName: string;
  middleName: string;
  phone: string;
  email: string;
}

/**
 * Returns normalized customer identity from checkout cart if available.
 */
export function useCheckoutCustomerIdentity(): CheckoutCustomerIdentity | null {
  const { cart } = useCheckoutData();

  return useMemo(() => {
    const identity = (cart as unknown as { customerIdentity?: Partial<CheckoutCustomerIdentity> | null } | null)?.customerIdentity;
    if (!identity) return null;
    return {
      firstName: identity.firstName ?? '',
      lastName: identity.lastName ?? '',
      middleName: identity.middleName ?? '',
      phone: identity.phone ?? '',
      email: identity.email ?? '',
    };
  }, [cart]);
}
