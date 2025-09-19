export const calcSaleMoney = (oldPrice?: number, newPrice?: number): string | null => {
  if (
    typeof oldPrice !== "number" ||
    typeof newPrice !== "number" ||
    oldPrice <= newPrice
  ) {
    return null;
  }

  const sale = Math.round(oldPrice - newPrice);
  return sale.toString();
};
