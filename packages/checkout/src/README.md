# Checkout Module Architecture

This document describes the checkout module architecture: its key layers, events, state, integrations, and the provider plugin system (shipping/payment). It is intended for developers extending and maintaining the module.

## Overview

The module is composed of several layers:

- UI layer: visual components and checkout sections
- Data: loading and normalizing checkout data via Apollo Client/GraphQL
- State: local Zustand store and an event bus
- API: atomic checkout operations (mutations)
- Validation: Yup schemas for sections and provider methods
- Provider plugins: shipping/payment providers registered via the module registry

The module page entry is `page/page.tsx`, client is `page/client.tsx`; public export is `index.ts` (dynamic component import).

## UI Layer

Key components:

- `components/Checkout.tsx`: Checkout container. Mounts data (`CheckoutDataContextProvider`) and API (`CheckoutApiProvider`) contexts, wires the controller (`CheckoutController`), and renders by placement phase: the result screen (`components/result/CheckoutResult.tsx`), the waiting screen (`components/result/PaymentPendingScreen.tsx`), or progress and the view (`CheckoutView`). Handles submit via `useCheckoutStore().requestSubmit()` and shows validation alerts via `useValidationAlert`.
- `components/CheckoutController.tsx`: hooks in `useOperationTracker` and `usePlacementController`, calls `onOrderAccepted` on `OrderAccepted`, and hosts a client SDK module for `CLIENT_SDK` actions.
- `components/CheckoutView.tsx`: render-only component. Renders sections using `infra/SectionRenderer` wrapped with `components/common/CheckoutSection`. Left column — sections, right — `summary`.
- `infra/SectionRenderer.tsx`: renders a section by `SectionId` using `sections/sections.tsx`.
- `components/section/SectionContainer.tsx` and `components/section/makeSection.tsx`: polymorphic section containers. Register the section in the store, validate data via Yup schema, publish validity state, and pass `invalidate` to the View.

Sections live under `sections/*` and include:

- `components/Container.tsx` — section container (uses SectionContainer)
- `components/Component.tsx` — View (rendering and local handlers)
- `schema.ts` — Yup validation schema
- `mapper.ts`, `types.ts` — helpers and types
- Sections map — `sections/sections.tsx` with keys from `SectionId` (`state/interface.ts`).

## Data and Contexts

- `context/CheckoutDataContext.tsx`:
  - Loads checkout with `StorefrontLoadCheckoutQueryDocument` and Apollo `useQuery`.
  - Converts generated Apollo data to domain `Checkout.Checkout` via `mapApiCheckoutToCheckout`.
  - Provides `checkout`, `loading/loaded`, and errors.
- `context/CheckoutApiContext.tsx`:
  - Builds `CheckoutApi` via `api/useCreateCheckoutApi` and exposes it through `useCheckoutApi`.

## State and Events

- Store: `state/checkoutStore.ts` (Zustand)
  - Holds section map (`sections`), active operation counter, selected methods, etc.
  - Actions: register/unregister section, mark valid/invalid, busy, required, `requestSubmit()`.
  - `requestSubmit()` computes missing required sections (`computeMissingRequiredSections`) and emits `SubmitBlocked` or `SubmitReady` to the `checkoutBus`.
- Event bus: `state/checkoutBus.ts` (Emittery)
  - Typed events: section lifecycle, validity, method selection, submit lifecycle (`SubmitRequested/Blocked/Ready`), placement (`PlacementStarted`, `OrderAccepted`), operation statuses (`OperationStart/End/Error`).
  - Operation keys — `OperationKey` for unified mutation tracking.
- State hooks:
  - `state/hooks/useSectionController.ts`: registers a section in the store, syncs busy via operation events, publishes valid/invalid/reset.
  - `state/placement/usePlacementController.ts`: listens to `SubmitReady` and drives order placement (see Order Placement).
  - `hooks/useValidationAlert.ts`: listens to submit blocks and builds a message listing required sections.

## API Layer

- API contract: `api/interface.ts` — set of methods for atomic operations (select payment/shipping, addresses, recipients, promo codes, note, submit).
- API factory implementation: `api/useCreateCheckoutApi.ts`
  - Uses `useCheckoutOperation` for each operation with `OperationKey` and `sectionId`.
  - Automatically injects `checkoutId` from `CheckoutDataContext` into all calls.
- Mutation wrapper: `api/useCheckoutOperation.ts`
  - Wraps the typed Apollo mutation adapter with: promise-based API, debounce, race protection, `OperationStart/End/Error` events, and optional error toasts.
  - Supports `commit` and `commitScheduled`.

## Validation

- Shared utils: `utils/validation.ts`
  - `extractYupErrors` — extracts Yup errors into `Record<string,string>`.
  - `buildSelectedProviderMethodSchema` — builds a schema for a selected method field (payment/shipping) with method-level validation.
