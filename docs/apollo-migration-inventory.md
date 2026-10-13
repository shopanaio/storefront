# Apollo migration inventory

Final inventory after the Relay-to-Apollo migration:

| Category                                          | Remaining |
| ------------------------------------------------- | --------: |
| `react-relay` / `relay-runtime` source imports    |         0 |
| Relay GraphQL tags                                |         0 |
| Relay compiler directives in Apollo documents     |         0 |
| Relay `__generated__/*.graphql.ts` artifacts      |         0 |
| Relay SSR/provider modules                        |         0 |
| Relay compiler/config scripts                     |         0 |
| Relay-shaped `$key` / `$data` compatibility types |         0 |
| Relay-named query providers                       |         0 |

All domains are complete: home, search, collection, product, reviews, checkout,
box builder, cart and session. New or changed GraphQL code must use an external
`*.graphql` document and the generated typed document from the single
root `codegen.ts` workflow.

Root cart and session queries share one request-scoped Apollo Client. The root
extracts one normalized cache snapshot, and client stores initialize from that
hydrated cache instead of receiving duplicate query results through props.

Schema-aware GraphQL ESLint rules and the codegen preflight enforce document
validity, unique names, named operations, supported directives and fragment
requirements.

The local `graphql-schema-extensions/auth.graphql` file is an Apollo codegen
schema supplement for authentication operations omitted from the federated
introspection snapshot. It contains no Relay directives or runtime semantics.

Mutation cache strategies are recorded in
`docs/apollo-mutation-cache-strategies.md`.
