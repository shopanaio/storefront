import type { Preview } from "@storybook/react";
import { App } from "antd";
import { ThemeProvider } from "antd-style";
import { GlobalStyle } from "@src/components/UI/Theme/GlobalStyle";
import { NextIntlClientProvider } from "next-intl";
import en from "@src/i18n/messages/en.json";
import "modern-normalize/modern-normalize.css";
import { WishlistProvider } from "@src/modules/wishlist";

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
            <WishlistProvider>
              <Story />
            </WishlistProvider>
          </App>
        </NextIntlClientProvider>
      </ThemeProvider>
    ),
  ],
};

export default preview;
