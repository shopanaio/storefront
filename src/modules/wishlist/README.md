# Wishlist Module

The Wishlist module mirrors the Checkout module architecture and introduces a local-storage powered wishlist experience that can be mounted through the dynamic module registry (`/[locale]/wishlist`).

## Architecture

- **Module registration** – `registerModule('page', 'wishlist', …)` wires the page so the dynamic module route loads `src/modules/wishlist/page/page.tsx`. The module exports a lazily loaded `Wishlist` component plus `WishlistProvider` and public hooks from `src/modules/wishlist/index.ts`.
- **Data layer** – `WishlistDataProvider` loads/migrates the snapshot stored under `localStorage:wishlist:v1`, persists via helpers in `data/storage.ts`, and broadcasts changes through `wishlistBus`.
- **API layer** – `WishlistApiProvider` exposes imperative methods (`addItem`, `removeItem`, `updateItem`, `moveToCart`, `clear`) that always mutate the in-memory snapshot first, then persist. All mutations run through `useWishlistOperation` so UI state, debouncing, and toasts stay consistent.
- **State & events** – A dedicated Zustand store (`state/wishlistStore.ts`) mirrors checkout’s section tracking and emits typed events via `wishlistBus` for analytics/side-effects. Hooks (`useSectionController`, `useOperationTracker`, `useValidationAlert`) adapt the checkout patterns to wishlist semantics.
- **Sections** – The familiar `makeSection`/`SectionContainer` helpers orchestrate Saved Items panel registered via `sections/sections.ts`. Each section couples to a Yup schema so validation alerts work globally.
- **UI** – `WishlistView` renders the brand slot, sections, summary metrics, action bar, and a skeleton state while data hydrates. The controller listens for bus events (e.g., `WishlistUpdated`, `SyncRequested`) to trigger downstream effects.
- **Testing** – Unit tests cover storage helpers, API behavior, and store reducers (Vitest). Storybook stories document the primary view for QA.

## Adding new sections or actions

1. Create a view component that consumes the data context or API.
2. Wrap it with `makeSection` and add it to `sections/sections.ts`.
3. Extend the Yup schema to describe local validation requirements.
4. If the section performs mutations, prefer `useWishlistOperation` so events and toasts remain consistent.

## Persistence model

Snapshots are versioned (`wishlist:v1`) to keep future migrations isolated. All writes flow through `saveWishlist` to guarantee metadata updates and event emission, while `useWishlistStorageSync` keeps multiple tabs in sync via the `storage` event.
- **Public hooks** – Import `WishlistProvider` high in the React tree (e.g., `_app`) and use `useWishlist`, `useWishlistActions`, `useWishlistCounts`, or `useWishlistSelection` anywhere in the storefront to build add-to-wishlist buttons or counters without mounting the full module UI.
