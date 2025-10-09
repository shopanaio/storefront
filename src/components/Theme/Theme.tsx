"use client";

import "modern-normalize/modern-normalize.css";
import "nprogress/nprogress.css";
import { GlobalStyle } from "@src/components/Theme/GlobalStyle";
import { App, notification } from "antd";
import { ThemeProvider } from "antd-style";
import { AntdRegistry } from "@src/components/Theme/AntdRegistry";
import { useEffect } from "react";
import { setNotificationApi } from "@src/components/UI/Toast/Toast";
import { BrandProvider } from "@src/providers/brand-context";
import { brandConfig } from "@src/brand.config";

export const Theme = ({ children }: { children: React.ReactNode }) => {
  const [api, contextHolder] = notification.useNotification({
    maxCount: 2,
    stack: { threshold: 1 },
    placement: "top",
    top: 16,
    duration: 2,
  });

  useEffect(() => {
    setNotificationApi(api);
  }, [api]);

  return (
    <AntdRegistry>
      <ThemeProvider
        themeMode="auto"
        prefixCls="ant"
        theme={{
          cssVar: { prefix: "ant" },
          hashed: false,
          token: {
            // eslint-disable-next-line @atlaskit/design-system/use-tokens-typography
            fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif;",
            ...(brandConfig.theme.colorPrimary && {
              colorPrimary: brandConfig.theme.colorPrimary,
            }),
          },
        }}
      >
        <App>
          <BrandProvider>
            <GlobalStyle />
            {contextHolder}
            {children}
          </BrandProvider>
        </App>
      </ThemeProvider>
    </AntdRegistry>
  );
};

declare module "antd-style" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface CustomToken {}
}
