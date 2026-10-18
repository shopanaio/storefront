import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import { FloatingLabelInput } from './FloatingLabelInput';
import CheckoutLayout from '../components/CheckoutLayout';
import { CheckoutMethodPanel } from '../components/common/CheckoutMethodPanel';

afterEach(cleanup);

it('reserves space for the floating label and preserves field height while editing', () => {
  render(<FloatingLabelInput label="Email" />);
  const input = screen.getByLabelText('Email');
  expect(input).toHaveStyle({
    height: '50px',
    paddingTop: '12px',
    lineHeight: '1',
  });
  expect(input.closest('.ant-input-affix-wrapper')).toHaveStyle({
    height: '50px',
    paddingTop: '0',
    paddingBottom: '0',
  });
  const label = screen.getByText('Email');
  const initialClass = label.className;
  fireEvent.focus(input);
  expect(label.className).not.toBe(initialClass);
  fireEvent.change(input, { target: { value: 'buyer@example.com' } });
  fireEvent.blur(input);
  expect(label.className).not.toBe(initialClass);
});

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
