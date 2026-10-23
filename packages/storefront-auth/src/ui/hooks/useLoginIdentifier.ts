'use client';

import { useMemo } from 'react';
import { formatPhoneInternational } from '@shopana/storefront-ui';
import { useLoginMethod, useUser } from '../../react';

/** What the buyer signed in with. */
export interface LoginIdentifier {
  method: 'email' | 'phone';
  /** The email, or the phone in E.164. */
  value: string;
  /** As the buyer typed it: the email, or the phone in its international format. */
  display: string;
}

/**
 * The email or the phone the buyer signed in with, e.g. to keep it read-only in a form or to
 * show "Signed in as". Null for a guest, a hosted sign-in (no login method) or an account
 * without that identifier.
 */
export function useLoginIdentifier(): LoginIdentifier | null {
  const method = useLoginMethod();
  const user = useUser();
  const value =
    method === 'phone' ? user?.phone : method === 'email' ? user?.email : null;
  return useMemo(
    () =>
      method && value
        ? {
            method,
            value,
            display:
              method === 'phone' ? formatPhoneInternational(value) : value,
          }
        : null,
    [method, value]
  );
}
