import { useLazyLoadQuery, usePreloadedQuery } from "react-relay/hooks";
import { graphql } from "relay-runtime";
import type { PreloadedQuery } from "react-relay/hooks";

export const useGetSessionQuery = graphql`
  query useGetSessionQuery($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      email
      firstName
      lastName
      phone
      createdAt
      updatedAt
      displayName
      numberOfOrders
      orders(first: 5) {
        edges {
          node {
            id
            name
            orderNumber
            processedAt
            totalPrice {
              amount
              currencyCode
            }
            currentTotalPrice {
              amount
              currencyCode
            }
            financialStatus
            fulfillmentStatus
            customerUrl
            statusUrl
          }
        }
      }
      addresses(first: 5) {
        edges {
          node {
            id
            firstName
            lastName
            company
            address1
            address2
            city
            province
            country
            zip
            phone
          }
        }
      }
    }
  }
`;

// For regular requests (SPA)
const useGetSession = (customerAccessToken: string, fetchKey: number = 0) => {
  console.log("fetchKey Shopify", fetchKey);
  return useLazyLoadQuery(
    useGetSessionQuery,
    { customerAccessToken },
    {
      fetchPolicy: "network-only",
      networkCacheConfig: {
        force: true,
      },
      fetchKey,
    }
  );
};

// For preloaded queries (SSR)
const useGetSessionPreloaded = (preloadedQuery: PreloadedQuery<typeof useGetSessionQuery>) => {
  // The caller must ensure preloadedQuery is valid to avoid crashing
  console.log("preloadedQuery Shopify", preloadedQuery);
  return usePreloadedQuery(useGetSessionQuery, preloadedQuery);
};

export default {
  useGetSession,
  useGetSessionPreloaded,
};
