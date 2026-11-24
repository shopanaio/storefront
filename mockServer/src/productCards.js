// Product cards of listing surfaces (ADR-023): a card is built from the product and the variant
// the listing picked; its other fields are the product's and the variant's.

const CARD_ID_PREFIX = 'gid://shopana/ProductCard/';

/** Opaque card id: the product and, when the source fixed one, the variant. */
export const productCardId = (productId, variantId = null) =>
  CARD_ID_PREFIX +
  Buffer.from(
    JSON.stringify(variantId ? [productId, variantId] : [productId])
  ).toString('base64url');

const parseProductCardId = (id) => {
  if (typeof id !== 'string' || !id.startsWith(CARD_ID_PREFIX)) return null;
  try {
    const [productId, variantId = null] = JSON.parse(
      Buffer.from(id.slice(CARD_ID_PREFIX.length), 'base64url').toString()
    );
    return typeof productId === 'string' ? { productId, variantId } : null;
  } catch {
    return null;
  }
};

/** The default variant, then the first available one, then the first one. */
const defaultCardVariant = (store, product) => {
  const variants = product.variantIds
    .map((id) => store.get(id))
    .filter(Boolean);
  return (
    variants.find(({ isDefault }) => isDefault) ??
    variants.find(({ availableForSale }) => availableForSale) ??
    variants[0] ??
    null
  );
};

/**
 * The card of a product; `variant` fixes the card variant and goes into the id. Null for a
 * product without variants or a variant of another product.
 */
export const productCard = (store, product, variant = null) => {
  if (product?.__typename !== 'Product') return null;
  if (variant && variant.productId !== product.id) return null;
  const cardVariant = variant ?? defaultCardVariant(store, product);
  if (!cardVariant) return null;
  return {
    __typename: 'ProductCard',
    id: productCardId(product.id, variant?.id),
    productId: product.id,
    product,
    variant: cardVariant,
  };
};

/** `Query.productCards`: in the order of ids, null for an unknown card. */
export const productCardsByIds = (store, ids) =>
  ids.map((id) => {
    const parsed = parseProductCardId(id);
    if (!parsed) return null;
    const variant = parsed.variantId ? store.get(parsed.variantId) : null;
    if (parsed.variantId && !variant) return null;
    return productCard(store, store.get(parsed.productId), variant);
  });
