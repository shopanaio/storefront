import { loyaltyAccount } from './loyalty.js';
import { promotionPresentation } from './promotions.js';
import {
  GraphQLError,
  getNamedType,
  isInterfaceType,
  isLeafType,
  isListType,
  isNonNullType,
  isObjectType,
  isUnionType,
} from 'graphql';

import { gid, money } from './fixture-helpers.js';
import {
  comparisonColumns,
  customerProductComparisons,
  productComparison,
} from './comparisons.js';
import {
  buildListingFilters,
  connection,
  filterProducts,
  inferTypeName,
  searchProducts,
  sortProducts,
  sortQuestions,
  sortReviews,
} from './helpers.js';
import {
  accountCheckout,
  canAccessCheckout,
  checkoutDisclosures,
  checkoutMutations,
  guestCheckoutEnabled,
} from './mutations/checkout.js';
import { comparisonMutations } from './mutations/comparisons.js';
import { customerOrderMutations } from './mutations/customer-orders.js';
import {
  reviewMutations,
  reviewStoreConfiguration,
} from './mutations/reviews.js';
import { defaultWishlist, wishlistMutations } from './mutations/wishlists.js';
import {
  contactRequestForm,
  storefrontFormMutations,
} from './mutations/storefront-forms.js';

const isListOutput = (type) =>
  isNonNullType(type) ? isListOutput(type.ofType) : isListType(type);

const ALIASES = {
  ancestors: 'ancestorIds',
  answers: 'answerIds',
  categories: 'categoryIds',
  checkoutLines: 'checkoutLineIds',
  children: 'childIds',
  defaultAddress: 'defaultAddressId',
  events: 'events',
  featuredMedia: 'featuredMediaId',
  lines: 'lineIds',
  media: 'mediaIds',
  options: 'options',
  replies: 'replyIds',
  returnRequests: 'returnRequestIds',
  variants: 'variantIds',
};

const propertySource = (parent, fieldName) => {
  for (const candidate of [
    fieldName,
    `${fieldName}Id`,
    `${fieldName}Ids`,
    ALIASES[fieldName],
  ]) {
    if (candidate && Object.hasOwn(parent, candidate)) return parent[candidate];
  }
  return undefined;
};

const hydrateValue = (store, value, namedType, outputType, args) => {
  if (value === null) return null;
  if (namedType.name.endsWith('Connection')) return connection(value, args);
  if (Array.isArray(value)) {
    if (!isListOutput(outputType) || isLeafType(namedType)) return value;
    return value
      .map((item) => (typeof item === 'string' ? store.get(item) : item))
      .filter((item) => item !== null);
  }
  if (
    (isObjectType(namedType) ||
      isInterfaceType(namedType) ||
      isUnionType(namedType)) &&
    typeof value === 'string'
  ) {
    return store.get(value);
  }
  return value;
};

const findContaining = (values, childId, childField) => {
  const contains = (items) => {
    return items.some(
      (item) => item.id === childId || contains(item.children ?? [])
    );
  };
  return (
    values.find((candidate) => contains(candidate[childField] ?? [])) ?? null
  );
};

const findParentItem = (menus, childId) => {
  const visit = (items) => {
    for (const item of items) {
      if (item.children.some(({ id }) => id === childId)) return item;
      const nested = visit(item.children);
      if (nested) return nested;
    }
    return null;
  };
  return visit(menus.flatMap(({ items }) => items));
};

const roundRating = (value) => Math.round(value * 10) / 10;

const ratingBreakdown = (reviews) => ({
  rating1Count: reviews.filter(({ rating }) => rating === 1).length,
  rating2Count: reviews.filter(({ rating }) => rating === 2).length,
  rating3Count: reviews.filter(({ rating }) => rating === 3).length,
  rating4Count: reviews.filter(({ rating }) => rating === 4).length,
  rating5Count: reviews.filter(({ rating }) => rating === 5).length,
});

const reviewsForProduct = (store, productId) =>
  store.state.reviews.filter(
    (review) => review.productId === productId && review.status === 'PUBLISHED'
  );

const questionsForProduct = (store, productId) =>
  store.state.productQuestions.filter(
    (question) =>
      question.productId === productId && question.status === 'PUBLISHED'
  );

const ratingCriteriaForProduct = (store, product) =>
  store.state.reviewRatingCriteria.filter(
    (criterion) =>
      criterion.isActive &&
      (criterion.appliesToAllProducts ||
        criterion.assignments.some(({ targetId, targetType }) =>
          targetType === 'PRODUCT'
            ? targetId === product.id
            : product.categoryIds.includes(targetId)
        ))
  );

