import {
  GraphQLError,
  getNamedType,
  isInterfaceType,
  isListType,
  isNonNullType,
  isObjectType,
  isUnionType,
} from "graphql";

import { gid, money } from "./fixture-helpers.js";
import {
  buildListingFilters,
  connection,
  filterProducts,
  inferTypeName,
  searchProducts,
  sortProducts,
  sortQuestions,
  sortReviews,
} from "./helpers.js";
import { checkoutMutations } from "./mutations/checkout.js";
import { customerOrderMutations } from "./mutations/customer-orders.js";
import { reviewMutations } from "./mutations/reviews.js";

const isListOutput = (type) => isNonNullType(type) ? isListOutput(type.ofType) : isListType(type);

const ALIASES = {
  ancestors: "ancestorIds",
  answers: "answerIds",
  categories: "categoryIds",
  checkoutLines: "checkoutLineIds",
  children: "childIds",
  defaultAddress: "defaultAddressId",
  events: "events",
  featuredMedia: "featuredMediaId",
  lines: "lineIds",
  markets: "marketIds",
  media: "mediaIds",
  options: "options",
  replies: "replyIds",
  returnRequests: "returnRequestIds",
  variants: "variantIds",
};

const propertySource = (parent, fieldName) => {
  for (const candidate of [fieldName, `${fieldName}Id`, `${fieldName}Ids`, ALIASES[fieldName]]) {
    if (candidate && Object.hasOwn(parent, candidate)) return parent[candidate];
  }
  return undefined;
};

const hydrateValue = (store, value, namedType, outputType, args) => {
  if (value === null) return null;
  if (namedType.name.endsWith("Connection")) return connection(value, args);
  if (Array.isArray(value)) {
    if (!isListOutput(outputType)) return value;
    return value.map((item) => typeof item === "string" ? store.get(item) : item).filter((item) => item !== null);
  }
  if ((isObjectType(namedType) || isInterfaceType(namedType) || isUnionType(namedType)) && typeof value === "string") {
    return store.get(value);
  }
  return value;
};

