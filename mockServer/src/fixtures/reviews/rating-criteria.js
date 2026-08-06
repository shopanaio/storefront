import { FIXTURE_NOW, gid } from "../shared.js";

const createdAt = "2026-01-10T09:00:00.000Z";

const wetFoodProductHandles = [
  "chicken-cat-kibble",
  "sheba-perfect-portions-cat-wet-food",
  "whiskas-adult-cat-pouches",
  "brit-care-cat-pouches",
  "club-4-paws-adult-dog-pouches",
  "turkey-dog-stew",
  "salmon-cat-pate",
];

const criterion = (code, title, description, sortIndex, appliesToAllProducts, assignments = []) => ({
  id: gid("ReviewRatingCriterion", code),
  code,
  defaultTitle: title,
  defaultDescription: description,
  title,
  description,
  weight: 1,
  isRequired: code === "quality",
  isActive: true,
  appliesToAllProducts,
  sortIndex,
  translations: [],
  assignments: assignments.map(({ targetType, handle }, index) => ({
    id: gid("ReviewRatingCriterionAssignment", `${code}-${handle}`),
    criterionId: gid("ReviewRatingCriterion", code),
    targetType,
    targetId: gid(targetType === "PRODUCT" ? "Product" : "Category", handle),
    isRequired: code === "fit",
    sortIndex: index,
    createdAt,
  })),
  createdAt,
  updatedAt: FIXTURE_NOW,
});

export const reviewRatingCriteria = [
  criterion("quality", "Quality", "Ingredients, materials, construction, and finish.", 0, true),
  criterion("value", "Value", "Overall value for the pet and their person.", 1, true),
  criterion("fit", "Pet fit", "How accurately the item fits compared with the size guide.", 2, false,
    ["dogs", "cats", "collars-leashes", "travel"].map((handle) => ({ targetType: "CATEGORY", handle }))),
  criterion("digestibility", "Digestibility", "How easily the food is digested by the pet.", 3, false,
    wetFoodProductHandles.map((handle) => ({ targetType: "PRODUCT", handle }))),
  criterion("ingredients", "Ingredients", "Customer perception of the ingredient quality.", 4, false,
    wetFoodProductHandles.map((handle) => ({ targetType: "PRODUCT", handle }))),
  criterion("nutritional-value", "Nutritional value", "Perceived balance and nutritional value.", 5, false,
    wetFoodProductHandles.map((handle) => ({ targetType: "PRODUCT", handle }))),
  criterion("texture-consistency", "Texture and consistency", "How pets respond to the food texture and consistency.", 6, false,
    wetFoodProductHandles.map((handle) => ({ targetType: "PRODUCT", handle }))),
];
