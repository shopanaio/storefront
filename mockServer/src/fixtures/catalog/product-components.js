import { products } from "./products.js";
import { productVariants } from "./product-variants.js";
import { gid } from "../shared.js";

const componentTargetHandles = [
  "market-canvas-tote",
  "insulated-travel-bottle",
  "cedar-amber-candle",
  "mini-bluetooth-speaker",
  "silver-hoop-earrings",
  "portable-table-lamp",
  "natural-rubber-yoga-mat",
  "packable-picnic-blanket",
];

const targetProducts = componentTargetHandles.map((handle) =>
  products.find((product) => product.handle === handle));

const rotate = (items, offset) => items.map((_, index) => items[(index + offset) % items.length]);

const componentItem = ({ parentHandle, groupHandle, product, position, selected, discountPercent }) => ({
  id: gid("ProductComponentItem", `${parentHandle}-${groupHandle}-${position + 1}`),
  title: product.title,
  productId: product.id,
  defaultVariantId: product.variantIds[0],
  allowedVariantIds: product.variantIds,
  featuredMediaId: product.featuredMediaId,
  defaultSelected: selected,
  required: false,
  minQuantity: 1,
  maxQuantity: groupHandle === "essentials" ? 1 : 2,
  discountPercent,
});

const componentProducts = products.filter(({ hasComponents }) => hasComponents);

export const componentProductIds = componentProducts.map(({ id }) => id);

export const productComponentConfigurations = componentProducts.map((product, productIndex) => {
  const rotatedTargets = rotate(targetProducts, productIndex);

  return {
    id: gid("ProductComponentConfiguration", product.handle),
    productId: product.id,
    displayStyle: ["ACCORDION", "TABS", "FLAT", "WIZARD"][productIndex % 4],
    groups: [
      {
        id: gid("ProductComponentGroup", `${product.handle}-essentials`),
        title: "Choose an essential",
        required: true,
        minSelection: 1,
        maxSelection: 1,
        items: rotatedTargets.slice(0, 3).map((targetProduct, position) => componentItem({
          parentHandle: product.handle,
          groupHandle: "essentials",
          product: targetProduct,
          position,
          selected: position === 0,
          discountPercent: 10,
        })),
      },
      {
        id: gid("ProductComponentGroup", `${product.handle}-extras`),
        title: "Optional extras",
        required: false,
        minSelection: 0,
        maxSelection: 2,
        items: rotatedTargets.slice(3, 6).map((targetProduct, position) => componentItem({
          parentHandle: product.handle,
          groupHandle: "extras",
          product: targetProduct,
          position,
          selected: false,
          discountPercent: 15,
        })),
      },
    ],
  };
});

export const productComponentItems = productComponentConfigurations.flatMap(({ groups }) =>
  groups.flatMap(({ items }) => items));

export const componentVariants = productVariants.filter(({ componentConfigurationId }) =>
  componentConfigurationId !== null);
