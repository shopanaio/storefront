import { gid, money, postalAddress } from './fixture-helpers.js';

const CURSOR_PREFIX = 'shopana-mock:';

export const clone = (value) => structuredClone(value);

export const encodeCursor = (index) =>
  Buffer.from(`${CURSOR_PREFIX}${index}`, 'utf8').toString('base64url');

export const decodeCursor = (cursor) => {
  if (!cursor) return null;

  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    if (!decoded.startsWith(CURSOR_PREFIX)) return null;
    const index = Number.parseInt(decoded.slice(CURSOR_PREFIX.length), 10);
    return Number.isInteger(index) && index >= 0 ? index : null;
  } catch {
    return null;
  }
};

export const connection = (source, args = {}, extra = {}) => {
  const nodes = Array.isArray(source) ? source : [];
  const afterIndex = decodeCursor(args.after);
  const beforeIndex = decodeCursor(args.before);
  let start = afterIndex === null ? 0 : Math.min(afterIndex + 1, nodes.length);
  let end =
    beforeIndex === null ? nodes.length : Math.min(beforeIndex, nodes.length);

  if (end < start) end = start;
  if (args.first !== null && args.first !== undefined) {
    end = Math.min(end, start + Math.max(0, args.first));
  }
  if (args.last !== null && args.last !== undefined) {
    start = Math.max(start, end - Math.max(0, args.last));
  }

  const pageNodes = nodes.slice(start, end);
  const edges = pageNodes.map((node, offset) => ({
    cursor: encodeCursor(start + offset),
    node,
  }));

  return {
    edges,
    nodes: pageNodes,
    pageInfo: {
      startCursor: edges[0]?.cursor ?? null,
      endCursor: edges.at(-1)?.cursor ?? null,
      hasPreviousPage: start > 0,
      hasNextPage: end < nodes.length,
    },
    totalCount: nodes.length,
    ...extra,
  };
};

export const normalizeText = (value) =>
  String(value ?? '')
    .trim()
    .replace(/\s+/gu, ' ')
    .toLocaleLowerCase('en');

const minimumPrice = (product, variantsById) => {
  const prices = (product.variantIds ?? [])
    .map((id) => variantsById.get(id)?.price?.amount)
    .filter((amount) => amount !== undefined)
    .map(Number);
  return prices.length ? Math.min(...prices) : Number.POSITIVE_INFINITY;
};

export const sortProducts = (
  products,
  sort,
  variantsById,
  relevance = new Map()
) => {
  const sorted = [...products];
  const byDateDescending = (left, right, field) =>
    String(right[field]).localeCompare(String(left[field]));

  sorted.sort((left, right) => {
    switch (sort) {
      case 'RELEVANCE':
        return (
          (relevance.get(right.id) ?? 0) - (relevance.get(left.id) ?? 0) ||
          byDateDescending(left, right, 'publishedAt')
        );
      case 'CREATED_AT':
        return byDateDescending(left, right, 'createdAt');
      case 'TITLE_ASC':
        return left.title.localeCompare(right.title, 'en');
      case 'TITLE_DESC':
        return right.title.localeCompare(left.title, 'en');
      case 'PRICE_ASC':
        return (
          minimumPrice(left, variantsById) - minimumPrice(right, variantsById)
        );
      case 'PRICE_DESC':
        return (
          minimumPrice(right, variantsById) - minimumPrice(left, variantsById)
        );
      case 'MANUAL':
        return 0;
      case 'NEWEST':
      default:
        return byDateDescending(left, right, 'publishedAt');
    }
  });

  return sorted;
};

const productMatchesFacet = (product, facetFilter) => {
  const facet = normalizeText(facetFilter?.facet);
  const value = normalizeText(facetFilter?.value);

  if (['tag', 'tags'].includes(facet)) {
    return product.tags.some((tag) =>
      [tag.id, tag.handle, tag.name].some(
        (candidate) => normalizeText(candidate) === value
      )
    );
  }
  if (['category', 'categories'].includes(facet)) {
    return product.categoryIds.some(
      (id) =>
        normalizeText(id) === value ||
        normalizeText(id.split('/').at(-1)) === value
    );
  }
  if (['vendor', 'vendors'].includes(facet)) {
    return [product.vendor?.id, product.vendor?.name].some(
      (candidate) => normalizeText(candidate) === value
    );
  }

  const option = product.options?.find(({ handle, name }) =>
    [handle, name].some((candidate) => normalizeText(candidate) === facet)
  );
  if (option) {
    return option.optionValues.some((optionValue) =>
      [optionValue.id, optionValue.handle, optionValue.name].some(
        (candidate) => normalizeText(candidate) === value
      )
    );
  }

  const feature = product.features?.find(({ handle, name }) =>
    [handle, name].some((candidate) => normalizeText(candidate) === facet)
  );
  if (feature) {
    return feature.values.some((featureValue) =>
      [featureValue.id, featureValue.handle, featureValue.name].some(
        (candidate) => normalizeText(candidate) === value
      )
    );
  }

  return false;
};

