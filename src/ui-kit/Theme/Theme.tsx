'use client';

import 'modern-normalize/modern-normalize.css';
import 'nprogress/nprogress.css';
import { GlobalStyle } from '@src/ui-kit/Theme/GlobalStyle';
import { App, notification } from 'antd';
import { ThemeProvider } from 'antd-style';
import { AntdRegistry } from '@src/ui-kit/Theme/AntdRegistry';
import { useEffect } from 'react';
import { setNotificationApi } from '@src/ui-kit/Toast/Toast';
import { BrandProvider } from '@shopana/brand-sdk';
import { brandConfig } from '@src/brand.config';
import { theme } from 'antd';
import 'antd/dist/antd.css';

export const Theme = ({ children }: { children: React.ReactNode }) => {
  const [api, contextHolder] = notification.useNotification({
    maxCount: 2,
    stack: { threshold: 1 },
    placement: 'top',
    top: 16,
    duration: 2,
  });

  useEffect(() => {
    setNotificationApi(api);
  }, [api]);

  return (
    <AntdRegistry>
      <ThemeProvider
        theme={{
          cssVar: { prefix: 'ant' },
          zeroRuntime: true,
          hashed: false,
          token: {
            // eslint-disable-next-line @atlaskit/design-system/use-tokens-typography
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif;',
            ...(brandConfig.theme.colorPrimary && {
              colorPrimary: brandConfig.theme.colorPrimary,
            }),
          },
        }}
      >
        <App>
          <BrandProvider brandConfig={brandConfig}>
            <GlobalStyle />
            {contextHolder}
            {children}
          </BrandProvider>
        </App>
      </ThemeProvider>
    </AntdRegistry>
  );
};

declare module 'antd-style' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface CustomToken {}
}
