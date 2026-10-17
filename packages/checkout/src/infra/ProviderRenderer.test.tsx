import { render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import '#checkout/vendors/liqpay/register';
import '#checkout/vendors/novaposta/register';
import { ProviderMethod, ProviderModuleType } from '#checkout/vendors/types';
import { ProviderRenderer } from './ProviderRenderer';

const method = (
  handle: string,
  code: string,
  provider: string
): ProviderMethod => ({ handle, code, provider, data: undefined });

const renderPayment = (provider: string, methods: ProviderMethod[]) =>
  render(
    <NextIntlClientProvider locale="uk" messages={{}} onError={() => {}}>
      <ProviderRenderer
        moduleType={ProviderModuleType.Payment}
        provider={provider}
        availableMethods={methods}
        selectedMethod={null}
      />
    </NextIntlClientProvider>
  );

describe('ProviderRenderer (payment)', () => {
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders LiqPay through its module', async () => {
    renderPayment('liqpay', [method('h-liqpay', 'liqpay', 'liqpay')]);

    expect(await screen.findByText('Оплата карткою онлайн')).toBeTruthy();
  });

  it('renders Nova Poshta cash on delivery through its module', async () => {
    renderPayment('nova-poshta', [
      method('h-cod', 'nova-poshta-cod', 'nova-poshta'),
    ]);

    expect(await screen.findByText('Післяплата')).toBeTruthy();
  });

  it('hides a method whose provider has no module and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { container } = renderPayment('test-stripe', [
      method('h-card', 'card', 'test-stripe'),
    ]);

    await waitFor(() =>
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('no payment module is registered for provider "test-stripe"')
      )
    );
    expect(container.innerHTML).toBe('');
  });

  it('hides a method the provider module does not declare and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    renderPayment('liqpay', [
      method('h-liqpay', 'liqpay', 'liqpay'),
      method('h-qr', 'liqpay-qr', 'liqpay'),
    ]);

    expect(await screen.findByText('Оплата карткою онлайн')).toBeTruthy();
    await waitFor(() =>
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('payment module "liqpay" does not declare this method')
      )
    );
    expect(screen.getAllByRole('radio')).toHaveLength(1);
  });
});
