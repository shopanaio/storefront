# @shopana/storefront-runtime

Generated Next.js App Router runtime for a Shopana storefront.

The package owns the framework route implementations and the `init` generator.
The consuming storefront keeps its customizable code under `src/`:

- `src/runtime/layout.tsx` and `src/runtime/middleware.ts` provide app-level integration;
- `src/layouts` contains page layouts;
- `src/templates` contains page templates;
- `src/modules/**/register.ts` contains dynamic module registrations.

Run the generator before `next dev` or `next build`:

```bash
storefront-runtime init
```

It creates `.runtime`, including the Next `app` routes and adapters that import
the storefront structures above. `.runtime` is generated output and should not
be edited or committed.
