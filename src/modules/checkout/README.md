# Checkout Module Architecture

This document describes the checkout module architecture: its key layers, events, state, integrations, and the provider plugin system (shipping/payment). It is intended for developers extending and maintaining the module.

## Overview

The module is composed of several layers:
- UI layer: visual components and checkout sections
- Data: loading and normalizing checkout data via Relay/GraphQL
- State: local Zustand store and an event bus
- API: atomic checkout operations (mutations)
- Validation: Yup schemas for sections and provider methods
- Provider plugins: shipping/payment providers registered via the module registry

The module page entry is `page/page.tsx`, client is `page/client.tsx`; public export is `index.ts` (dynamic component import).

## UI Layer

Key components:
- `components/Checkout.tsx`: Checkout container. Mounts data (`CheckoutDataContextProvider`) and API (`CheckoutApiProvider`) contexts, wires the controller (`CheckoutController`), renders progress and the view (`CheckoutView`). Handles submit via `useCheckoutStore().requestSubmit()` and shows validation alerts via `useValidationAlert`.
- `components/CheckoutController.tsx`: subscribes to `SubmitCompleted` and calls `onConfirm`. Hooks in `useOperationTracker` and `useSubmitHandler`.
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
  - Loads checkout via Relay `loadCheckoutQuery.shopana` with `useQueryLoader`.
  - Reads a fragment with `useCheckoutFragment`, converts API type to domain `Checkout.Checkout` via `mapApiCheckoutToCheckout`.
  - Provides `checkout`, `loading/loaded`, and errors.
- `context/CheckoutApiContext.tsx`:
  - Builds `CheckoutApi` via `api/useCreateCheckoutApi` and exposes it through `useCheckoutApi`.

## State and Events

- Store: `state/checkoutStore.ts` (Zustand)
  - Holds section map (`sections`), active operation counter, selected methods, etc.
  - Actions: register/unregister section, mark valid/invalid, busy, required, `requestSubmit()`.
  - `requestSubmit()` computes missing required sections (`computeMissingRequiredSections`) and emits `SubmitBlocked` or `SubmitReady` to the `checkoutBus`.
- Event bus: `state/checkoutBus.ts` (Emittery)
  - Typed events: section lifecycle, validity, method selection, submit lifecycle (`SubmitRequested/Blocked/Ready/Completed`), operation statuses (`OperationStart/End/Error`).
  - Operation keys — `OperationKey` for unified mutation tracking.
- State hooks:
  - `state/hooks/useSectionController.ts`: registers a section in the store, syncs busy via operation events, publishes valid/invalid/reset.
  - `state/hooks/useSubmitHandler.ts`: listens to `SubmitReady`, calls `api.submitCheckout`, then emits `SubmitCompleted`.
  - `hooks/useValidationAlert.ts`: listens to submit blocks and builds a message listing required sections.

## API Layer

- API contract: `api/interface.ts` — set of methods for atomic operations (select payment/shipping, addresses, recipients, promo codes, note, submit).
- API factory implementation: `api/useCreateCheckoutApi.ts`
  - Uses `useCheckoutOperation` for each operation with `OperationKey` and `sectionId`.
  - Automatically injects `checkoutId` from `CheckoutDataContext` into all calls.
- Mutation wrapper: `api/useCheckoutOperation.ts`
  - Wraps Relay `useMutation` with: promise-based API, debounce, race protection, `OperationStart/End/Error` events, and optional error toasts.
  - Supports `commit` and `commitScheduled`.

## Validation

- Shared utils: `utils/validation.ts`
  - `extractYupErrors` — extracts Yup errors into `Record<string,string>`.
  - `buildSelectedProviderMethodSchema` — builds a schema for a selected method field (payment/shipping) with method-level validation.
- Section schemas live in `sections/*/schema.ts` and are wired by section containers.

## Provider Plugin System (shipping/payment)

- Types and contracts: `vendors/types.ts` — `ProviderModuleType` (payment/delivery), `ProviderConfig`, `ProviderMethodConfig`, `ProviderModuleApi`, and component props.
- Module registry: `modules/registry.ts` — minimal typed registry with `register(type, slug, loader)` and `resolve(type, slug)`.
- Providers autoload: `vendors/autoload.ts` — recursively loads all `register.*` in `vendors/*`.
- Provider render: `infra/ProviderRenderer.tsx` — resolves a provider by `moduleType` and `provider` from the registry, loads the module asynchronously, and renders it, passing `onSelectMethod`, `onUpdateMethodData`, and `deliveryAddress`.
- Config resolve: `infra/resolveProviderConfig.ts` — extracts synchronously available provider `config` (if present) for validation.
- Provider examples:
  - `vendors/novaposta/*` — shipping (warehouse/courier) and cash-on-delivery payment.
  - `vendors/bank_transfer/*` — bank transfer payment.

## Submit Flow

1. User clicks Submit → `Checkout.tsx` calls store `requestSubmit()`.
2. `checkoutStore.requestSubmit()` checks required sections. If missing — emits `SubmitBlocked` with a list; otherwise — `SubmitReady` with the sections payload.
3. `useSubmitHandler` listens to `SubmitReady`, calls `api.submitCheckout()`, and then emits `SubmitCompleted`.
4. `CheckoutController` listens to `SubmitCompleted` and calls `onConfirm` (redirect/navigation).

## Configuration

- `config.ts` — country configuration (`UA`/`INTL`) that can control visibility and localization.
- `page/*` — routing integration, redirect when `cartId` is absent, brand injection.

## Adding a New Section

- Create `sections/<name>/` with: `components/Container.tsx`, `components/Component.tsx`, `schema.ts`, `types.ts`, `mapper.ts` (as needed).
- Register the View container in `sections/sections.tsx` with a new `SectionId` (if needed, add it to `state/interface.ts`).
- Use `SectionContainer`/`makeSection` in the container; specify `selector` and `schema`.

## Adding a New Provider

- In `vendors/<provider>/register.ts` register modules for the required `ProviderModuleType` (payment/delivery) via `registerModule`.
- Export `default` from `module.payment.ts` / `module.shipping.ts` in `ProviderModuleApi` shape with `config` and `Component`.
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
