'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useSessionContext, useSessionStatus } from '../context/SessionContext';

export interface ClosedPageGuardProps {
  /** The home page the server computed for this request (`buildClosedPageRedirect`). */
  redirectTo: string;
  children: ReactNode;
}

/**
 * Browser side of a page closed to visitors without a session. The server already sent away a
 * request without one; this covers a session that is found missing in the browser — an expired
 * access token whose refresh is rejected, or a session ended in another tab.
 *
 * It leaves once, with `location.replace`: the closed page does not stay in the history for
 * the back button to return to it. A sign-out on this page is not followed: the sign-out
 * itself leaves for IAM end-session or its own address.
 */
export function ClosedPageGuard({ redirectTo, children }: ClosedPageGuardProps) {
  const { sessionClient } = useSessionContext();
  const status = useSessionStatus();
  const signedOut = useRef(false);
  const left = useRef(false);

  useEffect(
    () =>
      sessionClient.subscribe((change) => {
        if (change.type === 'signed-out') signedOut.current = true;
      }),
    [sessionClient]
  );

  useEffect(() => {
    if (status !== 'anonymous' || signedOut.current || left.current) return;
    left.current = true;
    window.location.replace(redirectTo);
  }, [redirectTo, status]);

  return children;
}
