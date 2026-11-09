import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCarrierDirectory, DirectoryFailure } from './carrier';

const SETTLEMENT = 'e718a680-4b33-11e4-ab6d-005056801329';
const CITY = '8d5a980d-391c-11dd-90d9-001a92567626';
const WAREHOUSE = '1ec09d88-e1c2-11e3-8c4a-0050568002cf';

/** The carrier answers every request with this body; the requests are kept. */
function carrierAnswers(body: unknown) {
  const fetch = vi.fn(
    async (_url: string, _init: RequestInit) =>
      new Response(JSON.stringify(body), { status: 200 })
  );
  vi.stubGlobal('fetch', fetch);
  return () =>
    fetch.mock.calls.map(([, init]) => JSON.parse(String(init.body)));
}

const ok = (data: unknown, info: unknown = []) => ({
  success: true,
  data,
  errors: [],
  warnings: [],
  info,
  messageCodes: [],
  errorCodes: [],
  warningCodes: [],
  infoCodes: [],
});

describe('carrier directory', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('searches settlements without an API key and keeps the carrier refs', async () => {
    const requests = carrierAnswers(
      ok([
        {
          TotalCount: 3,
          Addresses: [
            {
              Ref: SETTLEMENT,
              DeliveryCity: CITY,
              MainDescription: 'Київ',
              Present: 'м. Київ, Київська обл.',
              Area: 'Київська',
              Region: '',
              SettlementTypeCode: 'м.',
              Warehouses: 2000,
            },
          ],
        },
      ])
    );

    const page = await createCarrierDirectory().settlements({
      query: 'київ',
      page: 1,
      limit: 1,
    });

    expect(requests()).toEqual([
      {
        modelName: 'AddressGeneral',
        calledMethod: 'searchSettlements',
        methodProperties: { CityName: 'київ', Page: 1, Limit: 1 },
      },
    ]);
    expect(page).toEqual({
      items: [
        {
          ref: SETTLEMENT,
          cityRef: CITY,
          name: 'Київ',
          present: 'м. Київ, Київська обл.',
          area: 'Київська',
          region: null,
          settlementType: 'м.',
          warehouseCount: 2000,
          addressDeliveryAllowed: null,
        },
      ],
      page: 1,
      hasNextPage: true,
    });
  });

  it('maps points: postomats by category, closed ones unselectable, the schedule in order', async () => {
    carrierAnswers(
      ok(
        [
          {
            Ref: WAREHOUSE,
            Number: '27014',
            Description: 'Поштомат №27014',
            ShortAddress: 'Київ, Саксаганського, 41',
            CategoryOfWarehouse: 'Postomat',
            PostMachineType: 'FullDayService',
            WarehouseStatus: 'Working',
            DenyToSelect: '1',
            SettlementRef: SETTLEMENT,
            Schedule: { Monday: '00:00-23:59', Tuesday: '-' },
          },
        ],
        { totalCount: 1 }
      )
    );

    const page = await createCarrierDirectory().warehouses({
      settlementRef: SETTLEMENT,
      page: 1,
      limit: 50,
    });

    expect(page).toEqual({
      items: [
        {
          ref: WAREHOUSE,
          kind: 'POSTOMAT',
          number: '27014',
          description: 'Поштомат №27014',
          shortAddress: 'Київ, Саксаганського, 41',
          selectable: false,
          settlementRef: SETTLEMENT,
          schedule: [
            { day: 'Monday', hours: '00:00-23:59' },
            { day: 'Tuesday', hours: '-' },
          ],
        },
      ],
      page: 1,
      hasNextPage: false,
    });
  });

  it('tells a rejected request from a carrier that does not answer', async () => {
    carrierAnswers({
      ...ok([]),
      success: false,
      errorCodes: ['20000200068'],
    });
    await expect(
      createCarrierDirectory().streets({
        settlementRef: SETTLEMENT,
        query: 'хре',
        limit: 20,
      })
    ).rejects.toEqual(new DirectoryFailure('invalid'));

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      })
    );
    await expect(
      createCarrierDirectory().streets({
        settlementRef: SETTLEMENT,
        query: 'хре',
        limit: 20,
      })
    ).rejects.toEqual(new DirectoryFailure('unavailable'));
  });
});
