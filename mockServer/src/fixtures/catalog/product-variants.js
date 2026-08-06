import { productDefinitions } from "./products.js";
import { FIXTURE_NOW, gid, money } from "../shared.js";

const createdAt = "2026-03-08T09:00:00.000Z";

const optionValueHandle = (value) => value
  .toLowerCase()
  .replaceAll("&", "and")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

export const productVariants = productDefinitions.flatMap((product) => {
  const options = product.options ?? [{ name: product.optionName }];

  return product.variants.map((variant, index) => {
    const variantHandle = optionValueHandle(variant.name);
    const id = gid("ProductVariant", `${product.handle}-${index + 1}`);

    return {
      id,
      productId: gid("Product", product.handle),
      handle: `${product.handle}-${variantHandle}`,
      title: `${product.title} — ${variant.name}`,
      sku: variant.sku,
      isDefault: index === 0,
      selectedOptions: options.map((option) => {
        const optionHandle = optionValueHandle(option.name);
        const value = variant.optionValues?.[option.name] ?? variant.name;
        const valueHandle = optionValueHandle(value);
        const valueId = product.options
          ? `${product.handle}-${optionHandle}-${valueHandle}`
          : `${product.handle}-${valueHandle}`;

        return {
          option: {
            id: gid("ProductOption", `${product.handle}-${optionHandle}`),
            handle: optionHandle,
            name: option.name,
          },
          optionValue: {
            id: gid("ProductOptionValue", valueId),
            handle: valueHandle,
            name: value,
          },
          name: option.name,
          value,
        };
      }),
      price: money(variant.price),
      compareAtPrice: variant.compareAtPrice === null ? null : money(variant.compareAtPrice),
      availableForSale: variant.quantity > 0,
      currentlyNotInStock: variant.quantity === 0,
      quantityAvailable: variant.quantity,
      inventoryItem: {
        id: gid("InventoryItem", variant.sku),
        variantId: id,
        sku: variant.sku,
        tracked: true,
        requiresShipping: true,
        inventoryPolicy: "DENY",
        quantityAvailable: variant.quantity,
        availableForSale: variant.quantity > 0,
        currentlyNotInStock: variant.quantity === 0,
      },
      requiresShipping: true,
      weight: variant.weight ?? { value: product.categoryHandles.includes("travel") ? 1.2 : 0.5, unit: "kg" },
      dimensions: { width: 30, height: 12, length: 40, unit: "cm" },
      mediaIds: [gid("MediaImage", `product-${product.handle}`)],
      featuredMediaId: gid("MediaImage", `product-${product.handle}`),
      componentConfigurationId: product.hasComponents
        ? gid("ProductComponentConfiguration", product.handle)
        : null,
      createdAt,
      updatedAt: FIXTURE_NOW,
    };
  });
});