const findContaining = (values, childId, childField) => {
  const contains = (items) => {
    return items.some((item) => item.id === childId || contains(item.children ?? []));
  };
  return values.find((candidate) => contains(candidate[childField] ?? [])) ?? null;
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

const reviewsForProduct = (store, productId) => store.state.reviews
  .filter((review) => review.productId === productId && review.status === "PUBLISHED");

const questionsForProduct = (store, productId) => store.state.productQuestions
  .filter((question) => question.productId === productId && question.status === "PUBLISHED");

const ratingCriteriaForProduct = (store, product) => store.state.reviewRatingCriteria.filter((criterion) =>
  criterion.isActive && (criterion.appliesToAllProducts
    || criterion.assignments.some(({ targetId, targetType }) => targetType === "PRODUCT"
      ? targetId === product.id
      : product.categoryIds.includes(targetId))));

const reviewSummary = (store, product) => {
  const reviews = reviewsForProduct(store, product.id);
  const averageRating = reviews.length
    ? roundRating(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length)
    : 0;
  const criteria = ratingCriteriaForProduct(store, product).map((criterion) => {
    const values = reviews.flatMap((review) => review.ratings.filter(({ criterionId }) => criterionId === criterion.id));
    return {
      criterion,
      reviewCount: values.length,
      averageRating: values.length
        ? roundRating(values.reduce((sum, rating) => sum + rating.value, 0) / values.length)
        : 0,
      ratingBreakdown: ratingBreakdown(values.map(({ value }) => ({ rating: value }))),
      updatedAt: reviews[0]?.updatedAt ?? store.initialNow,
    };
  });
  const byNewest = sortReviews(reviews);
  return {
    product,
    reviewCount: reviews.length,
    verifiedReviewCount: reviews.filter(({ isVerifiedPurchase }) => isVerifiedPurchase).length,
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
  const answers = answered.flatMap(({ answerIds }) => answerIds.map((id) => store.get(id)).filter(Boolean));
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
    updatedAt: newestAnswer?.updatedAt ?? newestQuestion?.updatedAt ?? store.initialNow,
  };
};

const selectedVariant = (store, product, selectedOptions = [], availableFallback = false) => {
  const variants = product.variantIds.map((id) => store.get(id)).filter(Boolean);
  const selected = selectedOptions.length ? variants.find((variant) => selectedOptions.every((selection) =>
    variant.selectedOptions.some((candidate) =>
      [candidate.name, candidate.option.handle].includes(selection.option)
      && [candidate.value, candidate.optionValue.handle].includes(selection.value)))) : null;
  return selected ?? (availableFallback ? variants.find(({ availableForSale }) => availableForSale) ?? variants[0] : null) ?? null;
};

const resolvedComponentConfiguration = (store, parentVariant, selections) => {
  const fixture = store.get(parentVariant.componentConfigurationId);
  if (!fixture) return null;

  const selectionByItemId = selections === undefined || selections === null
    ? null
    : new Map(selections.map((selection) => [selection.itemId, selection]));
  let componentsSubtotal = 0;

  const groups = fixture.groups.map((group) => {
    const explicitlySelectedIds = selectionByItemId === null
      ? null
      : group.items
        .filter((item) => (selectionByItemId.get(item.id)?.quantity ?? 0) > 0)
        .slice(0, group.maxSelection ?? group.items.length)
        .map(({ id }) => id);
    const selectedIdSet = explicitlySelectedIds === null ? null : new Set(explicitlySelectedIds);

    return {
      ...group,
      items: group.items.map((item) => {
        const selection = selectionByItemId?.get(item.id);
        const selected = selectedIdSet === null ? item.defaultSelected : selectedIdSet.has(item.id);
        const requestedVariantId = selection?.variantId;
        const variantId = requestedVariantId && item.allowedVariantIds.includes(requestedVariantId)
          ? requestedVariantId
          : item.defaultVariantId;
        const variant = store.get(variantId);
        const requestedQuantity = selected ? (selection?.quantity ?? item.minQuantity) : 0;
        const quantity = selected
          ? Math.max(item.minQuantity, Math.min(requestedQuantity, item.maxQuantity ?? requestedQuantity))
          : 0;
        const sourceAmount = Number(variant?.price?.amount ?? 0);
        const unitAmount = sourceAmount * (1 - item.discountPercent / 100);
        const totalAmount = unitAmount * quantity;
        const currencyCode = variant?.price?.currencyCode ?? parentVariant.price?.currencyCode ?? "USD";
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

  const currencyCode = parentVariant.price?.currencyCode ?? "USD";
  return {
    ...fixture,
    groups,
    componentsSubtotal: money(componentsSubtotal, currencyCode),
    totalPrice: money(Number(parentVariant.price?.amount ?? 0) + componentsSubtotal, currencyCode),
  };
};

const validateFirst = (first) => {
  if (first !== undefined && first !== null && (first < 1 || first > 100)) {
    throw new GraphQLError("first must be between 1 and 100", { extensions: { code: "BAD_USER_INPUT" } });
  }
};

const productConnection = (store, source, args = {}, options = {}) => {
  validateFirst(args.first);
  const inputFilters = args.filters ?? [];
  const variantsById = new Map(store.state.productVariants.map((variant) => [variant.id, variant]));
  let products = source;
  let relevance = new Map();
  if (options.query) ({ products, relevance } = searchProducts(products, options.query));
  products = filterProducts(products, inputFilters, variantsById);
  const sort = args.sort ?? (options.query ? "RELEVANCE" : "NEWEST");
  products = sortProducts(products, sort, variantsById, relevance);
  const availableSorts = [
    ...(options.category ? ["MANUAL"] : []),
    ...(options.query ? ["RELEVANCE"] : []),
    "NEWEST", "CREATED_AT", "TITLE_ASC", "TITLE_DESC", "PRICE_ASC", "PRICE_DESC",
  ];
  return connection(products, args, {
    filters: buildListingFilters(products, source, inputFilters),
    sort,
    availableSorts,
  });
};

const contentViewerEngagement = (store, content, context) => {
  const viewerKey = context.customer?.id ?? "anonymous-viewer";
  const vote = store.state.reviewContentVotes.find((candidate) =>
    candidate.contentId === content.id && candidate.viewerKey === viewerKey);
  const report = store.state.reviewContentReports.find((candidate) =>
    candidate.contentId === content.id && candidate.viewerKey === viewerKey && candidate.status === "OPEN");
  return { vote: vote?.type ?? null, hasReported: Boolean(report) };
};

const contentViewerCapabilities = (store, content, context) => {
  const owns = store.owns(context.customer, content);
  return {
    canUpdate: owns,
    canDelete: owns,
    editableUntil: owns ? new Date(Date.parse(content.createdAt) + 72 * 3_600_000).toISOString() : null,
  };
};

const absoluteAssetUrl = (value, request) => {
  if (typeof value !== "string" || !value.startsWith("/")) return value;
  return new URL(value, request.url).href;
};

const specialFields = (store) => ({
  "Image.url": (image, _args, context) => absoluteAssetUrl(image.url, context.request),
  "OrderLine.imageUrl": (line, _args, context) => absoluteAssetUrl(line.imageUrl, context.request),
  "OnlineStoreNavigationMenu.items": (menu, args) => connection(menu.items, args),
  "OnlineStoreNavigationMenuItem.menu": (item) => findContaining(store.state.navigationMenus, item.id, "items"),
  "OnlineStoreNavigationMenuItem.parent": (item) => findParentItem(store.state.navigationMenus, item.id),
  "OnlineStoreNavigationMenuItem.children": (item, args) => connection(item.children, args),
  "OnlineStoreNavigationTarget.resource": (target) => store.get(target.resourceId),
  "OnlineStoreOpenGraphMetadata.image": (metadata) => store.get(metadata.imageId),
  "OpenGraphMetadata.image": (metadata) => store.get(metadata.imageId),

  "Category.parent": (category) => store.get(category.parentId),
  "Category.ancestors": (category) => category.ancestorIds.map((id) => store.get(id)).filter(Boolean),
  "Category.children": (category, args) => connection(category.childIds.map((id) => store.get(id)).filter(Boolean), args),
  "Category.media": (category, args) => connection(category.mediaIds.map((id) => store.get(id)).filter(Boolean), args),
  "Category.featuredMedia": (category) => store.get(category.featuredMediaId),
  "Category.products": (category, args) => {
    const products = store.state.products.filter(({ categoryIds }) => categoryIds.includes(category.id));
    return productConnection(store, products, args, { category: true, query: args.query });
  },

  "Product.primaryCategory": (product) => store.get(product.primaryCategoryId),
  "Product.categories": (product, args) => connection(product.categoryIds.map((id) => store.get(id)).filter(Boolean), args),
  "Product.media": (product, args) => connection(product.mediaIds.map((id) => store.get(id)).filter(Boolean), args),
  "Product.featuredMedia": (product) => store.get(product.featuredMediaId),
  "Product.variants": (product, args) => connection(product.variantIds.map((id) => store.get(id)).filter(Boolean), args),
  "Product.variantBySelectedOptions": (product, { selectedOptions }) => selectedVariant(store, product, selectedOptions),
  "Product.selectedOrFirstAvailableVariant": (product, { selectedOptions }) => selectedVariant(store, product, selectedOptions, true),
  "Product.reviews": (product, args) => {
    let reviews = reviewsForProduct(store, product.id);
    if (args.rating) reviews = reviews.filter(({ rating }) => rating === args.rating);
    if (args.verifiedOnly) reviews = reviews.filter(({ isVerifiedPurchase }) => isVerifiedPurchase);
    if (args.withMediaOnly) reviews = reviews.filter(({ mediaIds }) => mediaIds.length);
    return connection(sortReviews(reviews, args.sort), args);
  },
  "Product.reviewSummary": (product) => reviewSummary(store, product),
  "Product.reviewRatingCriteria": (product, args) => connection(ratingCriteriaForProduct(store, product), args),
  "Product.questions": (product, args) => {
    let questions = questionsForProduct(store, product.id);
    if (args.answered !== null && args.answered !== undefined) {
      questions = questions.filter(({ answerIds }) => Boolean(answerIds.length) === args.answered);
    }
    return connection(sortQuestions(questions, args.sort), args);
  },
  "Product.questionSummary": (product) => questionSummary(store, product),

  "ProductVariant.product": (variant) => store.get(variant.productId),
  "ProductVariant.media": (variant, args) => connection(variant.mediaIds.map((id) => store.get(id)).filter(Boolean), args),
  "ProductVariant.featuredMedia": (variant) => store.get(variant.featuredMediaId),
  "ProductVariant.componentConfiguration": (variant, { selections }) =>
    resolvedComponentConfiguration(store, variant, selections),
  "ProductVariant.reviews": (variant, args) => connection(sortReviews(store.state.reviews.filter((review) =>
    review.variantId === variant.id && review.status === "PUBLISHED"), args.sort), args),
  "ProductVariant.questions": (variant, args) => connection(sortQuestions(store.state.productQuestions.filter((question) =>
    question.variantId === variant.id && question.status === "PUBLISHED"), args.sort), args),
  "InventoryItem.variant": (item) => store.get(item.variantId),
  "SelectedOption.option": (selection) => store.get(selection.option?.id) ?? selection.option,
  "SelectedOption.optionValue": (selection) => store.get(selection.optionValue?.id) ?? selection.optionValue,

  "CheckoutCustomerIdentity.customer": (identity) => store.get(identity.customerId),
  "CheckoutLine.image": (line) => store.get(line.imageId),
  "CheckoutLine.parent": (line) => store.get(line.parentId),
  "CheckoutLine.purchasable": (line) => store.get(line.purchasableId),
  "CheckoutDeliveryGroup.checkoutLines": (group) => group.checkoutLineIds.map((id) => store.get(id)).filter(Boolean),

  "Customer.defaultAddress": (customer) => store.get(customer.defaultAddressId),
  "Customer.orders": (customer, args) => {
    let orders = customer.orderIds.map((id) => store.get(id)).filter(Boolean);
    if (args.statuses?.length) orders = orders.filter(({ status }) => args.statuses.includes(status));
    return connection(orders, args);
  },
  "Customer.reviews": (customer, args) => connection(sortReviews(store.state.reviews.filter((review) =>
    review.author.customerId === customer.id), args.sort), args),
  "Customer.productQuestions": (customer, args) => connection(sortQuestions(store.state.productQuestions.filter((question) =>
    question.author.customerId === customer.id), args.sort), args),
  "Customer.reviewRequests": (customer, args) => connection(store.state.reviewRequests.filter((request) =>
    request.customerId === customer.id), args),

  "OrderCustomerIdentity.customer": (identity) => store.get(identity.customerId),
  "OrderDeliveryGroup.lines": (group) => group.lineIds.map((id) => store.get(id)).filter(Boolean),
  "OrderFulfillmentLine.orderLine": (line) => store.get(line.orderLineId),
  "OrderRefundLine.orderLine": (line) => store.get(line.orderLineId),
  "Order.returnRequests": (order, args) => connection(order.returnRequestIds.map((id) => store.get(id)).filter(Boolean), args),
  "OrderReturnRequest.order": (request) => store.get(request.orderId),
  "OrderReturnRequestLine.orderLine": (line) => store.get(line.orderLineId),

  "Store.markets": (value, args) => connection(value.marketIds.map((id) => store.get(id)).filter(Boolean), args),
  "StoreBrand.logo": (brand) => store.get(brand.logoId),
  "StoreBrand.squareLogo": (brand) => store.get(brand.squareLogoId),
  "StoreBrand.coverImage": (brand) => store.get(brand.coverImageId),
  "Localization.store": (value) => store.get(value.storeId) ?? store.state.store,
  "Localization.market": (value) => store.get(value.marketId),

  "ReviewContentAuthor.customer": (author) => store.get(author.customerId),
  "ReviewRating.criterion": (rating) => store.get(rating.criterionId),
  "ReviewRatingCriterionAssignment.criterion": (assignment) => store.get(assignment.criterionId),
  "ReviewRatingCriterionAssignment.target": (assignment) => store.get(assignment.targetId),
  "Review.product": (review) => store.get(review.productId),
  "Review.variant": (review) => store.get(review.variantId),
  "Review.media": (review) => review.mediaIds.map((id) => store.get(id)).filter(Boolean),
  "Review.replies": (review, args) => connection(review.replyIds.map((id) => store.get(id)).filter(Boolean), args),
  "ReviewMedia.review": (media) => store.get(media.reviewId),
  "ReviewMedia.media": (media) => store.get(media.mediaId),
  "ReviewReply.review": (reply) => store.get(reply.reviewId),
  "ProductQuestion.product": (question) => store.get(question.productId),
  "ProductQuestion.variant": (question) => store.get(question.variantId),
  "ProductQuestion.answers": (question, args, context) => connection(sortQuestions(question.answerIds
    .map((id) => store.get(id))
    .filter((answer) => answer && (answer.status === "PUBLISHED" || store.owns(context.customer, answer))), args.sort), args),
  "ProductQuestion.viewerSubscription": (question, _, context) => store.state.productQuestionSubscriptions.find((subscription) =>
    subscription.questionId === question.id && subscription.subscriberCustomerId === context.customer?.id) ?? null,
  "ProductQuestionAnswer.question": (answer) => store.get(answer.questionId),
  "ProductQuestionSubscription.question": (subscription) => store.get(subscription.questionId),
  "ProductQuestionSubscription.subscriberCustomer": (subscription) => store.get(subscription.subscriberCustomerId),
  "ReviewRequest.customer": (request) => store.get(request.customerId),
  "ReviewRequest.product": (request) => store.get(request.productId),
  "ReviewRequest.variant": (request) => store.get(request.variantId),
  "ReviewRequest.review": (request) => store.get(request.reviewId),
  "ReviewRequest.events": (request, args) => connection(request.events, args),
  "ReviewRequestEvent.reviewRequest": (event) => store.state.reviewRequests.find((request) =>
    request.events.some(({ id }) => id === event.id)),
  "ReviewContentVote.content": (vote) => store.get(vote.contentId),
  "ReviewContentVote.voterCustomer": (vote) => store.get(vote.voterCustomerId),
  "ReviewContentReport.content": (report) => store.get(report.contentId),
  "ReviewContentReport.reporterCustomer": (report) => store.get(report.reporterCustomerId),

  ...Object.fromEntries(["Review", "ReviewReply", "ProductQuestion", "ProductQuestionAnswer"].flatMap((typeName) => [
    [`${typeName}.viewerEngagement`, (content, _, context) => contentViewerEngagement(store, content, context)],
    [`${typeName}.viewerCapabilities`, (content, _, context) => contentViewerCapabilities(store, content, context)],
  ])),
});

const queryResolvers = (store) => ({
  headlessStorefrontAccess: () => true,
  onlineStorePage: (_, { id }) => store.get(id)?.__typename === "OnlineStorePage" ? store.get(id) : null,
  onlineStorePageByHandle: (_, { handle }) => store.byHandle("OnlineStorePage", handle),
  onlineStorePages: (_, args) => connection(store.state.pages, args),
  onlineStoreNavigationMenu: (_, { id }) => store.get(id)?.__typename === "OnlineStoreNavigationMenu" ? store.get(id) : null,
  onlineStoreNavigationMenuByHandle: (_, { handle }) => store.byHandle("OnlineStoreNavigationMenu", handle),
  onlineStoreNavigationMenus: (_, args) => connection(store.state.navigationMenus, args),
  node: (_, { id }, __, info) => {
    const entity = store.get(id);
    const allowed = new Set(info.schema.getPossibleTypes(info.schema.getType("Node")).map(({ name }) => name));
    return entity && allowed.has(entity.__typename) ? entity : null;
  },
  nodes: (_, { ids }, __, info) => {
    const allowed = new Set(info.schema.getPossibleTypes(info.schema.getType("Node")).map(({ name }) => name));
    return ids.map((id) => {
      const entity = store.get(id);
      return entity && allowed.has(entity.__typename) ? entity : null;
    });
  },
  product: (_, { id }) => store.get(id)?.__typename === "Product" ? store.get(id) : null,
  productByHandle: (_, { handle }) => store.byHandle("Product", handle),
  productVariant: (_, { id }) => store.get(id)?.__typename === "ProductVariant" ? store.get(id) : null,
  category: (_, { id }) => store.get(id)?.__typename === "Category" ? store.get(id) : null,
  categoryByHandle: (_, { handle }) => store.byHandle("Category", handle),
  categories: (_, args) => connection(store.state.categories, args),
  checkout: (_, { id }) => store.get(id)?.__typename === "Checkout" ? store.get(id) : null,
  checkoutPlacement: (_, { id }) => store.state.checkoutPlacements.find((placement) =>
    placement.placementId === id || placement.checkoutId === id) ?? null,
  customer: (_, __, context) => context.customer,
  products: (_, args) => productConnection(store, store.state.products, args),
  searchProducts: (_, args) => {
    if (!String(args.query).trim()) throw new GraphQLError("query must not be empty", { extensions: { code: "BAD_USER_INPUT" } });
    return productConnection(store, store.state.products, args, { query: args.query });
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
  localization: () => store.state.localization,
  market: (_, { handle }) => store.byHandle("Market", handle),
  reviewStoreConfiguration: () => store.state.reviewStoreConfiguration,
  review: (_, { id }, context) => visibleReviewContent(store, id, "Review", context),
  productQuestion: (_, { id }, context) => visibleReviewContent(store, id, "ProductQuestion", context),
  reviewReply: (_, { id }, context) => visibleReviewContent(store, id, "ReviewReply", context),
  productQuestionAnswer: (_, { id }, context) => visibleReviewContent(store, id, "ProductQuestionAnswer", context),
  reviewRequest: (_, { id }, context) => {
    const request = store.get(id);
    return request?.__typename === "ReviewRequest" && request.customerId === context.customer?.id ? request : null;
  },
});

const visibleReviewContent = (store, id, typeName, context) => {
  const content = store.get(id);
  return content?.__typename === typeName && (content.status === "PUBLISHED" || store.owns(context.customer, content))
    ? content : null;
};

const mutationResolvers = (store) => ({
  _catalog: () => true,
  _listing: () => true,
  _media: () => true,
  ...checkoutMutations(store),
  ...customerOrderMutations(store),
  ...reviewMutations(store),
});

const reviewKindType = {
  REVIEW: "Review",
  REVIEW_REPLY: "ReviewReply",
  PRODUCT_QUESTION: "ProductQuestion",
  QUESTION_ANSWER: "ProductQuestionAnswer",
};

const abstractType = (value, abstractTypeName) => {
  if (abstractTypeName === "ReviewContent") return reviewKindType[value.kind] ?? value.__typename ?? null;
  if (abstractTypeName === "DisplayableError") {
    if (Object.hasOwn(value, "retryable")) return value.code?.startsWith("CHECKOUT") ? "CheckoutUserError" : "OrderUserError";
    return "UserError";
  }
  return value.__typename ?? inferTypeName(value) ?? null;
};

export const applyResolvers = (schema, store) => {
  const specials = specialFields(store);
  const query = queryResolvers(store);
  const mutation = mutationResolvers(store);

  for (const type of Object.values(schema.getTypeMap())) {
    if (type.name.startsWith("__")) continue;
    if (isInterfaceType(type) || isUnionType(type)) {
      type.resolveType = (value) => abstractType(value, type.name);
    }
    if (!isObjectType(type)) continue;

    for (const field of Object.values(type.getFields())) {
      if (type.name === "Query" && query[field.name]) {
        field.resolve = query[field.name];
        continue;
      }
      if (type.name === "Mutation" && mutation[field.name]) {
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
        return hydrateValue(store, source, getNamedType(field.type), field.type, args);
      };
    }
  }

  return schema;
};

export const createContext = (store) => async ({ request }) => ({
  request,
  store,
  customer: store.currentCustomer(request),
});
