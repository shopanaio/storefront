# Fixtures

Static data used by the mock GraphQL resolvers lives here. Fixtures are grouped
by the business domains exposed by `schema.graphql`.

- Keep reusable entity data in the matching domain directory.
- Export new fixture files from the domain's `index.js`.
- Export new domains from the root `index.js`.
- Keep resolver behavior and mutable request state outside this directory.

Collections start as empty arrays and singleton resources start as `null`. They
can be populated incrementally as mock operations are implemented.
