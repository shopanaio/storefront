# Contributing

Thanks for helping improve Shopana Storefront.

## Getting started

1. Use Node.js 22 (`nvm use`) and Yarn 1.
2. `yarn install`
3. `yarn build:packages`

## Before opening a pull request

Run the same checks as CI:

```bash
yarn format:check
yarn lint
yarn typecheck
yarn test
```

## Guidelines

- Code, comments, and documentation are written in English. User-facing texts live in the i18n
  message files of each package.
- Keep changes focused; describe the behavior change and how it was verified in the pull request.
- Do not edit generated files (`**/generated/**`, `packages/checkout/src/graphql/operations.ts`,
  `**/openapi/**`); regenerate them with `yarn codegen`.
- Add or update tests next to the code you change.

## Reporting bugs and requesting features

Open an issue with steps to reproduce, the expected and the actual behavior, and the package
versions involved. Report security issues privately as described in [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions are licensed under the
[Apache License 2.0](LICENSE).
