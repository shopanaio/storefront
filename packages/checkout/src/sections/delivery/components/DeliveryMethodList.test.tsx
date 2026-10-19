import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ProviderProps } from '#checkout/vendors/types';
import type { DeliveryGroup, DeliveryMethod } from '../types';
import { readCustomerInputs, useCustomerInputStore } from '../customerInputStorage';
import { DeliveryMethodList } from './DeliveryMethodList';

const api = vi.hoisted(() => ({
  selectDeliveryMethod: vi.fn(),
  updateShippingMethod: vi.fn(),
}));

vi.mock('#checkout/context/CheckoutApiContext', () => ({
  useCheckoutApi: () => api,
}));
vi.mock('#checkout/infra/ProviderRenderer', () => ({
  ProviderRenderer: ({ availableMethods, onSelectMethod }: ProviderProps) => (
    <>
      {availableMethods.map((method) => (
        <button key={method.handle} onClick={() => onSelectMethod?.(method)}>
          {`select ${method.handle}`}
        </button>
      ))}
    </>
  ),
}));
vi.mock('./ShipmentQuote', () => ({ ShipmentQuote: () => null }));

const contract = {
  schema: {
    type: 'object',
    required: ['warehouseRef'],
    properties: { warehouseRef: { type: 'string' } },
  },
};

const method = (
  handle: string,
  patch: Partial<DeliveryMethod> = {}
): DeliveryMethod => ({
  handle,
  code: 'warehouse',
  title: 'warehouse',
  provider: 'nova-poshta',
  carrierCode: 'nova-poshta',
  cost: { amount: 80, currencyCode: 'UAH' },
  paymentModel: 'MERCHANT_COLLECTED',
  estimatedMinDeliveryAt: null,
  estimatedMaxDeliveryAt: null,
  data: undefined,
  customerInputContract: contract,
  publicData: {},
  ...patch,
});

const group = (
  id: string,
  methods: DeliveryMethod[],
  selected: DeliveryMethod | null = null
): DeliveryGroup => ({
  id,
  replacesGroupIds: [],
  lines: [],
  deliveryMethods: methods,
  selectedDeliveryMethod: selected,
  address: null,
  resetReason: null,
  previousOptionHandle: null,
  savedInput: null,
});

const list = (groups: DeliveryGroup[]) => (
  <NextIntlClientProvider locale="uk" messages={{}} onError={() => {}}>
    <DeliveryMethodList groups={groups} methods={groups[0].deliveryMethods} address={null} />
  </NextIntlClientProvider>
);

const renderList = (groups: DeliveryGroup[]) => render(list(groups));

describe('DeliveryMethodList', () => {
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

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    api.selectDeliveryMethod.mockReset();
    api.updateShippingMethod.mockReset();
    window.localStorage.clear();
    useCustomerInputStore.setState({ groups: {} });
  });

  it('SC-wdj1: shows the shipment that was not saved and retries only that one', async () => {
    api.selectDeliveryMethod.mockImplementation(async ({ deliveryGroupId }) => {
      if (deliveryGroupId === 'g2' && api.selectDeliveryMethod.mock.calls.length === 2) {
        throw new Error('network');
      }
    });
    renderList([group('g1', [method('a1')]), group('g2', [method('b1')])]);

    fireEvent.click(screen.getByText('select a1'));

    expect(
      await screen.findByText('Checkout.delivery-shipments-not-saved')
    ).toBeTruthy();
    expect(api.selectDeliveryMethod.mock.calls.map(([input]) => input.deliveryGroupId)).toEqual([
      'g1',
      'g2',
    ]);

    fireEvent.click(screen.getByText('Checkout.retry'));

    await waitFor(() => expect(api.selectDeliveryMethod).toHaveBeenCalledTimes(3));
    expect(api.selectDeliveryMethod.mock.calls[2][0]).toMatchObject({
      deliveryGroupId: 'g2',
      optionHandle: 'b1',
    });
    await waitFor(() =>
      expect(screen.queryByText('Checkout.delivery-shipments-not-saved')).toBeNull()
    );
  });

  it('SC-wdj1: retries the shipment that was not saved after its id changed', async () => {
    api.selectDeliveryMethod.mockImplementation(async ({ deliveryGroupId }) => {
      if (deliveryGroupId === 'g2') {
        throw new Error('network');
      }
    });
    const view = renderList([group('g1', [method('a1')]), group('g2', [method('b1')])]);

    fireEvent.click(screen.getByText('select a1'));
    expect(
      await screen.findByText('Checkout.delivery-shipments-not-saved')
    ).toBeTruthy();

    // The lines of the second shipment changed: the API renamed the group.
    view.rerender(
      list([group('g1', [method('a1')]), { ...group('g3', [method('c1')]), replacesGroupIds: ['g2'] }])
    );
    fireEvent.click(screen.getByText('Checkout.retry'));

    await waitFor(() =>
      expect(api.selectDeliveryMethod).toHaveBeenLastCalledWith(
        expect.objectContaining({ deliveryGroupId: 'g3', optionHandle: 'c1' })
      )
    );
  });

  it('SC-mqce: a rejected delivery input shows why, can be saved again and unblocks once saved', async () => {
    const input = { warehouseRef: 'w-5' };
    act(() =>
      useCustomerInputStore.getState().remember({ id: 'g1' }, '', 'a1', { input, synced: false })
    );
    const selected = method('a1', { data: input, synced: false });
    api.updateShippingMethod
      .mockRejectedValueOnce([{ message: 'Branch is closed', retryable: false }])
      .mockResolvedValueOnce(undefined);
    renderList([group('g1', [selected], selected)]);

    expect(await screen.findByText('Branch is closed')).toBeTruthy();
    expect(readCustomerInputs({ id: 'g1' }, '').a1.synced).toBe(false);

    fireEvent.click(screen.getByText('Checkout.save'));

    await waitFor(() => expect(api.updateShippingMethod).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(readCustomerInputs({ id: 'g1' }, '').a1.synced).toBe(true));
    expect(screen.queryByText('Branch is closed')).toBeNull();
  });
});
