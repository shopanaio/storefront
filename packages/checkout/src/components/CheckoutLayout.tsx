'use client';

import type { ReactNode } from 'react';

/** Checkout occupies the viewport without the storefront header and footer. */
export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return <main style={{ width: '100%', minHeight: '100dvh' }}>{children}</main>;
}
