# @shopana/checkout

Independent checkout flow for Shopana storefront themes.

The host theme registers its bound checkout page loader with
`registerCheckoutModule` and passes a `CheckoutThemeAdapter` to `Checkout` or
`CheckoutPage` for branding, authentication, cart UI and theme-aware
navigation. Internal implementation files are intentionally not exported.
