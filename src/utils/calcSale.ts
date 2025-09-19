export const calcSale = (oldPrice?: number, newPrice?: number): string | null => {
  if (
    typeof oldPrice !== "number" ||
    typeof newPrice !== "number" ||
    oldPrice <= newPrice
  ) {
    return null;
  }

  const salePercent = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  return salePercent.toString();
};