- Section schemas live in `sections/*/schema.ts` and are wired by section containers.

## Provider Plugin System (shipping/payment)

- Types and contracts: `vendors/types.ts` — `ProviderModuleType` (payment/delivery), `ProviderConfig`, `ProviderMethodConfig`, `ProviderModuleApi`, and component props.
- Module registry: `@shopana/storefront-sdk/registry` — modules register by `type` and `slug`; the slug is the provider code from the API (`providerCode`).
- Providers autoload: `index.ts` — `require.context` loads every `vendors/*/register.*`.
- Provider render: `infra/ProviderRenderer.tsx` — resolves a provider by `moduleType` and `provider` from the registry, loads the module asynchronously, and renders it, passing `onSelectMethod`, `onUpdateMethodData`, and `deliveryAddress`.
- Config resolve: `infra/resolveProviderConfig.ts` — loads the provider `config` to check that a payment method has a module.
- Provider modules:
  - `vendors/liqpay/*` — payment module `liqpay`, method `liqpay` (flow `ONLINE`, no customer input).
  - `vendors/nova-poshta/*` — delivery and payment modules `nova-poshta`. Delivery: one method per service (`warehouse-warehouse`, `doors-warehouse` → branch; `postomat` → postomat; `warehouse-doors`, `doors-doors` → courier), customer input `{ type, settlementRef, warehouseRef }` or `{ type: 'DOOR', settlementRef, streetRef, streetName, building, apartment?, comment? }`. The directory (settlements, branches/postomats, streets) is read through the storefront queries of the Nova Poshta app (`novaPoshtaSettlements`, `novaPoshtaWarehouses`, `novaPoshtaSettlementStreets`), never from the carrier API directly. Payment: method `nova-poshta-cod` (cash on delivery; the API offers it only with Nova Poshta delivery).
  - `vendors/address-ua/*` — address module of Ukraine (`ProviderModuleType.Address`, slug `UA`): city first, from the Nova Poshta directory; the address keeps neutral fields plus the settlement hint.
  - Delivery options without a module render through the generic form built from `customerInputContract`; customer input is validated against that contract (`utils/jsonSchema.ts`) and sent only when it satisfies it.
  - `vendors/shared/createPaymentProvider.tsx` — provider-level component shared by payment modules.

### Payment methods

- Every payment method has its own UI module: the module is found by the method `providerCode`, the method component by its `code`.
- Methods are rendered in API order (`sections/payment/components/Component.tsx`), one `ProviderRenderer` per method.
- A method without a module (no provider module, or the module does not declare the method code) is hidden; outside production a `console.warn` names it once (`infra/warnMissingPaymentModule.ts`).
- Validation (`sections/payment/schema.ts`): a selected method is required, and it must have a UI module.
- When the API resets the selection (`selection.status = RESET`), the section shows `resetReason.message` as is and asks to choose a method again.

## Submit Flow

1. User clicks Submit → `Checkout.tsx` calls store `requestSubmit()`.
2. `checkoutStore.requestSubmit()` checks required sections. If missing — emits `SubmitBlocked` with a list; otherwise — `SubmitReady` with the sections payload.
3. `usePlacementController` listens to `SubmitReady` and places the order (below). The button stays disabled for the whole attempt; a second tab relies on `CHECKOUT_ALREADY_PLACED` and placement recovery.
4. When the order is accepted, `OrderAccepted` reaches the host through `onOrderAccepted`, where the cart is cleared; the checkout shows its result screen.

## Order Placement

Files: `state/placement/*`, `components/result/*`, `page/return.tsx`.

