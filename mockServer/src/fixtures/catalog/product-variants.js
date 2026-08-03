import { productDefinitions } from "./products.js";
import { FIXTURE_NOW, gid, money } from "../shared.js";

const createdAt = "2026-03-08T09:00:00.000Z";

export const productVariants = productDefinitions.flatMap((product) => {
  const optionHandle = product.optionName.toLowerCase().replaceAll(" ", "-");
  const option = {
    id: gid("ProductOption", `${product.handle}-${optionHandle}`),
    handle: optionHandle,
    name: product.optionName,
  };

  return product.variants.map((variant, index) => {
    const valueHandle = variant.name.toLowerCase().replaceAll(" ", "-");
    const id = gid("ProductVariant", `${product.handle}-${index + 1}`);

    return {
      id,
      productId: gid("Product", product.handle),
      handle: `${product.handle}-${valueHandle}`,
      title: `${product.title} — ${variant.name}`,
      sku: variant.sku,
      isDefault: index === 0,
      selectedOptions: [{
        option,
        optionValue: {
          id: gid("ProductOptionValue", `${product.handle}-${valueHandle}`),
          handle: valueHandle,
          name: variant.name,
        },
        name: product.optionName,
        value: variant.name,
      }],
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
      weight: { value: product.handle.includes("jacket") ? 1.2 : 0.5, unit: "kg" },
      dimensions: { width: 30, height: 10, length: 40, unit: "cm" },
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
