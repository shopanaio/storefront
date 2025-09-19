"use client";

import "modern-normalize/modern-normalize.css";
import { GlobalStyle } from "@src/components/Theme/GlobalStyle";
import { App, notification } from "antd";
import { ThemeProvider } from "antd-style";
import { AntdRegistry } from "@src/components/Theme/AntdRegistry";
import { useEffect } from "react";
import { setNotificationApi } from "@src/components/UI/Toast/Toast";

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
          },
        }}
      >
        <App>
          <GlobalStyle />
          {contextHolder}
          {children}
        </App>
      </ThemeProvider>
    </AntdRegistry>
  );
};

declare module "antd-style" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface CustomToken {}
}
