import '@testing-library/jest-dom/vitest';
import { cleanup, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import { NextIntlClientProvider } from 'next-intl';
import { CheckoutProviders } from '../CheckoutProviders';
import { CheckoutMethodPanel } from './CheckoutMethodPanel';

afterEach(cleanup);

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

// The theme's app renders the checkout page without the module's layout: the spacing comes
// with the checkout's providers.
it('retains checkout method spacing when the storefront removes collapse padding', () => {
  const { container } = render(
    <ConfigProvider theme={{ components: { Collapse: { headerPadding: 0 } } }}>
      <NextIntlClientProvider locale="uk" messages={{}} onError={() => {}}>
        <CheckoutProviders>
          <CheckoutMethodPanel
            title="Delivery"
            description={null}
            isActive={false}
            onActive={() => {}}
            component={null}
          />
        </CheckoutProviders>
      </NextIntlClientProvider>
    </ConfigProvider>
  );
  // Ant Design 6 exposes component sizes through scoped CSS variables.
  const css = Array.from(document.querySelectorAll('style'))
    .map((style) => style.textContent)
    .join('');
  expect(css).toContain('--ant-collapse-header-padding:12px 16px');
  expect(container.querySelector('.ant-collapse')).toBeInTheDocument();
});
