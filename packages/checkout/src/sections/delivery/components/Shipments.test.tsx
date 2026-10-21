import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { DeliveryGroup, DeliveryMethod } from '../types';
import type { DeliveryMethodListProps } from './DeliveryMethodList';
import { Shipments } from './Shipments';

vi.mock('./DeliveryMethodList', () => ({
  DeliveryMethodList: (props: DeliveryMethodListProps) => (
    <div
      data-testid="method-list"
      data-groups={props.groups.map((group) => group.id).join(',')}
      data-methods={props.methods.map((method) => method.handle).join(',')}
      data-initial={props.initialSelectKey ?? ''}
    />
  ),
}));
vi.mock('./ShipmentLines', () => ({ ShipmentLines: () => null }));

const method = (handle: string, code: string, data?: unknown): DeliveryMethod => ({
  handle,
  code,
  title: code,
  provider: 'nova-poshta',
  carrierCode: 'nova-poshta',
  estimatedMinDeliveryAt: null,
  estimatedMaxDeliveryAt: null,
  data,
  customerInputContract: null,
  publicData: {},
});

const group = (
  id: string,
  methods: DeliveryMethod[],
  selected: DeliveryMethod | null
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
  shipping: null,
});

const branch = (ref: string) => ({ type: 'WAREHOUSE', warehouseRef: ref });

const renderShipments = (groups: DeliveryGroup[]) =>
  render(
    <NextIntlClientProvider locale="uk" messages={{}} onError={() => {}}>
      <Shipments groups={groups} address={null} />
    </NextIntlClientProvider>
  );

/** Groups of each method list, top to bottom. */
const listedGroups = () =>
  screen.getAllByTestId('method-list').map((list) => list.dataset.groups);

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

  it('shares one list when every shipment has the same method and input', () => {
    const a = method('a1', 'warehouse', branch('5'));
    const b = method('b1', 'warehouse', branch('5'));
    renderShipments([group('g1', [a], a), group('g2', [b], b)]);

    expect(listedGroups()).toEqual(['g1,g2']);
    expect(screen.getAllByText('Checkout.delivery-shipment-split')).toHaveLength(2);
  });

  it('starts a shipment apart when the same method goes to another branch', () => {
    const a = method('a1', 'warehouse', branch('5'));
    const b = method('b1', 'warehouse', branch('7'));
    renderShipments([group('g1', [a], a), group('g2', [b], b)]);

    expect(listedGroups()).toEqual(['g1', 'g2']);
    expect(screen.getByText('Checkout.delivery-shipment-merge')).toBeTruthy();
  });

  it('takes out only the shipment whose "another delivery method" was clicked', () => {
    const a = method('a1', 'warehouse');
    const b = method('b1', 'warehouse');
    const c = method('c1', 'warehouse');
    const courier = method('b2', 'courier');
    renderShipments([group('g1', [a], a), group('g2', [b, courier], b), group('g3', [c], c)]);

    fireEvent.click(screen.getAllByText('Checkout.delivery-shipment-split')[1]);

    expect(listedGroups()).toEqual(['g1,g3', 'g2']);
    // The shipment apart offers its own methods, also ones the others lack.
    expect(screen.getAllByTestId('method-list')[1].dataset.methods).toBe('b1,b2');
  });

  it('puts a shipment back with the method of the others', () => {
    const a = method('a1', 'warehouse', branch('5'));
    const b = method('b1', 'warehouse', branch('7'));
    renderShipments([group('g1', [a], a), group('g2', [b], b)]);

    fireEvent.click(screen.getByText('Checkout.delivery-shipment-merge'));

    expect(listedGroups()).toEqual(['g1,g2']);
    expect(screen.getByTestId('method-list').dataset.initial).toBe('nova-poshta\nwarehouse');
  });

  it('offers no way back to a shipment that shares no method with the others', () => {
    const a = method('a1', 'warehouse');
    const b = method('b1', 'courier');
    renderShipments([group('g1', [a], null), group('g2', [b], null)]);

    expect(listedGroups()).toEqual(['g1', 'g2']);
    expect(screen.queryByText('Checkout.delivery-shipment-merge')).toBeNull();
  });
});
