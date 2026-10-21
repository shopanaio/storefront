import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { MockedProvider } from '@apollo/client/testing/react';
import '#checkout/vendors/liqpay/register';
import '#checkout/vendors/nova-poshta/register';
import {
  ProviderMethod,
  ProviderModuleApi,
  ProviderModuleType,
} from '#checkout/vendors/types';
import { registerModule } from '@shopana/storefront-sdk/registry';
import { act } from 'react';
import { LoadingBoundary } from '#checkout/ui/LoadingBoundary';
import { ProviderRenderer } from './ProviderRenderer';
import { loadMessages, loadModule } from './loadCache';

/**
 * Loads a provider module and its messages, as the checkout preloads them: the renderer then
 * reads them at once instead of suspending (a suspended test render is not retried outside act).
 */
const preload = async (type: ProviderModuleType, provider: string) => {
  const api = await loadModule<ProviderModuleApi>(type, provider);
  if (api?.messages) {
    await loadMessages(api.messages.scope, 'uk', api.messages.load);
  }
};

beforeAll(async () => {
  await Promise.all([
    preload(ProviderModuleType.Payment, 'liqpay'),
    preload(ProviderModuleType.Payment, 'nova-poshta'),
    preload(ProviderModuleType.Delivery, 'nova-poshta'),
  ]);
});

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

const SETTLEMENT = 'e718a680-4b33-11e4-ab6d-005056801329';

/** The Nova Poshta contract: one `oneOf` branch per receiving type. */
const npContract = (types = ['WAREHOUSE', 'POSTOMAT', 'DOOR']) => ({
  schema: {
    oneOf: types.map((type) => ({
      type: 'object',
      properties: { type: { const: type } },
    })),
  },
});

const deliveryOption = (
  handle: string,
  code: string,
  provider: string,
  customerInputContract: unknown
): ProviderMethod => ({
  handle,
  code,
  provider,
  data: undefined,
  title: code,
  customerInputContract,
});

const deliveryAddress = (address1: string | null = null) => ({
  addressId: 'a1',
  countryCode: 'UA',
  address1,
  address2: null,
  postalCode: null,
  provinceCode: null,
  city: 'Київ',
  data: { carriers: { 'nova-poshta': { settlementRef: SETTLEMENT } } },
});

const deliveryRenderer = (
  provider: string,
  methods: ProviderMethod[],
  address = deliveryAddress(),
  selectedMethod: ProviderMethod | null = null
) => (
  <MockedProvider mocks={[]}>
    <NextIntlClientProvider locale="uk" messages={{}} onError={() => {}}>
      <ProviderRenderer
        moduleType={ProviderModuleType.Delivery}
        provider={provider}
        availableMethods={methods}
        selectedMethod={selectedMethod}
        onUpdateMethodData={() => {}}
        deliveryAddress={address}
      />
    </NextIntlClientProvider>
  </MockedProvider>
);

const renderDelivery = (provider: string, methods: ProviderMethod[]) =>
  render(deliveryRenderer(provider, methods));

describe('ProviderRenderer (delivery)', () => {
  it('renders each Nova Poshta service with the form of its receiving type', async () => {
    renderDelivery('nova-poshta', [
      deliveryOption('h1', 'warehouse', 'nova-poshta', npContract()),
      deliveryOption('h2', 'postomat', 'nova-poshta', npContract()),
      deliveryOption('h3', 'doors', 'nova-poshta', npContract()),
    ]);

    expect(await screen.findByText('Відділення Нової Пошти')).toBeTruthy();
    expect(screen.getByText('Поштомат Нової Пошти')).toBeTruthy();
    expect(screen.getByText("Кур'єр Нової Пошти")).toBeTruthy();
  });

  it('hides a service whose contract has no branch for its receiving type', async () => {
    renderDelivery('nova-poshta', [
      deliveryOption('h1', 'warehouse', 'nova-poshta', npContract(['WAREHOUSE'])),
      deliveryOption('h2', 'postomat', 'nova-poshta', npContract(['WAREHOUSE'])),
    ]);

    expect(await screen.findByText('Відділення Нової Пошти')).toBeTruthy();
    expect(screen.queryByText('Поштомат Нової Пошти')).toBeNull();
  });

  it('renders another carrier through the generic form of its contract', async () => {
    renderDelivery('test-fedex', [
      deliveryOption('h-fx', 'FEDEX_GROUND', 'test-fedex', {
        schema: {
          type: 'object',
          properties: {
            pickupPointId: { type: 'string', maxLength: 128 },
            deliveryInstructions: { type: 'string', maxLength: 500 },
          },
          additionalProperties: false,
        },
      }),
    ]);

    expect(await screen.findByText('FEDEX_GROUND')).toBeTruthy();
    expect(screen.getByText('Pickup point id')).toBeTruthy();
    expect(screen.getByText('Delivery instructions')).toBeTruthy();
  });

  it('tells the customer when the generic form cannot take the input', async () => {
    renderDelivery('test-ups', [
      deliveryOption('h-ups', 'UPS_STANDARD', 'test-ups', {
        schema: {
          type: 'object',
          required: ['parcels'],
          properties: { parcels: { type: 'array', items: { type: 'string' } } },
        },
      }),
    ]);

    expect(await screen.findByText('UPS_STANDARD')).toBeTruthy();
    expect(screen.getByText('Checkout.delivery-form-unsupported')).toBeTruthy();
  });

  it('SC-u1rm: the generic form keeps what was typed when the address changes elsewhere', async () => {
    const fedex = deliveryOption('h-fx', 'FEDEX_GROUND', 'test-fedex', {
      schema: {
        type: 'object',
        properties: { deliveryInstructions: { type: 'string', maxLength: 500 } },
        additionalProperties: false,
      },
    });
    const { rerender } = render(deliveryRenderer('test-fedex', [fedex], deliveryAddress(), fedex));
    await screen.findByText('Delivery instructions');
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Ring twice' } });

    rerender(deliveryRenderer('test-fedex', [fedex], deliveryAddress('Main st 1'), fedex));

    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('Ring twice');
  });
});

describe('ProviderRenderer (a module that fails to load)', () => {
  it('says the part failed and loads it again on "Retry"', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    let attempts = 0;
    registerModule({
      type: ProviderModuleType.Payment,
      slug: 'test-flaky',
      loader: async () => {
        attempts += 1;
        if (attempts === 1) throw new Error('ChunkLoadError');
        return {
          provider: 'test-flaky',
          moduleType: ProviderModuleType.Payment,
          Component: ({ availableMethods }: { availableMethods: ProviderMethod[] }) => (
            <span>{availableMethods.map((item) => item.title).join()}</span>
          ),
          config: {
            logo: () => null,
            methods: [{ code: 'card', Component: () => null }],
          },
        };
      },
    });

    await act(async () => {
      render(
        <NextIntlClientProvider
          locale="en"
          messages={{ Checkout: { 'load-failed': 'Failed to load', 'banner-retry': 'Retry' } }}
          onError={() => {}}
        >
          <LoadingBoundary fallback={<span>Loading</span>}>
            <ProviderRenderer
              moduleType={ProviderModuleType.Payment}
              provider="test-flaky"
              availableMethods={[{ ...method('h-card', 'card', 'test-flaky'), title: 'Card' }]}
              selectedMethod={null}
            />
          </LoadingBoundary>
        </NextIntlClientProvider>
      );
    });
    expect(await screen.findByText('Failed to load')).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    });
    expect(await screen.findByText('Card')).toBeTruthy();
    expect(attempts).toBe(2);
  });
});