const filterKey = (filter) => {
  if (filter.facet) return `facet:${normalizeText(filter.facet.facet)}`;
  if (filter.vendorId) return 'vendor';
  if (filter.availability) return 'availability';
  if (filter.price) return 'price';
  return 'unknown';
};

const productMatchesFilter = (product, filter, variantsById) => {
  if (filter.facet && !productMatchesFacet(product, filter.facet)) return false;
  if (filter.vendorId && product.vendor?.id !== filter.vendorId) return false;

  const variants = (product.variantIds ?? [])
    .map((id) => variantsById.get(id))
    .filter(Boolean);
  if (
    filter.availability === 'AVAILABLE' &&
    !variants.some((variant) => variant.availableForSale)
  )
    return false;
  if (
    filter.availability === 'UNAVAILABLE' &&
    !variants.some((variant) => !variant.availableForSale)
  )
    return false;

  if (filter.price) {
    const matchesPrice = variants.some((variant) => {
      const amount = Number(variant.price?.amount);
      return (
        (filter.price.min === null ||
          filter.price.min === undefined ||
          amount >= Number(filter.price.min)) &&
        (filter.price.max === null ||
          filter.price.max === undefined ||
          amount <= Number(filter.price.max))
      );
    });
    if (!matchesPrice) return false;
  }

  return true;
};

export const filterProducts = (products, filters = [], variantsById) => {
  const groupedFilters = new Map();
  for (const filter of filters) {
    const key = filterKey(filter);
    groupedFilters.set(key, [...(groupedFilters.get(key) ?? []), filter]);
  }

  return products.filter((product) =>
    [...groupedFilters.values()].every((group) =>
      group.some((filter) =>
        productMatchesFilter(product, filter, variantsById)
      )
    )
  );
};

export const searchProducts = (products, query) => {
  const normalized = normalizeText(query);
  const terms = normalized.split(' ').filter(Boolean);
  const relevance = new Map();

  const matches = products.filter((product) => {
    const title = normalizeText(product.title);
    const handle = normalizeText(product.handle);
    const description = normalizeText(product.description?.text);
    const vendor = normalizeText(product.vendor?.name);
    const tags = normalizeText(product.tags.map(({ name }) => name).join(' '));
    const haystack = `${title} ${handle} ${description} ${vendor} ${tags}`;
    if (!terms.every((term) => haystack.includes(term))) return false;

    const score = terms.reduce(
      (total, term) =>
        total +
        (title.includes(term) ? 8 : 0) +
        (handle.includes(term) ? 5 : 0) +
        (tags.includes(term) ? 3 : 0) +
        (vendor.includes(term) ? 2 : 0) +
        (description.includes(term) ? 1 : 0),
      0
    );
    relevance.set(product.id, score);
    return true;
  });

  return { products: matches, relevance };
};

export const sortReviews = (reviews, sort = 'NEWEST') =>
  [...reviews].sort((left, right) => {
    switch (sort) {
      case 'OLDEST':
        return left.createdAt.localeCompare(right.createdAt);
      case 'HIGHEST_RATING':
        return (right.rating ?? 0) - (left.rating ?? 0);
      case 'LOWEST_RATING':
        return (left.rating ?? 0) - (right.rating ?? 0);
      case 'MOST_HELPFUL':
        return (right.metrics?.likeCount ?? 0) - (left.metrics?.likeCount ?? 0);
      case 'NEWEST':
      default:
        return right.createdAt.localeCompare(left.createdAt);
    }
  });

export const sortQuestions = (questions, sort = 'NEWEST') =>
  [...questions].sort((left, right) => {
    switch (sort) {
      case 'OLDEST':
        return left.createdAt.localeCompare(right.createdAt);
      case 'MOST_HELPFUL':
        return right.metrics.likeCount - left.metrics.likeCount;
      case 'MOST_ANSWERED':
        return right.metrics.childCount - left.metrics.childCount;
      case 'NEWEST':
      default:
        return right.createdAt.localeCompare(left.createdAt);
    }
  });

