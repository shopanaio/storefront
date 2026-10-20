'use client';

import type { IamApplicationClient } from '../../../core/IamApplicationClient';
import { useSessionContext } from '../../context/SessionContext';

/** The IAM session endpoints of the store; throws when the store has no customer accounts. */
export function useIamClient(): IamApplicationClient {
  const { iamClient } = useSessionContext();
  if (!iamClient) {
    throw new Error('Customer accounts are not configured for this storefront');
  }
  return iamClient;
}
