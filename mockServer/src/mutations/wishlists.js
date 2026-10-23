import { gid } from '../fixture-helpers.js';
import { customerError } from '../helpers.js';

const authenticationRequired = () =>
  customerError('AUTHENTICATION_REQUIRED', 'A customer session is required.');

/** The customer's primary wishlist, null until the first product is saved. */
export const defaultWishlist = (customer) =>
  customer.wishlists.find(({ isDefault }) => isDefault) ?? null;

const ensureDefaultWishlist = (store, customer) => {
  const existing = defaultWishlist(customer);
  if (existing) return existing;
  const now = store.now();
  const wishlist = {
    id: gid('CustomerWishlist', `runtime-${store.next('wishlist')}`),
    name: 'Saved',
    isDefault: true,
    customerId: customer.id,
    items: [],
    createdAt: now,
    updatedAt: now,
  };
  customer.wishlists.push(wishlist);
  return wishlist;
};

/** Wishlists belong to the customer: every mutation needs a customer session. */
export const wishlistMutations = (store) => ({
  wishlistProductAdd: (_, { input }, context) =>
    store.replay(
      `wishlistProductAdd:${context.customer?.id ?? 'anonymous'}`,
      input.idempotencyKey,
      () => {
        const customer = context.customer;
        if (!customer)
          return { wishlistItem: null, userErrors: [authenticationRequired()] };
        if (store.get(input.productId)?.__typename !== 'Product') {
          return {
            wishlistItem: null,
            userErrors: [
              customerError('PRODUCT_NOT_FOUND', 'Product was not found', [
                'productId',
              ]),
            ],
          };
        }
        const wishlist = input.wishlistId
          ? customer.wishlists.find(({ id }) => id === input.wishlistId)
          : ensureDefaultWishlist(store, customer);
        if (!wishlist) {
          return {
            wishlistItem: null,
            userErrors: [
              customerError('NOT_FOUND', 'Wishlist was not found', [
                'wishlistId',
              ]),
            ],
          };
        }

        // Saving a product again answers the item it already has.
        let item = wishlist.items.find(
          ({ productId }) => productId === input.productId
        );
        if (!item) {
          const now = store.now();
          item = {
            id: gid(
              'CustomerWishlistItem',
              `runtime-${store.next('wishlist-item')}`
            ),
            wishlistId: wishlist.id,
            productId: input.productId,
            addedAt: now,
          };
          // Items are listed newest first.
          wishlist.items.unshift(item);
          wishlist.updatedAt = now;
          store.reindex();
        }
        return { wishlistItem: item, userErrors: [] };
      }
    ),

  wishlistProductRemove: (_, { input }, context) =>
    store.replay(
      `wishlistProductRemove:${context.customer?.id ?? 'anonymous'}`,
      input.idempotencyKey,
      () => {
        const customer = context.customer;
        if (!customer)
          return {
            deletedWishlistItemId: null,
            userErrors: [authenticationRequired()],
          };
        const wishlist = customer.wishlists.find(({ items }) =>
          items.some(({ id }) => id === input.itemId)
        );
        if (!wishlist) {
          return {
            deletedWishlistItemId: null,
            userErrors: [
              customerError('NOT_FOUND', 'Wishlist item was not found', [
                'itemId',
              ]),
            ],
          };
        }
        wishlist.items = wishlist.items.filter(({ id }) => id !== input.itemId);
        wishlist.updatedAt = store.now();
        store.reindex();
        return { deletedWishlistItemId: input.itemId, userErrors: [] };
      }
    ),
});