export const inferTypeName = (value) => {
  const match = /^gid:\/\/shopana\/([^/]+)\//u.exec(
    String(value?.id ?? value ?? '')
  );
  return match?.[1] ?? null;
};

export const checkoutError = (
  code,
  message,
  field = null,
  retryable = false
) => ({
  code,
  message,
  field,
  retryable,
});

export const orderError = (code, message, field = null, retryable = false) => ({
  code,
  message,
  field,
  retryable,
});

export const reviewError = (code, message, field = null) => ({
  code,
  message,
  field,
});
export const customerError = (
  code,
  message,
  field = null,
  retryable = false
) => ({
  code,
  message,
  field,
  retryable,
});

const COUNTRY_NAMES = {
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
};

export const formatAddress = (id, input = {}) =>
  postalAddress({
    id,
    firstName: input.firstName ?? '',
    lastName: input.lastName ?? '',
    company: input.company ?? null,
    address1: input.address1 ?? '',
    address2: input.address2 ?? null,
    city: input.city ?? '',
    province: input.province ?? input.provinceCode ?? '',
    provinceCode: input.provinceCode ?? null,
    country:
      input.country ??
      COUNTRY_NAMES[input.countryCode] ??
      input.countryCode ??
      '',
    countryCode: input.countryCode ?? null,
    zip: input.zip ?? '',
    phone: input.phone ?? null,
  });

export const createCheckoutLine = ({
  checkoutKey,
  position,
  variant,
  quantity,
  attributes = {},
  purchase,
  tag = null,
}) => {
  const unitPrice = Number(variant.price?.amount ?? 0);
  const compareAt = Number(
    variant.compareAtPrice?.amount ?? variant.price?.amount ?? 0
  );
  const currencyCode = variant.price?.currencyCode ?? 'USD';
  const subtotal = unitPrice * quantity;
  const tax = subtotal * 0.08;

  return {
    id: gid('CheckoutLine', `${checkoutKey}-${position}`),
    title: variant.title,
    sku: variant.sku,
    imageId: variant.featuredMediaId,
    quantity,
    cost: {
      compareAtUnitPrice: money(compareAt, currencyCode),
      unitPrice: money(unitPrice, currencyCode),
      discountAmount: money((compareAt - unitPrice) * quantity, currencyCode),
      subtotalAmount: money(subtotal, currencyCode),
      taxAmount: money(tax, currencyCode),
      totalAmount: money(subtotal + tax, currencyCode),
    },
    originalPrice: money(compareAt, currencyCode),
    priceConfig: null,
    children: [],
    parentId: null,
    componentItemId: null,
    purchasableId: variant.id,
    purchase: purchase ?? { type: 'ONE_TIME' },
    attributes: attributes ?? {},
    tag,
  };
};

const withoutFilter = (filters, key) =>
  filters.filter((filter) => filterKey(filter) !== key);

const optionSwatch = (facet, value) =>
  value.swatch
    ? {
        id: gid('FacetSwatch', `${facet.slug}-${value.handle}`),
        swatchType: value.swatch.type,
        colorOne: value.swatch.color ?? null,
        colorTwo: value.swatch.secondaryColor ?? null,
        metadata: value.swatch.metadata ?? null,
      }
    : null;

const facetValuesForProduct = (product, facet) => {
  if (facet.facetType === 'TAG') {
    return product.tags.map((tag) => ({
      id: tag.id,
      handle: tag.handle,
      label: tag.name,
      swatch: null,
    }));
  }
  if (facet.facetType === 'OPTION') {
    const option = product.options.find(
      ({ handle }) => normalizeText(handle) === normalizeText(facet.slug)
    );
    return (
      option?.optionValues.map((value) => ({
        id: value.id,
        handle: value.handle,
        label: value.name,
        swatch: optionSwatch(facet, value),
      })) ?? []
    );
  }
  if (facet.facetType === 'FEATURE') {
    const feature = product.features.find(
      ({ handle }) => normalizeText(handle) === normalizeText(facet.slug)
    );
    return (
      feature?.values.map((value) => ({
        id: value.id,
        handle: value.handle,
        label: value.name,
        swatch: null,
      })) ?? []
    );
  }
  return [];
};

