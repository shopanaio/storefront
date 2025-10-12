/**
 * Compose a user-facing product title from product and variant titles.
 * - Trims parts
 * - Filters out empty values
 * - Joins with a single space
 *
 * @param args.productTitle Parent product title
 * @param args.variantTitle Variant title
 * @param args.fallback Fallback string when both parts are empty
 */
export function composeProductTitle(args: {
  productTitle?: string | null;
  variantTitle?: string | null;
  fallback?: string;
}): string {
  const { productTitle, variantTitle, fallback = "" } = args || {};

  const parts = [productTitle, variantTitle]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter((part) => part.length > 0);

  if (parts.length === 0) return fallback;

  return parts.join(" ");
}

export default composeProductTitle;