const reviewSummary = (store, product) => {
  const reviews = reviewsForProduct(store, product.id);
  const averageRating = reviews.length
    ? roundRating(
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      )
    : 0;
  const criteria = ratingCriteriaForProduct(store, product).map((criterion) => {
    const values = reviews.flatMap((review) =>
      review.ratings.filter(({ criterionId }) => criterionId === criterion.id)
    );
    return {
      criterion,
      reviewCount: values.length,
      averageRating: values.length
        ? roundRating(
            values.reduce((sum, rating) => sum + rating.value, 0) /
              values.length
          )
        : 0,
      ratingBreakdown: ratingBreakdown(
        values.map(({ value }) => ({ rating: value }))
      ),
      updatedAt: reviews[0]?.updatedAt ?? store.initialNow,
    };
  });
  const byNewest = sortReviews(reviews);
  return {
    product,
    reviewCount: reviews.length,
    verifiedReviewCount: reviews.filter(
      ({ isVerifiedPurchase }) => isVerifiedPurchase
    ).length,
    mediaReviewCount: reviews.filter(({ mediaIds }) => mediaIds.length).length,
    averageRating,
    ratingBreakdown: ratingBreakdown(reviews),
    criteria,
    lastReviewedAt: byNewest[0]?.createdAt ?? null,
    updatedAt: byNewest[0]?.updatedAt ?? store.initialNow,
  };
};

const questionSummary = (store, product) => {
  const questions = questionsForProduct(store, product.id);
  const answered = questions.filter(({ answerIds }) => answerIds.length);
  const answers = answered.flatMap(({ answerIds }) =>
    answerIds.map((id) => store.get(id)).filter(Boolean)
  );
  const newestQuestion = sortQuestions(questions)[0];
  const newestAnswer = sortReviews(answers)[0];
  return {
    product,
    questionCount: questions.length,
    answeredQuestionCount: answered.length,
    unansweredQuestionCount: questions.length - answered.length,
    answerCount: answers.length,
    officialAnswerCount: answers.filter(({ isOfficial }) => isOfficial).length,
    lastQuestionAt: newestQuestion?.createdAt ?? null,
    lastAnsweredAt: newestAnswer?.createdAt ?? null,
    updatedAt:
      newestAnswer?.updatedAt ?? newestQuestion?.updatedAt ?? store.initialNow,
  };
};

const selectedVariant = (
  store,
  product,
  selectedOptions = [],
  availableFallback = false
) => {
  const variants = product.variantIds
    .map((id) => store.get(id))
    .filter(Boolean);
  const selected = selectedOptions.length
    ? variants.find((variant) =>
        selectedOptions.every((selection) =>
          variant.selectedOptions.some(
            (candidate) =>
              [candidate.name, candidate.option.handle].includes(
                selection.option
              ) &&
              [candidate.value, candidate.optionValue.handle].includes(
                selection.value
              )
          )
        )
      )
    : null;
  return (
    selected ??
    (availableFallback
      ? (variants.find(({ availableForSale }) => availableForSale) ??
        variants[0])
      : null) ??
    null
  );
};

const loyaltyBonusForPrice = (price, rateBasisPoints) =>
  money(
    (Number(price?.amount ?? 0) * rateBasisPoints) / 10_000,
    price?.currencyCode ?? 'USD'
  );

const loyaltyPresentation = (store, subject) => {
  const program = store.state.loyaltyProgram;
  if (!program || program.status !== 'ACTIVE') return null;
  const variants =
    subject.__typename === 'Product'
      ? subject.variantIds.map((id) => store.get(id)).filter(Boolean)
      : [subject];
  if (!variants.length) return null;
  const bonuses = variants.map(({ price }) =>
    loyaltyBonusForPrice(price, program.earnRateBasisPoints)
  );
  const currencyCode = bonuses[0].currencyCode;
  const minimum = money(
    Math.min(...bonuses.map(({ amount }) => Number(amount))),
    currencyCode
  );
  const maximum = money(
    Math.max(...bonuses.map(({ amount }) => Number(amount))),
    currencyCode
  );
  const bonus = new Intl.NumberFormat('uk', {
    style: 'currency',
    currency: currencyCode,
  }).format(Number(maximum.amount));
  const copy = {
    __typename: 'LoyaltyOpportunityCopy',
    // Like the program copy of the API: the value is the typed reward, not part of the text.
    headline: 'на бонусний рахунок',
    description:
      '10% від вартості товару буде зараховано після виконання замовлення.',
    badge: `+${bonus}`,
    accessibilityLabel: `${bonus} буде зараховано на бонусний рахунок`,
    terms: [],
  };
  const opportunity = {
    __typename: 'LoyaltyOpportunity',
    key: `mock-purchase-points:${subject.id}`,
    type: 'PURCHASE',
    state: 'AVAILABLE',
    reward: {
      __typename: 'LoyaltyMoneyRewardPresentation',
      kind: program.rewardKind,
      copy,
      amount: { __typename: 'LoyaltyMoneyRange', minimum, maximum },
      accuracy: 'EXACT',
    },
    presentation: copy,
    remainingUses: null,
    validUntil: null,
  };

  return {
    __typename: 'ProductLoyaltyPresentation',
    primaryOpportunity: opportunity,
    purchaseOpportunity: opportunity,
    reviewOpportunity: null,
    purchaseOpportunities: [opportunity],
    engagementOpportunities: [],
    evaluatedAt: store.initialNow,
    validUntil: null,
    revision: `mock-loyalty:${subject.id}`,
  };
};

