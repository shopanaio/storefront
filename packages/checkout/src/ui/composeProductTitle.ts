export function composeProductTitle({
  productTitle,
  variantTitle,
  fallback = '',
}: {
  productTitle?: string | null;
  variantTitle?: string | null;
  fallback?: string;
}) {
  const parts = [productTitle, variantTitle]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean);
  return parts.join(' ') || fallback;
}
