'use client';

import { ConfigProvider } from 'antd';
import type { ReactNode } from 'react';

/** Checkout occupies the viewport without the storefront header and footer. */
export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        components: {
          Collapse: {
            headerPadding: '12px 16px',
            contentPadding: '16px',
            borderlessContentPadding: '4px 16px 16px',
          },
        },
      }}
    >
      <main style={{ width: '100%', minHeight: '100dvh' }}>{children}</main>
    </ConfigProvider>
  );
}
