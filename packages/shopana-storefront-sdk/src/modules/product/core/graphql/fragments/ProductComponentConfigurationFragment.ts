import { graphql } from 'relay-runtime';

export const ProductComponentConfigurationFragment = graphql`
  fragment ProductComponentConfigurationFragment on ProductVariant
  @argumentDefinitions(
    selections: { type: "[ProductComponentSelectionInput!]" }
  ) {
    componentConfiguration(selections: $selections) {
      id
      displayStyle
      componentsSubtotal {
        amount
        currencyCode
      }
      totalPrice {
        amount
        currencyCode
      }
      groups {
        ...ProductComponentGroupFragment
      }
    }
  }
`;

export {
  default as ProductComponentConfigurationFragmentNode,
} from './__generated__/ProductComponentConfigurationFragment.graphql';
export type {
  ProductComponentConfigurationFragment$data,
  ProductComponentConfigurationFragment$key,
} from './__generated__/ProductComponentConfigurationFragment.graphql';
