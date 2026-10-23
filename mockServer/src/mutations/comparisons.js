import { customerError } from '../helpers.js';

const failure = (...userErrors) => ({
  customer: null,
  revision: null,
  userErrors,
});

const withComparison = (store, scope, input, context, operation) =>
  store.replay(
    `${scope}:${context.customer?.id ?? 'anonymous'}`,
    input.idempotencyKey,
    () => {
      const customer = context.customer;
      if (!customer) {
        return failure(
          customerError(
            'AUTHENTICATION_REQUIRED',
            'A customer session is required.'
          )
        );
      }

      const userErrors = operation(customer);
      if (userErrors.length) return failure(...userErrors);
      store.reindex();
      return {
        customer,
        revision: customer.comparisonRevision,
        userErrors: [],
      };
    }
  );

const touchComparison = (customer) => {
  customer.comparisonRevision += 1;
};

export const comparisonMutations = (store) => ({
  customerComparisonVariantAdd: (_, { input }, context) =>
    withComparison(
      store,
      'customerComparisonVariantAdd',
      input,
      context,
      (customer) => {
        const variant = store.get(input.variantId);
        if (
          variant?.__typename !== 'ProductVariant' ||
          !store.get(variant.productId)
        ) {
          return [
            customerError(
              'VARIANT_NOT_FOUND',
              'The product variant is unavailable.',
              ['variantId']
            ),
          ];
        }
        if (!customer.comparisonVariantIds.includes(variant.id)) {
          customer.comparisonVariantIds.push(variant.id);
          touchComparison(customer);
        }
        return [];
      }
    ),

  customerComparisonVariantRemove: (_, { input }, context) =>
    withComparison(
      store,
      'customerComparisonVariantRemove',
      input,
      context,
      (customer) => {
        const next = customer.comparisonVariantIds.filter(
          (id) => id !== input.variantId
        );
        if (next.length !== customer.comparisonVariantIds.length) {
          customer.comparisonVariantIds = next;
          touchComparison(customer);
        }
        return [];
      }
    ),

  customerComparisonCategoryClear: (_, { input }, context) =>
    withComparison(
      store,
      'customerComparisonCategoryClear',
      input,
      context,
      (customer) => {
        const category = store.get(input.categoryId);
        if (category?.__typename !== 'Category') {
          return [
            customerError(
              'CATEGORY_NOT_FOUND',
              'The product category is unavailable.',
              ['categoryId']
            ),
          ];
        }
        const next = customer.comparisonVariantIds.filter((variantId) => {
          const variant = store.get(variantId);
          return (
            store.get(variant?.productId)?.primaryCategoryId !== category.id
          );
        });
        if (next.length !== customer.comparisonVariantIds.length) {
          customer.comparisonVariantIds = next;
          touchComparison(customer);
        }
        return [];
      }
    ),
});
