import type { Preview } from '@storybook/react-vite';
import { sb } from 'storybook/test';
import { App } from 'antd';
import { ThemeProvider } from 'antd-style';
import { NextIntlClientProvider } from 'next-intl';

// Checkout data comes from the API; stories set it with `mockCheckout` (checkout/src/stories).
// Spies keep the real hooks for stories that do not mock them.
sb.mock(import('../packages/checkout/src/context/CheckoutDataContext.tsx'), {
  spy: true,
});
sb.mock(import('../packages/checkout/src/context/CheckoutApiContext.tsx'), {
  spy: true,
});
sb.mock(import('../packages/checkout/src/hooks/useCheckoutAuth.ts'), {
  spy: true,
});
// Removing undeliverable lines goes through the cart, which the stories do not have.
sb.mock(import('../packages/checkout/src/hooks/useUndeliverableLines.ts'), {
  spy: true,
});
sb.mock(import('../packages/checkout/src/hooks/useDefaultCartCleanup.ts'), {
  spy: true,
});
sb.mock(
  import('../packages/checkout/src/hooks/useLoyaltyAccount/useLoyaltyAccount.ts'),
  {
    spy: true,
  }
);
// Store policies come from the storefront API; the policy modal reads them here.
sb.mock(import('../packages/checkout/src/hooks/useStorePolicy.ts'), {
  spy: true,
});
// The storefront session lives in the host app; the contact section reads whether the buyer
// is signed in from it.
sb.mock(
  import('../packages/shopana-storefront-sdk/src/modules/session/react/context/SessionContext.tsx'),
  { spy: true }
);

const preview: Preview = {
  globalTypes: {
    locale: {
      description: 'Locale',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'uk', title: 'Українська' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { locale: 'en' },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story, { globals }) => {
      const locale = (globals.locale as string) ?? 'en';
      return (
        <ThemeProvider themeMode="light">
          <NextIntlClientProvider
            locale={locale}
            // No host messages: each package brings its own, as it does in a theme.
            messages={{}}
            timeZone="Europe/Kyiv"
          >
            <App>
              <Story />
            </App>
          </NextIntlClientProvider>
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