- `api.submitCheckout` sends `placeOrder` and resolves with the placement result (`PlacementResult`), user errors included. The mutation and `checkoutPlacement` share `api/fragments/placeOrderPayloadFragment.graphql`.
- Attempt journal (`attemptJournal.ts`): one record per checkout in `localStorage` (`shopana:checkout:placement-attempt:<checkoutId>`) with the idempotency key, return URL, `resultRevision`, payment flow, state (`created | sent | resolved | failed`) and the placement. The key is reused after a lost answer (`sent`), and replaced after a payment failure (regardless of `retryable`), a `resultRevision` change before payment, or `IDEMPOTENCY_KEY_PARAMETER_MISMATCH` (one automatic retry). The record is removed on a final outcome and after 24 hours; expired records of other checkouts are dropped when an attempt begins. The return URL is built once and resent byte-for-byte. Without working `localStorage` the journal keeps the attempt in memory for the page session. An attempt is resent and read from the journal alone, without loading the checkout; answers that arrive after the checkout unmounts or after the cart switched to another checkout are dropped, so the attempt stays `sent` and is resent with the same key on the next visit. A GraphQL error is an answer: the attempt is closed with that error code instead of being resent.
- Outcome (`outcome.ts`, `resolvePlacementOutcome`), by `status`, customer action and the method flow:
  - `PAID`, `AUTHORIZED`, `PAYMENT_NOT_REQUIRED`, `PAYMENT_PENDING` for `OFFLINE`/`ON_DELIVERY`, `REQUIRES_ACTION` + `INSTRUCTIONS` → accepted: result screen, cart cleared;
  - `REQUIRES_ACTION` + `REDIRECT` → redirect to the provider;
  - `REQUIRES_ACTION` + `CLIENT_SDK` → the module registered as `ProviderModuleType.PaymentSdk` under the action `sdk`; none → "payment method unavailable";
  - `REQUIRES_CONFIRMATION`, `PAYMENT_PENDING` for `ONLINE`, or a placement still running → poll `checkoutPlacement` (2 → 30 s backoff, no limit). `REQUIRES_CONFIRMATION` gets real handling with the Stripe app;
  - `PAYMENT_FAILED` → stay in checkout with the cart intact; the next submit pays again with a new key;
  - placement user errors (`CHECKOUT_ALREADY_PLACED`, `CHECKOUT_PLACEMENT_*`) → recover from the known placement. Texts are chosen by `code` on the frontend (`components/result/placementMessages.ts`); the API message is never shown, `paymentFailure.message` only as a detail.
- Recovery (`recovery.ts`) is the only module that knows how a placement is found: the return URL (`/checkout/return?checkout=<id>` now; `placement` and `token` after B4) and `checkoutPlacement(id)`. After B4 only this module changes. The return page removes the token from the address bar right after reading it.
- Reload: an unanswered request (`sent`) is resent with the same key once the checkout has loaded, only if its `resultRevision` is unchanged (otherwise the next press takes a new key); a placement in progress is polled; a resumed or unpaid redirect is offered as "continue payment" instead of leaving the page. The waiting screen has a way out: the placement goes on and is read again on the next visit.
- Return page (`page/return.tsx`, module `checkout-return` at `/checkout/return`): reads the placement from the URL or the journal, follows it to its outcome, and clears the cart only when it belongs to the placed checkout; the host's optional `onOrderAccepted` then clears its own cart state (the theme's box builder).
- Theme adapter: `useCheckoutPath`, `useCheckoutReturnPath`, and optional `useOrderPath` for the placed order page.

## Configuration

- `config.ts` — country configuration (`UA`/`INTL`) that can control visibility and localization.
- `page/*` — routing integration, redirect when `cartId` is absent (not while a placement runs or its result is shown), the return page, brand injection.

## Adding a New Section

- Create `sections/<name>/` with: `components/Container.tsx`, `components/Component.tsx`, `schema.ts`, `types.ts`, `mapper.ts` (as needed).
- Register the View container in `sections/sections.tsx` with a new `SectionId` (if needed, add it to `state/interface.ts`).
- Use `SectionContainer`/`makeSection` in the container; specify `selector` and `schema`.

## Adding a New Provider

- In `vendors/<provider>/register.ts` register modules for the required `ProviderModuleType` (payment/delivery) via `registerModule`, with the API provider code as `slug`.
- Export `default` from `module.payment.ts` / `module.shipping.ts` in `ProviderModuleApi` shape with `config` and `Component`.
- A payment module declares one method config per API method `code`; use `createPaymentProvider` for its `Component`.
- Provide Yup `schema` for methods if method-level data must be validated.
- Method components must follow `vendors/types.ts` contracts.

## Principles and Invariants

- Section containers do not render UI — they only register, validate, and publish state. Rendering happens in the View.
- All mutations are wrapped with `useCheckoutOperation` specifying `OperationKey` and optionally `sectionId`.
- Validation is powered by Yup; convert errors into `Record<string,string>`.
- `checkoutBus` is the single coordination point between UI/store/API.

## Quick Links

- Components: `components/Checkout.tsx`, `components/CheckoutView.tsx`, `components/CheckoutController.tsx`
- Data context: `context/CheckoutDataContext.tsx`
- API context: `context/CheckoutApiContext.tsx`
- Sections: `sections/*`, map: `sections/sections.tsx`
- Store and events: `state/checkoutStore.ts`, `state/checkoutBus.ts`, `state/hooks/*`
- API: `api/useCreateCheckoutApi.ts`, `api/useCheckoutOperation.ts`, `api/mutations/*`, `api/queries/*`
- Providers: `vendors/*`, `infra/ProviderRenderer.tsx`, `infra/resolveProviderConfig.ts`
- Config: `config.ts`, page: `page/*`
