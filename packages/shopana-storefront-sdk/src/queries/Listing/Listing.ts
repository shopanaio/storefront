import { graphql } from "relay-runtime";

const Listing = graphql`
  fragment Listing on Category
  @refetchable(queryName: "CategoryListingPaginationQuery")
  @argumentDefinitions(
    first: { type: "Int", defaultValue: 25 }
    after: { type: "Cursor" }
    sort: { type: "ListingSort", defaultValue: MANUAL }
    filters: { type: "[ListingFilterInput!]", defaultValue: [] }
  ) {
    title: name
    handle
    listing: products(first: $first, after: $after, sort: $sort, filters: $filters)
      @connection(key: "ListingFragment_listing") {
      totalCount
      sort
      availableSorts
      filters {
        id
        handle: id
        label
        title: label
        type
        priceRange {
          min { amount currencyCode }
          max { amount currencyCode }
          selectedMin { amount currencyCode }
          selectedMax { amount currencyCode }
        }
        values {
          id
          handle: id
          label
          title: label
          count
          selected
          input
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          ...useListingProductCardFragment_product
            @arguments(withOptions: true)
        }
      }
    }
  }
`;

export default Listing;