const buildFacetFilter = (facet, scopeProducts, inputFilters, variantsById) => {
  const values = new Map();
  for (const product of scopeProducts) {
    for (const value of facetValuesForProduct(product, facet))
      values.set(value.handle, value);
  }
  if (!values.size) return null;

  const key = `facet:${normalizeText(facet.slug)}`;
  const isolatedFilters = withoutFilter(inputFilters, key);
  const selectedValues = new Set(
    inputFilters
      .filter((filter) => filterKey(filter) === key)
      .map(({ facet: selectedFacet }) => normalizeText(selectedFacet.value))
  );

  return {
    id: facet.slug,
    label: facet.label,
    type: 'LIST',
    facet,
    presentation: facet.presentation ?? 'TEXT',
    selectionMode: facet.selectionMode,
    priceRange: null,
    values: [...values.values()]
      .sort((left, right) => left.label.localeCompare(right.label, 'en'))
      .map((value, sortIndex) => {
        const input = { facet: { facet: facet.slug, value: value.handle } };
        return {
          id: `${facet.slug}:${value.handle}`,
          label: value.label,
          count: filterProducts(
            scopeProducts,
            [...isolatedFilters, input],
            variantsById
          ).length,
          selected:
            selectedValues.has(normalizeText(value.handle)) ||
            selectedValues.has(normalizeText(value.id)),
          input,
          facetValue: {
            id: gid('FacetValue', `${facet.slug}-${value.handle}`),
            facet,
            kind: 'SOURCE',
            handle: value.handle,
            label: value.label,
            swatch: value.swatch,
            sortIndex,
          },
          swatch: value.swatch,
        };
      }),
  };
};

export const buildListingFilters = (
  scopeProducts,
  inputFilters = [],
  variantsById,
  facets = []
) => {
  const availabilityFilters = withoutFilter(inputFilters, 'availability');
  const priceFilters = withoutFilter(inputFilters, 'price');
  const priceProducts = filterProducts(
    scopeProducts,
    priceFilters,
    variantsById
  );
  const prices = priceProducts.flatMap((product) => [
    Number(product.priceRange?.minVariantPrice?.amount ?? 0),
    Number(product.priceRange?.maxVariantPrice?.amount ?? 0),
  ]);
  const selectedPrice = inputFilters.find(({ price }) => price)?.price;
  const configuredFacets = facets.length
    ? facets
    : [
        {
          id: gid('Facet', 'tag'),
          facetType: 'TAG',
          slug: 'tag',
          label: 'Tags',
          uiType: 'CHECKBOX',
          selectionMode: 'MULTI',
          presentation: 'TEXT',
        },
      ];

  return [
    {
      id: 'availability',
      label: 'Availability',
      type: 'BOOLEAN',
      facet: null,
      presentation: 'TEXT',
      selectionMode: 'SINGLE',
      priceRange: null,
      values: [
        {
          id: 'availability:available',
          label: 'Available',
          count: filterProducts(
            scopeProducts,
            [...availabilityFilters, { availability: 'AVAILABLE' }],
            variantsById
          ).length,
          selected: inputFilters.some(
            ({ availability }) => availability === 'AVAILABLE'
          ),
          input: { availability: 'AVAILABLE' },
          facetValue: null,
          swatch: null,
        },
        {
          id: 'availability:unavailable',
          label: 'Unavailable',
          count: filterProducts(
            scopeProducts,
            [...availabilityFilters, { availability: 'UNAVAILABLE' }],
            variantsById
          ).length,
          selected: inputFilters.some(
            ({ availability }) => availability === 'UNAVAILABLE'
          ),
          input: { availability: 'UNAVAILABLE' },
          facetValue: null,
          swatch: null,
        },
      ],
    },
    ...configuredFacets
      .map((facet) =>
        buildFacetFilter(facet, scopeProducts, inputFilters, variantsById)
      )
      .filter(Boolean),
    {
      id: 'price',
      label: 'Price',
      type: 'PRICE_RANGE',
      facet: null,
      presentation: 'TEXT',
      selectionMode: 'SINGLE',
      priceRange: {
        min: money(prices.length ? Math.min(...prices) : 0),
        max: money(prices.length ? Math.max(...prices) : 0),
        selectedMin:
          selectedPrice?.min != null ? money(selectedPrice.min) : null,
        selectedMax:
          selectedPrice?.max != null ? money(selectedPrice.max) : null,
      },
      values: [],
    },
  ];
};
