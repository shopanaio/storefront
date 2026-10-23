import { gid } from "./fixture-helpers.js";
import { clone, inferTypeName } from "./helpers.js";

const collectionEntries = (state) => [
  ["Category", state.categories],
  ["Collection", state.collections],
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
  ["StorePolicy", state.storePolicies],
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
    this.state.customers ??= [];
    this.state.collections ??= [];
    this.state.storePolicies ??= [];
    this.state.productComparisons ??= [];
    this.state.productRecommendations ??= [];
    for (const customer of this.state.customers ?? []) {
      customer.revision ??= 1;
      customer.accountStatus ??= "REGISTERED";
      customer.createdAt ??= now;
      customer.updatedAt ??= now;
      if (customer.emailAddress) customer.emailAddress.verified ??= true;
      if (customer.phoneNumber) customer.phoneNumber.verified ??= true;
      customer.comparisonVariantIds ??= [];
      customer.comparisonRevision ??= 0;
      customer.wishlists ??= [];
    }
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
    if (!requested) return null;

    return this.state.customers.find((customer) =>
      customer.id === requested
      || customer.id.endsWith(`/${requested}`)
      || customer.emailAddress?.emailAddress === requested) ?? null;
  }

  customerByEmail(email) {
    const normalized = email.trim().toLowerCase();
    return this.state.customers.find(
      (customer) =>
        customer.emailAddress?.emailAddress?.trim().toLowerCase() === normalized
    ) ?? null;
  }

  provisionCustomer(applicationUser) {
    const existing = this.customerByEmail(applicationUser.email);
    if (existing) return existing;

    const firstName = applicationUser.firstName
      ?? applicationUser.name.trim().split(/\s+/u)[0]
      ?? "Mock";
    const lastName = applicationUser.lastName
      ?? applicationUser.name.trim().split(/\s+/u).slice(1).join(" ")
      ?? "";
    const customer = {
      id: gid("Customer", applicationUser.id),
      revision: 1,
      accountStatus: "REGISTERED",
      firstName,
      lastName,
      displayName: [firstName, lastName].filter(Boolean).join(" "),
      emailAddress: {
        emailAddress: applicationUser.email,
        verified: applicationUser.emailVerified,
        marketingConsent: null,
      },
      phoneNumber: null,
      addresses: [],
      defaultAddressId: null,
      comparisonRevision: 0,
      comparisonVariantIds: [],
      wishlists: [],
      orderIds: [],
      createdAt: applicationUser.createdAt,
      updatedAt: applicationUser.updatedAt,
    };
    this.state.customers.push(customer);
    this.reindex();
    return customer;
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
    checkout.updatedAt = this.now();
    checkout.resultRevision = `checkout-${checkout.id.split("/").at(-1)}-${Date.parse(checkout.updatedAt)}`;
    if (checkout.loyaltyRedemption) checkout.loyaltyRedemption.revision = checkout.resultRevision;
    this.reindex();
    return checkout;
  }

  touchContent(content) {
    if (Object.hasOwn(content, "revision")) content.revision += 1;
    content.updatedAt = this.now();
    content.metrics.updatedAt = content.updatedAt;
    this.reindex();
    return content;
  }
}

export const createMockStore = (fixtures) => new MockStore(fixtures);