const resolvedComponentConfiguration = (store, parentVariant, selections) => {
  const fixture = store.get(parentVariant.componentConfigurationId);
  if (!fixture) return null;

  const selectionByItemId =
    selections === undefined || selections === null
      ? null
      : new Map(selections.map((selection) => [selection.itemId, selection]));
  let componentsSubtotal = 0;

  const groups = fixture.groups.map((group) => {
    const explicitlySelectedIds =
      selectionByItemId === null
        ? null
        : group.items
            .filter(
              (item) => (selectionByItemId.get(item.id)?.quantity ?? 0) > 0
            )
            .slice(0, group.maxSelection ?? group.items.length)
            .map(({ id }) => id);
    const selectedIdSet =
      explicitlySelectedIds === null ? null : new Set(explicitlySelectedIds);

    return {
      ...group,
      items: group.items.map((item) => {
        const selection = selectionByItemId?.get(item.id);
        const selected =
          selectedIdSet === null
            ? item.defaultSelected
            : selectedIdSet.has(item.id);
        const requestedVariantId = selection?.variantId;
        const variantId =
          requestedVariantId &&
          item.allowedVariantIds.includes(requestedVariantId)
            ? requestedVariantId
            : item.defaultVariantId;
        const variant = store.get(variantId);
        const requestedQuantity = selected
          ? (selection?.quantity ?? item.minQuantity)
          : 0;
        const quantity = selected
          ? Math.max(
              item.minQuantity,
              Math.min(requestedQuantity, item.maxQuantity ?? requestedQuantity)
            )
          : 0;
        const sourceAmount = Number(variant?.price?.amount ?? 0);
        const unitAmount = sourceAmount * (1 - item.discountPercent / 100);
        const totalAmount = unitAmount * quantity;
        const currencyCode =
          variant?.price?.currencyCode ??
          parentVariant.price?.currencyCode ??
          'USD';
        componentsSubtotal += totalAmount;

        return {
          ...item,
          variantId,
          selected,
          availableForSale: Boolean(variant?.availableForSale),
          quantity,
          unitPrice: money(unitAmount, currencyCode),
          totalPrice: money(totalAmount, currencyCode),
        };
      }),
    };
  });

  const currencyCode = parentVariant.price?.currencyCode ?? 'USD';
  return {
    ...fixture,
    groups,
    componentsSubtotal: money(componentsSubtotal, currencyCode),
    totalPrice: money(
      Number(parentVariant.price?.amount ?? 0) + componentsSubtotal,
      currencyCode
    ),
  };
};

