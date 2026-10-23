import { connection } from './helpers.js';

const tail = (id) => String(id).split('/').at(-1);

const comparisonConfig = (store, categoryId) =>
  store.state.productComparisons?.find(
    (candidate) => candidate.categoryId === categoryId
  ) ?? null;

const resolvedVariants = (store, variantIds) =>
  [...new Set(variantIds ?? [])]
    .map((id) => store.get(id))
    .filter(
      (variant) =>
        variant?.__typename === 'ProductVariant' && store.get(variant.productId)
    );

const comparisonModel = (
  categoryId,
  title,
  variants,
  savedVariantIds = []
) => ({
  key: `comparison:${tail(categoryId)}`,
  categoryId,
  title,
  variantIds: variants.map(({ id }) => id),
  savedVariantIds: [...savedVariantIds],
});

export const productComparison = (store, product, customer) => {
  const config = comparisonConfig(store, product.primaryCategoryId);
  if (!config) return null;

  const configuredByProduct = new Map(
    resolvedVariants(store, config.variantIds).map((variant) => [
      variant.productId,
      variant,
    ])
  );
  const categoryProducts = store.state.products.filter(
    (candidate) => candidate.primaryCategoryId === config.categoryId
  );
  const variants = categoryProducts
    .map((candidate) => {
      const availableVariants = resolvedVariants(store, candidate.variantIds);
      return (
        configuredByProduct.get(candidate.id) ??
        availableVariants.find(({ availableForSale }) => availableForSale) ??
        availableVariants[0]
      );
    })
    .filter(Boolean);

  return comparisonModel(
    config.categoryId,
    config.title ??
      `Compare ${store.get(config.categoryId)?.name ?? 'products'}`,
    variants,
    customer?.comparisonVariantIds
  );
};

export const customerProductComparisons = (store, customer) => {
  const variants = resolvedVariants(store, customer.comparisonVariantIds);
  const variantsByCategory = new Map();

  for (const variant of variants) {
    const categoryId = store.get(variant.productId)?.primaryCategoryId;
    if (!categoryId) continue;
    const grouped = variantsByCategory.get(categoryId) ?? [];
    grouped.push(variant);
    variantsByCategory.set(categoryId, grouped);
  }

  const nodes = [...variantsByCategory].map(([categoryId, groupedVariants]) => {
    const config = comparisonConfig(store, categoryId);
    return comparisonModel(
      categoryId,
      config?.title ?? `Compare ${store.get(categoryId)?.name ?? 'products'}`,
      groupedVariants,
      customer.comparisonVariantIds
    );
  });

  return {
    nodes,
    totalCount: nodes.length,
    itemCount: variants.length,
  };
};

const valueCell = (source) => ({
  status: 'VALUE',
  feature: null,
  selectedOption: null,
  ...source,
});
const missingCell = () => ({
  status: 'MISSING',
  feature: null,
  selectedOption: null,
});

const buildRows = (store, variants) => {
  const groups = new Map();
  const optionRows = new Map();

  for (const variant of variants) {
    const product = store.get(variant.productId);
    for (const selection of variant.selectedOptions ?? []) {
      const handle = selection.option?.handle ?? selection.name;
      if (!optionRows.has(handle)) optionRows.set(handle, selection.name);
    }

    for (const feature of product.features ?? []) {
      const group = (product.featureGroups ?? []).find(
        ({ id }) => id === feature.group
      );
      const groupHandle = group?.handle ?? 'details';
      if (!groups.has(groupHandle)) {
        groups.set(groupHandle, {
          name: group?.name ?? 'Details',
          rows: new Map(),
        });
      }
      const rows = groups.get(groupHandle).rows;
      if (!rows.has(feature.handle)) rows.set(feature.handle, feature.name);
    }
  }

  if (optionRows.size)
    groups.set('options', { name: 'Options', rows: optionRows, options: true });

  return [...groups].map(([groupHandle, group]) => ({
    key: `comparison-group:${groupHandle}`,
    name: group.name,
    rows: [...group.rows].map(([rowHandle, name]) => {
      const cells = variants.map((variant) => {
        if (group.options) {
          const selection = variant.selectedOptions?.find(
            (candidate) =>
              (candidate.option?.handle ?? candidate.name) === rowHandle
          );
          return selection
            ? valueCell({ selectedOption: selection })
            : missingCell();
        }

        const product = store.get(variant.productId);
        const feature = product.features?.find(
          ({ handle }) => handle === rowHandle
        );
        return feature?.values?.length ? valueCell({ feature }) : missingCell();
      });

      return {
        key: `comparison-row:${groupHandle}:${rowHandle}`,
        name,
        description: null,
        cells,
      };
    }),
  }));
};

export const comparisonColumns = (store, comparison, args) => {
  const savedVariantIds = new Set(comparison.savedVariantIds);
  const columns = resolvedVariants(store, comparison.variantIds).map(
    (variant, position) => {
      const product = store.get(variant.productId);
      return {
        key: variant.id,
        position,
        product,
        variant,
        featuredMedia: store.get(
          variant.featuredMediaId ?? product.featuredMediaId
        ),
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        availableForSale: variant.availableForSale,
        savedForComparison: savedVariantIds.has(variant.id),
      };
    }
  );
  const result = connection(columns, args);

  return {
    ...result,
    groups: buildRows(
      store,
      result.nodes.map(({ variant }) => variant)
    ),
  };
};
