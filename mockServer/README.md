# @shopana/mock-server

Reusable GraphQL mock engine for storefront themes. The package owns the
Storefront schema, resolvers, mutable in-memory state, mutation workflows, and
static image serving. It does not contain store data or theme assets.

## API

```js
import { createMockServer } from '@shopana/mock-server';

const server = await createMockServer({
  fixtures: {
    now: '2026-08-03T12:00:00.000Z',
    data: {
      categories: [],
      products: [],
      // The remaining Storefront state collections and singleton records.
    },
  },
  publicPath: '/absolute/path/to/theme/public',
});

await server.listen({ port: 4100 });
```

Open `/auth` on the same host to use the application-auth test page. The mock
implements the OpenAPI email/password sign-up, sign-in, sign-out, password
reset, session list, single-session revocation, and the OAuth
authorization-code/PKCE routes under
`/auth/applications/{applicationId}`. Users and sessions are isolated per
application ID and kept only in memory until the server restarts. Email
delivery, policy enforcement, rate limiting, and other production IAM features
are intentionally not emulated.

### Headless sign-in

The headless API (`/auth/applications/{applicationId}/headless/v1/*`) used by
the storefront's own sign-in forms enables every method of the contract:

- password sign-in, sign-up and reset;
- email code and phone code (E.164) sign-in and sign-up — the code is always
  `000000`. A phone code creates a phone-only account (`phone_number` in
  userinfo, no email) and a customer with that phone number;
- Google, Facebook and Apple sign-in. `social/start` answers a one-time
  `social/launch` URL (60 seconds) that opens a mock provider page: continue
  as a provider account (email prefilled as `<provider>.user@example.com`, a
  new email creates an account, an existing one signs in to it), cancel
  (`error=access_denied`), or simulate `account_not_linked`. The browser then
  returns to the transaction `redirect_uri` with `code`, `state` and `iss`, or
  with `error`, `state` and `iss`;
- account connections: list, link through the same provider page (returns to
  `return_uri` with `connection=linked` or `connection_error`) and unlink. The
  last way to sign in cannot be unlinked (`last_login_method`).

Nothing is delivered: codes, password reset links and email verification
links are printed to the server console as `[mock-iam] …` lines; open a
printed link in the browser. Reset links redirect to the storefront
`reset_uri` with `token` (or `error=invalid_token` once spent); verification
links redirect to `verify_uri` with `email_verified=true` (or
`error=invalid_token`).

`MOCK_IAM_EMAIL_VERIFICATION` sets email verification: `off` (default), `otp`
or `link`. When it is `otp` or `link`, password sign-up and password sign-in of
an unverified email answer `verification_required`: with `otp` the buyer enters
the printed code `000000`; with `link` the buyer opens the printed link and
signs in again.

Like IAM, the API routes accept only server requests (no `Origin`, Basic
client authentication, `shopana-end-user-ip`); the launch, provider and email
link routes are opened by the browser.

When an authorization request has no active application session, the mock IAM
renders its own email/password sign-in and sign-up page and then resumes the
original authorization request. `prompt=none` retains standard non-interactive
behavior and returns `login_required` to the redirect URI.

The production storefront exchanges an OAuth access token for trusted customer
context before GraphQL execution. The mock keeps the same client-facing
boundary: an IAM application session authorizes the OAuth code flow, PKCE S256
is verified at token exchange, and only the resulting OAuth access token is
accepted as `Authorization: Bearer <token>` on `/graphql`.
Revoking or signing out an application session also revokes every authorization
code, access token, and refresh token issued from that session. IAM routes
support credentialed cross-origin requests from a separately hosted storefront.
The corresponding fixture customer is resolved by email, while a new sign-up
provisions a minimal in-memory customer. Revoking the session immediately
invalidates its Bearer token. Existing fixture customers can sign in with
`password123` (for example, `alex.morgan@example.com`).

The server listens on `0.0.0.0` by default. Pass `host` explicitly to restrict
it to a specific interface.

`createMockServer` returns the Node HTTP server, the cloned mutable store, and
promise-based `listen` and `close` methods. Each server instance clones the
supplied fixture data, so mutations never change the theme's source objects.

Fixture constructors such as `gid`, `money`, `richText`, `postalAddress`, and
`contentMetrics` are available from `@shopana/mock-server/fixture-helpers`.

### Checkout disclosures

`Checkout.disclosures` links the published `TERMS_OF_SERVICE` and
`PRIVACY_POLICY` from `storePolicies` (en and uk notice text), and is null when
neither is published. The acceptance mode comes from
`checkoutSettings.termsAcceptanceMode` (`NOTICE` by default) or the
`MOCK_CHECKOUT_TERMS_ACCEPTANCE=NOTICE|CHECKBOX` environment variable, which
takes precedence. `placeOrder` answers `DISCLOSURES_CHANGED` for a stale
`disclosuresVersion` and `TERMS_NOT_ACCEPTED` when the checkbox is required.

### Reviews, questions and wishlists

The review settings come from `data.reviewStoreConfiguration`. Three of them
can be switched without editing fixtures, `true` or `false` overriding the
fixture value, as `reviewStoreConfiguration` answers it and the mutations
enforce it:

- `MOCK_GUEST_REVIEWS` — `guestReviewsEnabled`: `reviewCreate` without a
  customer answers `AUTHENTICATION_REQUIRED` when it is off;
- `MOCK_GUEST_QUESTIONS` — `guestQuestionsEnabled`: the same for
  `productQuestionCreate`;
- `MOCK_CUSTOMER_ANSWERS` — `customerAnswersEnabled`:
  `productQuestionAnswerCreate` always needs a customer and answers
  `ANSWERS_DISABLED` when it is off.

`productQuestionSubscriptionSet` needs a customer. Votes
(`reviewContentVoteSet`, `reviewContentVoteRemove`) and reports
(`reviewContentReportCreate`) are kept per customer or, without one, per
anonymous visitor.

Wishlists belong to the customer: `wishlistProductAdd` and
`wishlistProductRemove` answer `AUTHENTICATION_REQUIRED` without one.
`wishlistProductAdd` creates the default wishlist with the first saved product
and answers the existing item when the product is already saved.
`Customer.defaultWishlist`, `wishlists` and `wishlist(id)` read them.

### Vendors, promotions and buyer forms

`data.vendors` holds the vendor records (`handle`, `name`, `logoId`, `seo`);
products reference them by `vendor.id`. `vendors`, `vendor` and
`vendorByHandle` answer only vendors with products, ordered by name, and
`Vendor.products` is a listing over that vendor's products.

`cartRecommendations` merges the frequently-bought-together fixtures of the
cart products without the products already in the cart.

`data.promotions` holds automatic promotions: a `StorefrontPromotion` record
plus `targets` (`variantIds`, `productIds`, `categoryIds`) of a product
discount or Buy X Get Y, `sortOrder`, `priority` and `storefrontVisible`
(`false` hides a promotion and keeps it applied). `storefrontPromotions` and
`ProductVariant.promotions` answer the promotions active at the mock clock; a
variant gets those whose targets match it and every order discount and free
shipping. The checkout fills `promotionProgress`, `appliedPromotions` and
`freeShippingProgress`: thresholds count line subtotals before discounts, a
product discount counts only its target lines, a satisfied product or order
discount lowers the totals, and satisfied free shipping zeroes the selected
delivery groups up to `maximumShippingPrice`. A free-shipping loyalty reward
gives `LOYALTY_REWARD` with the nearest threshold as `nextRequirement`. Buy X
Get Y is shown on variants only and is neither applied nor tracked.

`marketingSubscribe` answers `PENDING_CONFIRMATION` and prints the
confirmation link as a `[mock-marketing]` line; any token confirms.
`contactRequestForm` is available while a `PRIVACY_POLICY` is published, and
`contactRequestCreate` keeps nothing but checks the E.164 phone and the
disclosure version. `customerMediaUpload` is not emulated and answers
`INTERNAL_ERROR`.

## Theme composition

The theme owns the executable entrypoint, fixture bundle, deterministic clock,
and files served from `/images/*`. A theme composes the engine in its own
`mock/server.js` and stores its fixture data under `mock/fixtures/`.

Authenticated requests normally use the Bearer token issued by application
auth. For fixture-only scenarios, `x-mock-customer-id` explicitly selects a
fixture customer and `x-mock-anonymous: true` forces an anonymous context.
Requests without either a Bearer token or an explicit mock customer are
anonymous. Checkout, customer, order, review, and question mutations update
only the in-memory store until the process restarts.

Product comparison fixtures are supplied as `data.productComparisons`, with a
`categoryId` and presentation `title`. Every product whose current primary
category matches the configured category is included; the engine selects its
first available variant. Optional `variantIds` override that selection for
specific products. Customer records may persist `comparisonVariantIds` and
`comparisonRevision`. The engine prepares product-page and customer comparison
matrices and implements the add, remove, and category-clear mutations.
The selection revision is returned by comparison mutation payloads. Comparison
matrices expose original `feature` or `selectedOption` objects in each value cell.

Checkout mutations accept the current schema inputs without version or
idempotency fields. Checkouts expose `status`, `expiresAt`, and `resultRevision`;
terminal or expired checkouts cannot be edited or placed. Place-order attempts
retain their schema-defined idempotency key. Loyalty point redemption uses the
fixture program's optional `availablePoints` (default 0) and `pointValue`
(default 0.01); reward entitlements are not simulated. Collections are supplied
as `data.collections`, with `productIds` and `mediaIds` for their connections.

Product recommendation fixtures are supplied as `data.productRecommendations`.
Each record identifies its source `productId` and contains ordered
`relatedProducts` and `frequentlyBoughtTogether` arrays. Recommendation entries
contain a `productId` and a `ProductRecommendationSource` value. Missing target
products are omitted when the connection is resolved, and both fields support
forward pagination through `first` and `after`.

## Engine boundaries

- `src/server.js` creates the GraphQL and HTTP servers from injected data.
- `src/mock-store.js` clones and indexes the injected theme state.
- `src/resolvers.js` implements schema resolution and relationship hydration.
- `src/mutations/` contains mutable Storefront workflows.
- `src/fixture-helpers.js` contains data constructors shared with themes.

The engine must not import a theme package or a theme-owned fixture module.