const validateFirst = (first) => {
  if (first !== undefined && first !== null && (first < 1 || first > 100)) {
    throw new GraphQLError('first must be between 1 and 100', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
};

const recommendationsForProduct = (store, product, fieldName, args) => {
  validateFirst(args.first);
  const fixture = store.state.productRecommendations.find(
    (candidate) => candidate.productId === product.id
  );
  const recommendations = (fixture?.[fieldName] ?? []).flatMap(
    (recommendation) => {
      const recommendedProduct = store.get(recommendation.productId);
      return recommendedProduct?.__typename === 'Product'
        ? [{ product: recommendedProduct, source: recommendation.source }]
        : [];
    }
  );

  return connection(recommendations, args);
};

/** Vendors with at least one product, ordered by name and id, as `Query.vendors`. */
const visibleVendors = (store) => {
  const vendorIds = new Set(
    store.state.products.map((product) => product.vendor?.id).filter(Boolean)
  );
  return store.state.vendors
    .filter((vendor) => vendorIds.has(vendor.id))
    .sort(
      (left, right) =>
        left.name.localeCompare(right.name) || left.id.localeCompare(right.id)
    );
};

const visibleVendor = (store, vendor) =>
  vendor?.__typename === 'Vendor' &&
  store.state.products.some((product) => product.vendor?.id === vendor.id)
    ? vendor
    : null;

/** Cart cross-sell: frequently bought together of the cart products, without the cart. */
const cartRecommendations = (store, { input, first = 8 }) => {
  if (first < 1 || first > 24)
    throw new GraphQLError('first must be between 1 and 24', {
      extensions: { code: 'BAD_USER_INPUT', field: ['first'] },
    });
  const productOf = (variantId) => store.get(store.get(variantId)?.productId);
  const anchors = input.lines
    .map((line) => productOf(line.purchasableId))
    .filter((product) => product?.__typename === 'Product');
  const excluded = new Set([
    ...anchors.map(({ id }) => id),
    ...input.lines.flatMap((line) =>
      (line.componentPurchasableIds ?? []).map((id) => productOf(id)?.id)
    ),
  ]);
  const items = new Map();
  for (const anchor of anchors.slice(0, 20)) {
    const fixture = store.state.productRecommendations.find(
      ({ productId }) => productId === anchor.id
    );
    for (const recommendation of fixture?.frequentlyBoughtTogether ?? []) {
      const product = store.get(recommendation.productId);
      if (product?.__typename !== 'Product' || excluded.has(product.id))
        continue;
      const item = items.get(product.id) ?? {
        product,
        source: recommendation.source,
        anchors: [],
      };
      if (item.anchors.length < 3) item.anchors.push(anchor);
      items.set(product.id, item);
    }
  }
  return {
    id: gid(
      'CartRecommendations',
      [...anchors.map(({ id }) => id), first].join('|')
    ),
    items: [...items.values()].slice(0, first),
  };
};

const productConnection = (store, source, args = {}, options = {}) => {
  validateFirst(args.first);
  const inputFilters = args.filters ?? [];
  const variantsById = new Map(
    store.state.productVariants.map((variant) => [variant.id, variant])
  );
  let products = source;
  let relevance = new Map();
  if (options.query)
    ({ products, relevance } = searchProducts(products, options.query));
  const scopeProducts = products;
  products = filterProducts(products, inputFilters, variantsById);
  const sort = args.sort ?? (options.query ? 'RELEVANCE' : 'NEWEST');
  products = sortProducts(products, sort, variantsById, relevance);
  const availableSorts = [
    ...(options.category ? ['MANUAL'] : []),
    ...(options.query ? ['RELEVANCE'] : []),
    'NEWEST',
    'CREATED_AT',
    'TITLE_ASC',
    'TITLE_DESC',
    'PRICE_ASC',
    'PRICE_DESC',
  ];
  return connection(products, args, {
    filters: buildListingFilters(
      scopeProducts,
      inputFilters,
      variantsById,
      store.state.facets
    ),
    sort,
    availableSorts,
  });
};

const contentViewerEngagement = (store, content, context) => {
  const viewerKey = context.customer?.id ?? 'anonymous-viewer';
  const vote = store.state.reviewContentVotes.find(
    (candidate) =>
      candidate.contentId === content.id && candidate.viewerKey === viewerKey
  );
  const report = store.state.reviewContentReports.find(
    (candidate) =>
      candidate.contentId === content.id &&
      candidate.viewerKey === viewerKey &&
      candidate.status === 'OPEN'
  );
  return { vote: vote?.type ?? null, hasReported: Boolean(report) };
};

const contentViewerCapabilities = (store, content, context) => {
  const owns = store.owns(context.customer, content);
  return {
    canUpdate: owns,
    canDelete: owns,
    editableUntil: owns
      ? new Date(Date.parse(content.createdAt) + 72 * 3_600_000).toISOString()
      : null,
  };
};

const absoluteAssetUrl = (value, request) => {
  if (typeof value !== 'string' || !value.startsWith('/')) return value;
  return new URL(value, request.url).href;
};

const localizedContent = (store, entity, locale) => {
  const requestedLocale = locale ?? store.state.store.defaultLocale;
  if (!store.state.store.locales.includes(requestedLocale)) return null;
  if (entity.content?.locale === requestedLocale) return entity.content;
  const translation = entity.translations?.find(
    (candidate) => candidate.locale === requestedLocale
  );
  // Without an explicit locale the store language is asked: untranslated content stays readable.
  return translation ?? (locale ? null : (entity.content ?? null));
};

const specialFields = (store) => ({
  'Image.url': (image, _args, context) =>
    absoluteAssetUrl(image.url, context.request),
  'OrderLine.imageUrl': (line, _args, context) =>
    absoluteAssetUrl(line.imageUrl, context.request),
  'OnlineStoreNavigationMenu.items': (menu, args) =>
    connection(menu.items, args),
  'OnlineStoreNavigationMenuItem.menu': (item) =>
    findContaining(store.state.navigationMenus, item.id, 'items'),
  'OnlineStoreNavigationMenuItem.parent': (item) =>
    findParentItem(store.state.navigationMenus, item.id),
  'OnlineStoreNavigationMenuItem.children': (item, args) =>
    connection(item.children, args),
  'OnlineStoreNavigationMenuItem.label': (item, { locale }) => {
    const requestedLocale = locale ?? store.state.store.defaultLocale;
    if (!store.state.store.locales.includes(requestedLocale)) return null;
    if (requestedLocale === item.sourceLocale) return item.sourceLabel;
    const translated = item.translations?.find(
      (translation) => translation.locale === requestedLocale
    )?.label;
    // Without an explicit locale the store language is asked: untranslated labels stay readable.
    return translated ?? (locale ? null : item.sourceLabel);
  },
  'OnlineStorePage.content': (page, { locale }) =>
    localizedContent(store, page, locale),
  'OnlineStoreNavigationTarget.resource': (target) =>
    store.get(target.resourceId),
  'OnlineStoreOpenGraphMetadata.image': (metadata) =>
    store.get(metadata.imageId),
  'OpenGraphMetadata.image': (metadata) => store.get(metadata.imageId),

  'Category.parent': (category) => store.get(category.parentId),
  'Category.ancestors': (category) =>
    category.ancestorIds.map((id) => store.get(id)).filter(Boolean),
  'Category.children': (category, args) =>
    connection(
      category.childIds.map((id) => store.get(id)).filter(Boolean),
      args
    ),
  'Category.media': (category, args) =>
    connection(
      category.mediaIds.map((id) => store.get(id)).filter(Boolean),
      args
    ),
  'Category.featuredMedia': (category) => store.get(category.featuredMediaId),
  'Category.products': (category, args) => {
    const products = store.state.products.filter(({ categoryIds }) =>
      categoryIds.includes(category.id)
    );
    return productConnection(store, products, args, {
      category: true,
      query: args.query,
    });
  },

  'Collection.media': (collection, args) =>
    connection(
      (collection.mediaIds ?? []).map((id) => store.get(id)),
      args
    ),
  'Collection.featuredMedia': (collection) =>
    store.get(collection.featuredMediaId),
  'Collection.products': (collection, args) =>
    productConnection(
      store,
      (collection.productIds ?? []).map((id) => store.get(id)).filter(Boolean),
      args
    ),

  'Vendor.products': (vendor, args) =>
    productConnection(
      store,
      store.state.products.filter(
        (product) => product.vendor?.id === vendor.id
      ),
      args,
      { query: args.query }
    ),
  // Products embed `{ id, name }`; the vendor record carries handle, logo and SEO.
  'Product.vendor': (product) =>
    product.vendor
      ? (store.find('Vendor', ({ id }) => id === product.vendor.id) ?? {
          handle: product.vendor.id,
          seo: { title: product.vendor.name, description: null },
          ...product.vendor,
          __typename: 'Vendor',
        })
      : null,
  'ProductVariant.promotions': (variant) =>
    promotionPresentation(store, { variant }),

  'Product.primaryCategory': (product) => store.get(product.primaryCategoryId),
  'Product.comparison': (product, _args, context) =>
    productComparison(store, product, context.customer),
  'Product.categories': (product, args) =>
    connection(
      product.categoryIds.map((id) => store.get(id)).filter(Boolean),
      args
    ),
  'Product.media': (product, args) =>
    connection(
      product.mediaIds.map((id) => store.get(id)).filter(Boolean),
      args
    ),
  'Product.featuredMedia': (product) => store.get(product.featuredMediaId),
  'Product.variants': (product, args) =>
    connection(
      product.variantIds.map((id) => store.get(id)).filter(Boolean),
      args
    ),
  'Product.variantBySelectedOptions': (product, { selectedOptions }) =>
    selectedVariant(store, product, selectedOptions),
  'Product.selectedOrFirstAvailableVariant': (product, { selectedOptions }) =>
    selectedVariant(store, product, selectedOptions, true),
  'Product.loyalty': (product) => loyaltyPresentation(store, product),
  'Product.relatedProducts': (product, args) =>
    recommendationsForProduct(store, product, 'relatedProducts', args),
  'Product.frequentlyBoughtTogether': (product, args) =>
    recommendationsForProduct(store, product, 'frequentlyBoughtTogether', args),
  'Product.reviews': (product, args) => {
    let reviews = reviewsForProduct(store, product.id);
    if (args.rating)
      reviews = reviews.filter(({ rating }) => rating === args.rating);
    if (args.verifiedOnly)
      reviews = reviews.filter(({ isVerifiedPurchase }) => isVerifiedPurchase);
    if (args.withMediaOnly)
      reviews = reviews.filter(({ mediaIds }) => mediaIds.length);
    return connection(sortReviews(reviews, args.sort), args);
  },
  'Product.reviewSummary': (product) => reviewSummary(store, product),
  'Product.reviewRatingCriteria': (product, args) =>
    connection(ratingCriteriaForProduct(store, product), args),
  'Product.questions': (product, args) => {
    let questions = questionsForProduct(store, product.id);
    if (args.answered !== null && args.answered !== undefined) {
      questions = questions.filter(
        ({ answerIds }) => Boolean(answerIds.length) === args.answered
      );
    }
    return connection(sortQuestions(questions, args.sort), args);
  },
  'Product.questionSummary': (product) => questionSummary(store, product),

  'ProductVariant.product': (variant) => store.get(variant.productId),
  'ProductVariant.media': (variant, args) =>
    connection(
      variant.mediaIds.map((id) => store.get(id)).filter(Boolean),
      args
    ),
  'ProductVariant.featuredMedia': (variant) =>
    store.get(variant.featuredMediaId),
  'ProductVariant.componentConfiguration': (variant, { selections }) =>
    resolvedComponentConfiguration(store, variant, selections),
  'ProductVariant.loyalty': (variant) => loyaltyPresentation(store, variant),
  'ProductVariant.reviews': (variant, args) =>
    connection(
      sortReviews(
        store.state.reviews.filter(
          (review) =>
            review.variantId === variant.id && review.status === 'PUBLISHED'
        ),
        args.sort
      ),
      args
    ),
  'ProductVariant.questions': (variant, args) =>
    connection(
      sortQuestions(
        store.state.productQuestions.filter(
          (question) =>
            question.variantId === variant.id && question.status === 'PUBLISHED'
        ),
        args.sort
      ),
      args
    ),
  'InventoryItem.variant': (item) => store.get(item.variantId),
  'SelectedOption.option': (selection) =>
    store.get(selection.option?.id) ?? selection.option,
  'SelectedOption.optionValue': (selection) =>
    store.get(selection.optionValue?.id) ?? selection.optionValue,

  'CheckoutCustomerIdentity.customer': (identity) =>
    store.get(identity.customerId),
  'Checkout.guestCheckoutAllowed': (_checkout, _args, context) =>
    Boolean(context.customer) || guestCheckoutEnabled(),
  'Checkout.disclosures': (checkout) => checkoutDisclosures(store, checkout),
  'Customer.checkout': (customer, _args, context) =>
    context.customer?.id === customer.id
      ? accountCheckout(store, customer)
      : null,
  'CheckoutLine.image': (line) => store.get(line.imageId),
  'CheckoutLine.parent': (line) => store.get(line.parentId),
  'CheckoutLine.purchasable': (line) => store.get(line.purchasableId),
  'CheckoutDeliveryGroup.checkoutLines': (group) =>
    group.checkoutLineIds.map((id) => store.get(id)).filter(Boolean),
  'CheckoutDeliveryGroup.shipping': ({ selection, freeShipping }) =>
    selection.option
      ? {
          paymentModel: selection.option.paymentModel,
          originalPrice: selection.option.cost,
          payer: 'MERCHANT',
          total: freeShipping
            ? money(0, selection.option.cost.currencyCode)
            : selection.option.cost,
          freeShipping: freeShipping ?? null,
        }
      : null,

  'Customer.defaultAddress': (customer) => store.get(customer.defaultAddressId),
  'Customer.loyaltyAccount': (customer) => loyaltyAccount(store, customer),
  'Customer.productComparisons': (customer) =>
    customerProductComparisons(store, customer),
  'Customer.defaultWishlist': (customer) => defaultWishlist(customer),
  'Customer.wishlist': (customer, { id }) =>
    customer.wishlists.find((wishlist) => wishlist.id === id) ?? null,
  'Customer.orders': (customer, args) => {
    let orders = customer.orderIds.map((id) => store.get(id)).filter(Boolean);
    if (args.statuses?.length)
      orders = orders.filter(({ status }) => args.statuses.includes(status));
    return connection(orders, args);
  },
  'Customer.reviews': (customer, args) =>
    connection(
      sortReviews(
        store.state.reviews.filter(
          (review) => review.author.customerId === customer.id
        ),
        args.sort
      ),
      args
    ),
  'Customer.productQuestions': (customer, args) =>
    connection(
      sortQuestions(
        store.state.productQuestions.filter(
          (question) => question.author.customerId === customer.id
        ),
        args.sort
      ),
      args
    ),
  'Customer.reviewRequests': (customer, args) =>
    connection(
      store.state.reviewRequests.filter(
        (request) => request.customerId === customer.id
      ),
      args
    ),

  'ProductComparison.category': (comparison) =>
    store.get(comparison.categoryId),
  'ProductComparison.columns': (comparison, args) =>
    comparisonColumns(store, comparison, args),

  'OrderCustomerIdentity.customer': (identity) =>
    store.get(identity.customerId),
  'OrderDeliveryGroup.lines': (group) =>
    group.lineIds.map((id) => store.get(id)).filter(Boolean),
  'OrderFulfillmentLine.orderLine': (line) => store.get(line.orderLineId),
  'OrderRefundLine.orderLine': (line) => store.get(line.orderLineId),
  'Order.returnRequests': (order, args) =>
    connection(
      order.returnRequestIds.map((id) => store.get(id)).filter(Boolean),
      args
    ),
  'OrderReturnRequest.order': (request) => store.get(request.orderId),
  'OrderReturnRequestLine.orderLine': (line) => store.get(line.orderLineId),

  'Store.policies': () => store.all('StorePolicy'),
  'StoreBrand.logo': (brand) => store.get(brand.logoId),
  'StoreBrand.squareLogo': (brand) => store.get(brand.squareLogoId),
  'StoreBrand.coverImage': (brand) => store.get(brand.coverImageId),

  'ReviewContentAuthor.customer': (author) => store.get(author.customerId),
  'ReviewRating.criterion': (rating) => store.get(rating.criterionId),
  'ReviewRatingCriterionAssignment.criterion': (assignment) =>
    store.get(assignment.criterionId),
  'ReviewRatingCriterionAssignment.target': (assignment) =>
    store.get(assignment.targetId),
  'Review.product': (review) => store.get(review.productId),
  'Review.variant': (review) => store.get(review.variantId),
  'Review.media': (review) =>
    review.mediaIds.map((id) => store.get(id)).filter(Boolean),
  'Review.replies': (review, args) =>
    connection(
      review.replyIds.map((id) => store.get(id)).filter(Boolean),
      args
    ),
  'ReviewMedia.review': (media) => store.get(media.reviewId),
  'ReviewMedia.media': (media) => store.get(media.mediaId),
  'ReviewReply.review': (reply) => store.get(reply.reviewId),
  'ProductQuestion.product': (question) => store.get(question.productId),
  'ProductQuestion.variant': (question) => store.get(question.variantId),
  'ProductQuestion.answers': (question, args, context) =>
    connection(
      sortQuestions(
        question.answerIds
          .map((id) => store.get(id))
          .filter(
            (answer) =>
              answer &&
              (answer.status === 'PUBLISHED' ||
                store.owns(context.customer, answer))
          ),
        args.sort
      ),
      args
    ),
  'ProductQuestion.viewerSubscription': (question, _, context) =>
    store.state.productQuestionSubscriptions.find(
      (subscription) =>
        subscription.questionId === question.id &&
        subscription.subscriberCustomerId === context.customer?.id
    ) ?? null,
  'ProductQuestionAnswer.question': (answer) => store.get(answer.questionId),
  'ProductQuestionSubscription.question': (subscription) =>
    store.get(subscription.questionId),
  'ProductQuestionSubscription.subscriberCustomer': (subscription) =>
    store.get(subscription.subscriberCustomerId),
  'ReviewRequest.customer': (request) => store.get(request.customerId),
  'ReviewRequest.product': (request) => store.get(request.productId),
  'ReviewRequest.variant': (request) => store.get(request.variantId),
  'ReviewRequest.review': (request) => store.get(request.reviewId),
  'ReviewRequest.events': (request, args) => connection(request.events, args),
  'ReviewRequestEvent.reviewRequest': (event) =>
    store.state.reviewRequests.find((request) =>
      request.events.some(({ id }) => id === event.id)
    ),
  'ReviewContentVote.content': (vote) => store.get(vote.contentId),
  'ReviewContentVote.voterCustomer': (vote) => store.get(vote.voterCustomerId),
  'ReviewContentReport.content': (report) => store.get(report.contentId),
  'ReviewContentReport.reporterCustomer': (report) =>
    store.get(report.reporterCustomerId),

  ...Object.fromEntries(
    [
      'Review',
      'ReviewReply',
      'ProductQuestion',
      'ProductQuestionAnswer',
    ].flatMap((typeName) => [
      [
        `${typeName}.viewerEngagement`,
        (content, _, context) =>
          contentViewerEngagement(store, content, context),
      ],
      [
        `${typeName}.viewerCapabilities`,
        (content, _, context) =>
          contentViewerCapabilities(store, content, context),
      ],
    ])
  ),
});

const queryResolvers = (store) => ({
  headlessStorefrontAccess: () => true,
  onlineStorePage: (_, { id }) =>
    store.get(id)?.__typename === 'OnlineStorePage' ? store.get(id) : null,
  onlineStorePageByHandle: (_, { handle }) =>
    store.byHandle('OnlineStorePage', handle),
  onlineStorePages: (_, args) => connection(store.state.pages, args),
  onlineStoreNavigationMenu: (_, { id }) =>
    store.get(id)?.__typename === 'OnlineStoreNavigationMenu'
      ? store.get(id)
      : null,
  onlineStoreNavigationMenuByHandle: (_, { handle }) =>
    store.byHandle('OnlineStoreNavigationMenu', handle),
  onlineStoreNavigationMenus: (_, args) =>
    connection(store.state.navigationMenus, args),
  node: (_, { id }, __, info) => {
    const entity = store.get(id);
    const allowed = new Set(
      info.schema
        .getPossibleTypes(info.schema.getType('Node'))
        .map(({ name }) => name)
    );
    return entity && allowed.has(entity.__typename) ? entity : null;
  },
  nodes: (_, { ids }, __, info) => {
    const allowed = new Set(
      info.schema
        .getPossibleTypes(info.schema.getType('Node'))
        .map(({ name }) => name)
    );
    return ids.map((id) => {
      const entity = store.get(id);
      return entity && allowed.has(entity.__typename) ? entity : null;
    });
  },
  product: (_, { id }) =>
    store.get(id)?.__typename === 'Product' ? store.get(id) : null,
  productByHandle: (_, { handle }) => store.byHandle('Product', handle),
  productVariant: (_, { id }) =>
    store.get(id)?.__typename === 'ProductVariant' ? store.get(id) : null,
  category: (_, { id }) =>
    store.get(id)?.__typename === 'Category' ? store.get(id) : null,
  categoryByHandle: (_, { handle }) => store.byHandle('Category', handle),
  collection: (_, { id }) =>
    store.get(id)?.__typename === 'Collection' ? store.get(id) : null,
  collectionByHandle: (_, { handle }) => store.byHandle('Collection', handle),
  categories: (_, args) => connection(store.state.categories, args),
  vendor: (_, { id }) => visibleVendor(store, store.get(id)),
  vendorByHandle: (_, { handle }) =>
    visibleVendor(store, store.byHandle('Vendor', handle)),
  vendors: (_, args) => connection(visibleVendors(store), args),
  cartRecommendations: (_, args) => cartRecommendations(store, args),
  storefrontPromotions: (_, { kinds }) =>
    promotionPresentation(store, { kinds }),
  contactRequestForm: () => contactRequestForm(store),
  checkout: (_, { id }, context) => {
    const checkout = store.get(id);
    return checkout?.__typename === 'Checkout' &&
      canAccessCheckout(checkout, context.customer)
      ? checkout
      : null;
  },
  checkoutSettings: () => ({ guestCheckoutEnabled: guestCheckoutEnabled() }),
  checkoutPlacement: (_, { id }) =>
    store.state.checkoutPlacements.find(
      (placement) => placement.placementId === id || placement.checkoutId === id
    ) ?? null,
  customer: (_, __, context) => context.customer,
  products: (_, args) => productConnection(store, store.state.products, args),
  searchProducts: (_, args) => {
    if (!String(args.query).trim())
      throw new GraphQLError('query must not be empty', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    return productConnection(store, store.state.products, args, {
      query: args.query,
    });
  },
  _media: () => true,
  order: (_, { id }, context) => {
    const order = store.get(id);
    return store.owns(context.customer, order) ? order : null;
  },
  orderReturnRequest: (_, { id }, context) => {
    const request = store.get(id);
    const order = request && store.get(request.orderId);
    return store.owns(context.customer, order) ? request : null;
  },
  store: () => store.state.store,
  storePolicy: (_, { handle }) => store.byHandle('StorePolicy', handle),
  reviewStoreConfiguration: () => reviewStoreConfiguration(store),
  review: (_, { id }, context) =>
    visibleReviewContent(store, id, 'Review', context),
  productQuestion: (_, { id }, context) =>
    visibleReviewContent(store, id, 'ProductQuestion', context),
  reviewReply: (_, { id }, context) =>
    visibleReviewContent(store, id, 'ReviewReply', context),
  productQuestionAnswer: (_, { id }, context) =>
    visibleReviewContent(store, id, 'ProductQuestionAnswer', context),
  reviewRequest: (_, { id }, context) => {
    const request = store.get(id);
    return request?.__typename === 'ReviewRequest' &&
      request.customerId === context.customer?.id
      ? request
      : null;
  },
});

const visibleReviewContent = (store, id, typeName, context) => {
  const content = store.get(id);
  return content?.__typename === typeName &&
    (content.status === 'PUBLISHED' || store.owns(context.customer, content))
    ? content
    : null;
};

const mutationResolvers = (store) => ({
  _catalog: () => true,
  _listing: () => true,
  _media: () => true,
  ...checkoutMutations(store),
  ...comparisonMutations(store),
  ...customerOrderMutations(store),
  ...reviewMutations(store),
  ...wishlistMutations(store),
  ...storefrontFormMutations(store),
});

const reviewKindType = {
  REVIEW: 'Review',
  REVIEW_REPLY: 'ReviewReply',
  PRODUCT_QUESTION: 'ProductQuestion',
  QUESTION_ANSWER: 'ProductQuestionAnswer',
};

const abstractType = (value, abstractTypeName) => {
  if (abstractTypeName === 'ReviewContent')
    return reviewKindType[value.kind] ?? value.__typename ?? null;
  if (abstractTypeName === 'DisplayableError') {
    if (Object.hasOwn(value, 'retryable'))
      return value.code?.startsWith('CHECKOUT')
        ? 'CheckoutUserError'
        : 'OrderUserError';
    return 'UserError';
  }
  return value.__typename ?? inferTypeName(value) ?? null;
};

export const applyResolvers = (schema, store) => {
  const specials = specialFields(store);
  const query = queryResolvers(store);
  const mutation = mutationResolvers(store);

  for (const type of Object.values(schema.getTypeMap())) {
    if (type.name.startsWith('__')) continue;
    if (isInterfaceType(type) || isUnionType(type)) {
      type.resolveType = (value) => abstractType(value, type.name);
    }
    if (!isObjectType(type)) continue;

    for (const field of Object.values(type.getFields())) {
      if (type.name === 'Query' && query[field.name]) {
        field.resolve = query[field.name];
        continue;
      }
      if (type.name === 'Mutation' && mutation[field.name]) {
        field.resolve = mutation[field.name];
        continue;
      }
      const special = specials[`${type.name}.${field.name}`];
      if (special) {
        field.resolve = special;
        continue;
      }
      field.resolve = (parent, args) => {
        const source = propertySource(parent, field.name);
        if (source === undefined) {
          if (isListOutput(field.type)) return [];
          return null;
        }
        return hydrateValue(
          store,
          source,
          getNamedType(field.type),
          field.type,
          args
        );
      };
    }
  }

  return schema;
};

export const createContext =
  (store, applicationAuthStore) =>
  async ({ request }) => {
    const authorization = request.headers.get('authorization')?.trim();
    const bearerToken = authorization?.startsWith('Bearer ')
      ? authorization.slice(7).trim()
      : null;
    const customer = authorization
      ? bearerToken
        ? applicationAuthStore.resolveCustomer(bearerToken)
        : null
      : store.currentCustomer(request);

    return { request, store, customer };
  };
