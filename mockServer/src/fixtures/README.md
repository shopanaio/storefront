# Fixtures

Static data used by the mock GraphQL resolvers lives here. Fixtures are grouped
by the business domains exposed by `schema.graphql`.

The included `Northstar Supply` dataset represents a complete medium demo
store rather than a minimal happy path. It contains:

- 16 hierarchical categories, 260 products, and 635 inventory-tracked variants;
- 50 component-enabled products with one shared configuration across every
  variant of the same product (50 configurations and 300 component items);
- 282 local media records, three markets, seven content pages, and two menus;
- five customer profiles and three checkout scenarios;
- eight orders across processing, delivery, cancellation, payment-failure, and
  refund states, plus two return requests;
- 18 reviews with three customer media uploads, four merchant replies, eight
  questions, six answers, five review requests, and three rating criteria.

## Conventions

- IDs use stable Relay-style `gid://shopana/<Type>/<value>` values.
- Dates, inventory, prices, and engagement counts are deterministic.
- Entity collections are normalized. Cross-domain and back references use
  `<name>Id` or `<name>Ids`; resolvers hydrate the referenced GraphQL object.
- Nested immutable snapshots, such as checkout lines and order lines, remain
  embedded in their aggregate.
- Money amounts are decimal strings and always include `currencyCode`.
- Image records use files under `public/images/placeholders/`, so fixtures do
  not depend on remote services.

Keep reusable entity data in the matching domain directory, export new fixture
files from that domain's `index.js`, and export new domains from the root
`index.js`. Resolver behavior and mutable request state do not belong here.
