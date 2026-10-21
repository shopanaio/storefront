import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import type { Decorator } from '@storybook/react-vite';
import { useMemo } from 'react';
import { Observable } from 'rxjs';
import { popularCities } from '#checkout/vendors/nova-poshta/popularCities';
import type { Warehouse } from '#checkout/vendors/nova-poshta/types';
import { KYIV_POINTS, KYIV_STREETS } from './deliveryFixtures';

/**
 * How the Nova Poshta directory answers in a story: the branches of the city, a failure of
 * every query, or how long an answer takes (`'never'`: it keeps loading).
 */
export interface DirectoryScenario {
  points?: Warehouse[];
  failure?: 'unavailable' | 'invalid' | 'failed';
  latency?: number | 'never';
}

const FAILURE_CODES = {
  unavailable: 'PROVIDER_UNAVAILABLE',
  invalid: 'DIRECTORY_QUERY_INVALID',
  failed: 'INTERNAL_SERVER_ERROR',
} as const;

const PAGE_SIZE = 50;

/** How long an answer takes by default, so the loading states show. */
const DEFAULT_LATENCY_MS = 300;

const matches = (text: unknown, ...values: string[]) => {
  const query = typeof text === 'string' ? text.trim().toLowerCase() : '';
  return !query || values.some((value) => value.toLowerCase().includes(query));
};

/** Ukraine, the only country the store delivers to: the address is the Nova Poshta city. */
const UKRAINE = {
  __typename: 'CheckoutDeliveryCountry',
  code: 'UA',
  name: 'Україна',
  addressFormat: {
    __typename: 'CheckoutAddressFormat',
    rows: [['CITY']],
    required: ['CITY'],
    provinceLabel: null,
    postalCodeLabel: null,
    postalCodePattern: null,
    postalCodeExample: null,
    provinces: [],
  },
};

/** The answer of the storefront API to a directory query of the stories. */
function answer(
  operationName: string,
  variables: Record<string, unknown>,
  points: Warehouse[]
) {
  switch (operationName) {
    case 'StorefrontDeliveryCountriesQuery':
      return { checkoutDeliveryCountries: [UKRAINE] };
    case 'StorefrontNovaPoshtaSettlementsQuery':
      return {
        novaPoshtaSettlements: {
          __typename: 'NovaPoshtaSettlementPage',
          items: popularCities.filter((city) =>
            matches(variables.query, city.name, city.present)
          ),
          hasNextPage: false,
        },
      };
    case 'StorefrontNovaPoshtaWarehousesQuery': {
      const found = points.filter((item) =>
        matches(variables.query, item.number, item.shortAddress)
      );
      const page = Number(variables.page ?? 1);
      return {
        novaPoshtaWarehouses: {
          __typename: 'NovaPoshtaWarehousePage',
          items: found.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
          totalCount: found.length,
          page,
          hasNextPage: found.length > page * PAGE_SIZE,
        },
      };
    }
    case 'StorefrontNovaPoshtaWarehouseQuery':
      return {
        novaPoshtaWarehouses: {
          __typename: 'NovaPoshtaWarehousePage',
          items: points.filter((item) => item.ref === variables.ref),
        },
      };
    case 'StorefrontNovaPoshtaSettlementStreetsQuery':
      return {
        novaPoshtaSettlementStreets: {
          __typename: 'NovaPoshtaSettlementStreetPage',
          items: KYIV_STREETS.filter((street) =>
            matches(variables.query, street.name, street.present)
          ),
        },
      };
    default:
      return null;
  }
}

/** A client of the storefront API that answers only the queries the stories make. */
function createClient({
  points = KYIV_POINTS,
  failure,
  latency = DEFAULT_LATENCY_MS,
}: DirectoryScenario) {
  const link = new ApolloLink(
    (operation) =>
      new Observable((observer) => {
        const data = answer(
          operation.operationName ?? '',
          operation.variables,
          points
        );
        // The scenario is about the directory: the delivery countries always answer.
        const directory =
          operation.operationName !== 'StorefrontDeliveryCountriesQuery';
        if (latency === 'never' && directory) {
          return;
        }
        const timer = setTimeout(
          () => {
            if (!data) {
              observer.error(
                new Error(`Not mocked: ${operation.operationName}`)
              );
              return;
            }
            observer.next(
              failure && directory
                ? {
                    data: null,
                    errors: [
                      {
                        message: 'Directory failed',
                        extensions: { code: FAILURE_CODES[failure] },
                      },
                    ],
                  }
                : { data }
            );
            observer.complete();
          },
          typeof latency === 'number' ? latency : DEFAULT_LATENCY_MS
        );
        return () => clearTimeout(timer);
      })
  );
  return new ApolloClient({ link, cache: new InMemoryCache() });
}

/**
 * Renders a story with the storefront API of the Nova Poshta directory and the delivery
 * countries, answering as `parameters.directory` says.
 */
// Any args: the decorator wraps stories of every component.
export const withDirectory: Decorator<any> = (Story, { parameters, id }) => {
  const scenario = (parameters.directory ?? {}) as DirectoryScenario;
  // A new client per story, so no story reads answers cached by another.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const client = useMemo(() => createClient(scenario), [id]);
  return (
    <ApolloProvider client={client}>
      <Story />
    </ApolloProvider>
  );
};
