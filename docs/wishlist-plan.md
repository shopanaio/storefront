# Wishlist Module Implementation Plan

## 1. Module Scaffolding
- Mirror the checkout module structure under `src/modules/wishlist`, including `index.ts`, `register.ts`, `page/`, `components/`, `state/`, `context/`, `sections/`, `hooks/`, and `utils/`.
- Register the page via `registerModule('page', 'wishlist', ...)` so `/[locale]/wishlist` resolves through the dynamic module route.
- Export a dynamic `Wishlist` component from `index.ts` (using `next/dynamic`) to keep parity with `Checkout` lazy loading.

## 2. Local Data Layer
- Introduce `WishlistDataContext` that reads/writes wishlist state from `localStorage` under a namespaced key (e.g., `wishlist:v1`), handling JSON parse/stringify and SSR fallbacks (no `window` guard).
- Provide helpers (`loadWishlist`, `saveWishlist`, `migrateWishlist`) inside `data/storage.ts` to encapsulate persistence logic and enable future migrations/versioning.
- Add `useWishlistStorageSync` hook that subscribes to the `storage` event to keep multiple tabs in sync and updates the context/store when external changes occur.

## 3. API & Controller
- Implement `WishlistApiContext` with `useCreateWishlistApi` returning methods such as `addItem`, `removeItem`, `updateItem`, `moveToCart`, and `clear`. Each method updates the local store first, then persists via the storage helpers.
- Create a lightweight `useWishlistOperation` hook (modeled on checkout’s `useCheckoutOperation`) to wrap local mutations with debouncing, `OperationStart/End/Error` event emission, and toast notifications for failures (e.g., storage quota exceeded).
- Build `WishlistController` that mounts once, wires `useOperationTracker`-like logic, listens to completion events (e.g., `WishlistUpdated`), and triggers side effects such as analytics calls or cart sync hooks.

## 4. State & Events
- Define a Zustand store in `state/wishlistStore.ts` that tracks sections, selected items, bulk actions, and derived counts. Provide actions to register sections, mark them valid/invalid, and manage wishlist item mutations.
- Create `state/wishlistBus.ts` (Emittery-based) with typed events: `ItemAdded`, `ItemRemoved`, `ItemUpdated`, `WishlistLoaded`, `WishlistSaved`, `SyncRequested`, etc., mirroring checkout’s bus for consistent orchestration.
- Add hooks (`useSectionController`, `useOperationTracker`, `useValidationAlert`) scoped for wishlist behavior but sharing patterns with the checkout counterparts.

## 5. UI Structure
- Introduce `Wishlist` container and `WishlistView` components analogous to `Checkout`, wiring contexts, controller, and validation alerts.
- Reuse the section system (`makeSection`, `SectionContainer`) for Wishlist panels such as Saved Items, Recommendations, Notes/Tags, and Share/Email blocks; register them via `sections/sections.ts`.
- Implement shared UI pieces (actions bar, summary/metrics, skeleton loaders) to match checkout’s UX conventions and allow brand injection (`features`, `brand` props) for customization.

## 6. Validation & UX
- Use Yup schemas per section to ensure local data integrity (e.g., max items, note length, valid SKU format) before persisting. Tie validation results to the store’s section state to enable global alerts.
- Provide a wishlist-specific `useValidationAlert` that listens to submit/bulk actions and surfaces actionable error messages when sections are incomplete or invalid.
- Handle failure cases gracefully: show inline errors when storage writes fail, and offer fallbacks (e.g., disable add-to-cart when quota exceeded).

## 7. Testing & Documentation
- Add unit tests for storage helpers (serialization, migrations), API methods, and Zustand reducers using Jest/Vitest. Mock `localStorage` to validate edge cases.
- Create Storybook stories for key sections/components to ensure visual parity and easier QA.
- Document architecture and extension points in `src/modules/wishlist/README.md`, highlighting the localStorage persistence model, event bus, and how to add new sections or actions.
