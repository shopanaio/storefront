import { act, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { DeliveryGroup, DeliveryMethod } from '../types';
import type { DeliveryMethodListProps } from './DeliveryMethodList';
import { Shipments } from './Shipments';

/** Lists the shipments render, newest render last. */
const lists: DeliveryMethodListProps[] = [];

vi.mock('./DeliveryMethodList', () => ({
  DeliveryMethodList: (props: DeliveryMethodListProps) => {
    lists.push(props);
    return (
      <div data-testid={props.groups.length > 1 ? 'shared-list' : 'shipment-list'} />
    );
  },
}));
vi.mock('./ShipmentLines', () => ({ ShipmentLines: () => null }));
vi.mock('./ShipmentQuote', () => ({ ShipmentQuote: () => null }));

const method = (handle: string, code: string, data?: unknown): DeliveryMethod => ({
  handle,
  code,
  title: code,
  provider: 'nova-poshta',
  carrierCode: 'nova-poshta',
  cost: { amount: 80, currencyCode: 'UAH' },
  paymentModel: 'MERCHANT_COLLECTED',
  estimatedMinDeliveryAt: null,
  estimatedMaxDeliveryAt: null,
  data,
  customerInputContract: null,
  publicData: {},
});

const group = (id: string, methods: DeliveryMethod[], selected: DeliveryMethod | null) => ({
  id,
  lines: [],
  deliveryMethods: methods,
  selectedDeliveryMethod: selected,
  address: null,
  resetReason: null,
  previousOptionHandle: null,
});

const branch = (ref: string) => ({ type: 'WAREHOUSE', warehouseRef: ref });

const renderShipments = (groups: DeliveryGroup[]) =>
  render(
    <NextIntlClientProvider locale="uk" messages={{}} onError={() => {}}>
      <Shipments groups={groups} address={null} />
    </NextIntlClientProvider>
  );

describe('Shipments', () => {
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
    lists.length = 0;
  });

  it('shares one list when every shipment has the same method and input', () => {
    const a = method('a1', 'warehouse', branch('5'));
    const b = method('b1', 'warehouse', branch('5'));
    renderShipments([group('g1', [a], a), group('g2', [b], b)]);

    expect(screen.getByTestId('shared-list')).toBeTruthy();
    expect(screen.queryAllByTestId('shipment-list')).toHaveLength(0);
  });

  it('shows the shipments one by one when the same method goes to different branches', () => {
    const a = method('a1', 'warehouse', branch('5'));
    const b = method('b1', 'warehouse', branch('7'));
    renderShipments([group('g1', [a], a), group('g2', [b], b)]);

    expect(screen.queryByTestId('shared-list')).toBeNull();
    expect(screen.getAllByTestId('shipment-list')).toHaveLength(2);
  });

  it('applies the first shipment to all of them on "one method for all"', () => {
    const a = method('a1', 'warehouse', branch('5'));
    const b = method('b1', 'warehouse', branch('7'));
    renderShipments([group('g1', [a], a), group('g2', [b], b)]);

    fireEvent.click(screen.getByText('Checkout.delivery-same-for-all-shipments'));

    // The shared list stays while it applies the method, even though the groups differ.
    const shared = lists.at(-1)!;
    expect(shared.groups).toHaveLength(2);
    expect(shared.initialSelectKey).toBe('nova-poshta\nwarehouse');
    act(() => shared.onSelectingChange?.(true));
    expect(screen.getByTestId('shared-list')).toBeTruthy();

    // The selection failed in one group: the shipments still differ and are shown one by one.
    act(() => shared.onSelectingChange?.(false));
    expect(screen.queryByTestId('shared-list')).toBeNull();
    expect(screen.getAllByTestId('shipment-list')).toHaveLength(2);
  });
});
