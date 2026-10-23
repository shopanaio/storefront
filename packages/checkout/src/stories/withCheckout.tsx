import type { Decorator } from '@storybook/react-vite';
import { createStyles } from 'antd-style';
import type { ReactNode } from 'react';
import CheckoutLayout from '#checkout/components/CheckoutLayout';
import { CheckoutProviders } from '#checkout/components/CheckoutProviders';
import type { CheckoutThemeAdapter } from '#checkout/theme';
import { bannerToneDeclarations } from '@shopana/storefront-ui';
import { StoryCartDrawer, useOpenStoryCart } from './StoryCartDrawer';

/**
 * What the stories change in the checkout: the store has customer accounts, so the loyalty and
 * sign-in parts show, and a cart, opened from the header on a phone and from the summary on
 * desktop. Everything else is the checkout's own.
 */
const storyTheme: CheckoutThemeAdapter = {
  customerAccountsEnabled: true,
  CartDrawer: StoryCartDrawer,
  useOpenCart: useOpenStoryCart,
};

function CheckoutRoot({
  fullscreen,
  children,
}: {
  fullscreen: boolean;
  children: ReactNode;
}) {
  const { styles, cx } = useStyles();
  return (
    <div className={cx(styles.root, !fullscreen && styles.padded)}>
      {children}
    </div>
  );
}

/**
 * Renders a story the way the checkout page does: its messages, layout, theme and banner colors. A story
 * with the `fullscreen` layout (the page columns) gets no padding around it.
 */
// Any args: the decorator wraps stories of every component.
export const withCheckout: Decorator<any> = (Story, { parameters }) => (
  <CheckoutProviders theme={storyTheme}>
    <CheckoutLayout>
      <CheckoutRoot fullscreen={parameters.layout === 'fullscreen'}>
        <Story />
      </CheckoutRoot>
    </CheckoutLayout>
  </CheckoutProviders>
);

const useStyles = createStyles(({ css, token }) => ({
  root: css`
    font-size: ${token.fontSize}px;
    line-height: ${token.lineHeight};
    ${bannerToneDeclarations()}
  `,
  padded: css`
    padding: ${token.paddingLG}px;
  `,
}));
