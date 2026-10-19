import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing/react';
import { NextIntlClientProvider } from 'next-intl';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { StorefrontNovaPoshtaWarehouseQueryDocument } from '#checkout/graphql/operations';
import { PointForm } from './PointForm';

const SETTLEMENT = 'e718a680-4b33-11e4-ab6d-005056801329';
const WAREHOUSE = '1ec09d88-e1c2-11e3-8c4a-0050568002cf';

const address = {
  addressId: 'a1',
  countryCode: 'UA',
  address1: null,
  address2: null,
  postalCode: null,
  provinceCode: null,
  city: 'Київ',
  data: { carriers: { 'nova-poshta': { settlementRef: SETTLEMENT } } },
};

const input = { type: 'WAREHOUSE', settlementRef: SETTLEMENT, warehouseRef: WAREHOUSE };

const byRef = {
  request: { query: StorefrontNovaPoshtaWarehouseQueryDocument, variables: { ref: WAREHOUSE } },
  result: {
    data: {
      novaPoshtaWarehouses: {
        __typename: 'NovaPoshtaWarehousePage',
        items: [
          {
            __typename: 'NovaPoshtaWarehouse',
            ref: WAREHOUSE,
            kind: 'WAREHOUSE',
            number: '7',
            description: 'Відділення №7',
            shortAddress: 'Київ, Хрещатик, 1',
            selectable: true,
            settlementRef: SETTLEMENT,
            schedule: [],
          },
        ],
      },
    },
  },
};

const pointForm = (view?: unknown) => (
  <MockedProvider mocks={[byRef]}>
    <NextIntlClientProvider locale="uk" messages={{}} onError={() => {}}>
      <PointForm
        type="WAREHOUSE"
        data={input}
        view={view}
        onSubmit={vi.fn()}
        deliveryAddress={address}
      />
    </NextIntlClientProvider>
  </MockedProvider>
);

describe('PointForm', () => {
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

  it('shows the branch kept in this browser', () => {
    render(pointForm({ number: '3', shortAddress: 'Київ, Січових Стрільців, 2', schedule: [] }));
    expect(screen.getByText('№3 Київ, Січових Стрільців, 2')).toBeTruthy();
  });

  it('reads the branch saved in the checkout by its ref when this browser has none', async () => {
    render(pointForm());
    expect(await screen.findByText('№7 Київ, Хрещатик, 1')).toBeTruthy();
  });
});
