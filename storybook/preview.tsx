import type { Preview } from "@storybook/react";
import { App } from "antd";
import { ThemeProvider } from "antd-style";
import { GlobalStyle } from "@src/components/Theme/GlobalStyle";
import { NextIntlClientProvider } from "next-intl";
import en from "@src/messages/en.json";
import "modern-normalize/modern-normalize.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#141414" },
      ],
    },
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider
        themeMode="light"
        prefixCls="ant"
        theme={{ cssVar: { prefix: "ant" }, hashed: false }}
      >
        <NextIntlClientProvider
          locale="en"
          messages={en as Record<string, unknown>}
        >
          <App>
            <GlobalStyle />
            <Story />
          </App>
        </NextIntlClientProvider>
      </ThemeProvider>
    ),
  ],
};

export default preview;
