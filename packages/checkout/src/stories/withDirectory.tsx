import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import type { Decorator } from '@storybook/react-vite';
import { Observable } from 'rxjs';
import { NovaPoshtaDirectoryProvider } from '#checkout/vendors/nova-poshta/api/directory';
import {
  DirectoryFailure,
  type NovaPoshtaDirectory,
} from '#checkout/vendors/nova-poshta/api/carrier';
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
    // A few oblasts and the cities of their own, as the store lists them (ISO codes, no prefix).
    provinces: [
      ['30', 'Київ'],
      ['32', 'Київська область'],
      ['46', 'Львівська область'],
      ['51', 'Одеська область'],
      ['63', 'Харківська область'],
    ].map(([code, name]) => ({
      __typename: 'CheckoutAddressProvince',
      code,
      name,
    })),
  },
};

/** The answer of the storefront API to a query of the stories. */
function answer(operationName: string) {
  return operationName === 'StorefrontDeliveryCountriesQuery'
    ? { checkoutDeliveryCountries: [UKRAINE] }
    : null;
}

/** How long an answer of the scenario takes; `never` keeps it loading. */
function delay(latency: DirectoryScenario['latency']) {
  return new Promise<void>((resolve) => {
    if (latency !== 'never') {
      setTimeout(
        resolve,
        typeof latency === 'number' ? latency : DEFAULT_LATENCY_MS
      );
    }
  });
}

/** The Nova Poshta directory that answers as the scenario says. */
function createDirectory({
  points = KYIV_POINTS,
  failure,
  latency = DEFAULT_LATENCY_MS,
}: DirectoryScenario): NovaPoshtaDirectory {
  const respond = async <T,>(value: () => T) => {
    await delay(latency);
    if (failure) {
      throw new DirectoryFailure(failure);
    }
    return value();
  };
  return {
    settlements: ({ query }) =>
      respond(() => ({
        // Only the cities the carrier is known for: the others have no ref yet.
        items: popularCities.filter(
          (city) => city.ref && matches(query, city.name, city.present)
        ),
        page: 1,
        hasNextPage: false,
      })),
    warehouses: ({ ref, query, page, limit }) =>
      respond(() => {
        const found = ref
          ? points.filter((item) => item.ref === ref)
          : points.filter((item) =>
              matches(query, item.number, item.shortAddress)
            );
        return {
          items: found.slice((page - 1) * limit, page * limit),
          page,
          hasNextPage: found.length > page * limit,
        };
      }),
    streets: ({ query }) =>
      respond(() =>
        KYIV_STREETS.filter((street) =>
          matches(query, street.name, street.present)
        )
      ),
  };
}

/** A client of the storefront API that answers only the queries the stories make. */
function createClient() {
  const link = new ApolloLink(
    (operation) =>
      new Observable((observer) => {
        const data = answer(operation.operationName ?? '');
        const timer = setTimeout(() => {
          if (!data) {
            observer.error(new Error(`Not mocked: ${operation.operationName}`));
            return;
          }
          observer.next({ data });
          observer.complete();
        }, DEFAULT_LATENCY_MS);
        return () => clearTimeout(timer);
      })
  );
  return new ApolloClient({ link, cache: new InMemoryCache() });
}

/** One client and directory per story, so no story reads answers cached by another. */
const stories = new Map<
  string,
  { client: ReturnType<typeof createClient>; directory: NovaPoshtaDirectory }
>();
const storyOf = (storyId: string, scenario: DirectoryScenario) => {
  let story = stories.get(storyId);
  if (!story) {
    story = { client: createClient(), directory: createDirectory(scenario) };
    stories.set(storyId, story);
  }
  return story;
};

/**
 * Renders a story with the Nova Poshta directory, answering as `parameters.directory` says,
 * and the storefront API of the delivery countries.
 */

export const withDirectory: Decorator = function WithDirectory(
  Story,
  { parameters, id }
) {
  const scenario = (parameters.directory ?? {}) as DirectoryScenario;
  const { client, directory } = storyOf(id, scenario);
  return (
    <ApolloProvider client={client}>
      <NovaPoshtaDirectoryProvider directory={directory}>
        <Story />
      </NovaPoshtaDirectoryProvider>
    </ApolloProvider>
  );
};
