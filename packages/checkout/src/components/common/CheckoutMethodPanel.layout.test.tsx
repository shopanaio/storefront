import '@testing-library/jest-dom/vitest';
import { cleanup, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import CheckoutLayout from '../CheckoutLayout';
import { CheckoutMethodPanel } from './CheckoutMethodPanel';

afterEach(cleanup);

it('retains checkout method spacing when the storefront removes collapse padding', () => {
  const { container } = render(
    <ConfigProvider theme={{ components: { Collapse: { headerPadding: 0 } } }}>
      <CheckoutLayout>
        <CheckoutMethodPanel
          title="Delivery"
          description={null}
          isActive={false}
          onActive={() => {}}
          component={null}
        />
      </CheckoutLayout>
    </ConfigProvider>
  );
  // Ant Design 6 exposes component sizes through scoped CSS variables.
  const css = Array.from(document.querySelectorAll('style'))
    .map((style) => style.textContent)
    .join('');
  expect(css).toContain('--ant-collapse-header-padding:12px 16px');
  expect(container.querySelector('main .ant-collapse')).toBeInTheDocument();
});
