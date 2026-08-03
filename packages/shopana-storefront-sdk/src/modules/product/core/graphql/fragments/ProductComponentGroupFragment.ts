import { graphql } from 'relay-runtime';

export const ProductComponentGroupFragment = graphql`
  fragment ProductComponentGroupFragment on ProductComponentGroup {
    id
    title
    required
    isRequired: required
    minSelection
    maxSelection
    items {
      ...ProductComponentItemFragment
    }
  }
`;

export {
  default as ProductComponentGroupFragmentNode,
} from './__generated__/ProductComponentGroupFragment.graphql';
export type {
  ProductComponentGroupFragment$data,
  ProductComponentGroupFragment$key,
} from './__generated__/ProductComponentGroupFragment.graphql';
