import { clone, inferTypeName } from "./helpers.js";

const collectionEntries = (state) => [
  ["Category", state.categories],
  ["Facet", state.facets],
  ["Product", state.products],
  ["ProductVariant", state.productVariants],
  ["ProductComponentConfiguration", state.productComponentConfigurations],
  ["Checkout", state.checkouts],
  ["Customer", state.customers],
  ["MediaImage", state.images],
  ["OnlineStoreNavigationMenu", state.navigationMenus],
  ["OnlineStorePage", state.pages],
  ["Order", state.orders],
  ["OrderReturnRequest", state.orderReturnRequests],
  ["Market", state.markets],
  ["Review", state.reviews],
  ["ProductQuestion", state.productQuestions],
  ["ProductQuestionAnswer", state.productQuestionAnswers],
  ["ReviewMedia", state.reviewMedia],
  ["ReviewReply", state.reviewReplies],
  ["ReviewRequest", state.reviewRequests],
  ["ReviewRatingCriterion", state.reviewRatingCriteria],
  ["ProductQuestionSubscription", state.productQuestionSubscriptions],
  ["ReviewContentVote", state.reviewContentVotes],
  ["ReviewContentReport", state.reviewContentReports],
];

export class MockStore {
  constructor({ data, now }) {
    if (!data || typeof data !== "object") {
      throw new TypeError("Mock fixtures must provide a data object.");
    }
    if (!Number.isFinite(Date.parse(now))) {
      throw new TypeError("Mock fixtures must provide a valid ISO timestamp in now.");
    }

    this.state = clone(data);
    this.initialNow = now;
    this.idempotency = new Map();
    this.counters = new Map();
    this.clock = Date.parse(now);
    this.entityIndex = new Map();
    this.reindex();
  }

  now() {
    this.clock += 1_000;
    return new Date(this.clock).toISOString();
  }

  next(type) {
    const next = (this.counters.get(type) ?? 0) + 1;
    this.counters.set(type, next);
    return next;
  }

  replay(scope, key, operation) {
    const cacheKey = `${scope}:${key}`;
    if (key && this.idempotency.has(cacheKey)) return this.idempotency.get(cacheKey);
    const result = operation();
    if (key) this.idempotency.set(cacheKey, result);
    return result;
  }

  reindex() {
    this.entityIndex.clear();
    const visited = new WeakSet();
    const visit = (value) => {
      if (!value || typeof value !== "object" || visited.has(value)) return;
      visited.add(value);
      if (typeof value.id === "string") {
        const typeName = inferTypeName(value.id);
        if (typeName) value.__typename ??= typeName;
        const indexed = this.entityIndex.get(value.id);
        if (!indexed || Object.keys(value).length > Object.keys(indexed).length) {
          this.entityIndex.set(value.id, value);
        }
      }
      for (const nested of Object.values(value)) visit(nested);
    };

    for (const [, values] of collectionEntries(this.state)) visit(values);
    visit(this.state.store);
    visit(this.state.localization);
    visit(this.state.reviewStoreConfiguration);
    return this;
  }

  all(typeName) {
    return collectionEntries(this.state).find(([candidate]) => candidate === typeName)?.[1] ?? [];
  }

  get(id) {
    return this.entityIndex.get(id) ?? null;
  }

  find(typeName, predicate) {
    return this.all(typeName).find(predicate) ?? null;
  }

  byHandle(typeName, handle) {
    return this.find(typeName, (entity) => entity.handle === handle);
  }

  currentCustomer(request) {
    if (request?.headers.get("x-mock-anonymous") === "true") return null;
    const requested = request?.headers.get("x-mock-customer-id");
    if (!requested) return this.state.customers[0] ?? null;

    return this.state.customers.find((customer) =>
      customer.id === requested
      || customer.id.endsWith(`/${requested}`)
      || customer.emailAddress?.emailAddress === requested) ?? null;
  }

  ownerCustomerId(entity) {
    return entity?.customerId
      ?? entity?.customerIdentity?.customerId
      ?? entity?.author?.customerId
      ?? null;
  }

  owns(customer, entity) {
    return Boolean(customer && this.ownerCustomerId(entity) === customer.id);
  }

  touchCheckout(checkout) {
    checkout.version += 1;
    checkout.resultRevision = `checkout-${checkout.id.split("/").at(-1)}-r${checkout.version}`;
    checkout.updatedAt = this.now();
    this.reindex();
    return checkout;
  }

  touchContent(content) {
    content.revision += 1;
    content.updatedAt = this.now();
    content.metrics.updatedAt = content.updatedAt;
    this.reindex();
    return content;
  }
}

export const createMockStore = (fixtures) => new MockStore(fixtures);
