import { FIXTURE_NOW, gid } from "../shared.js";

const createdAt = "2026-01-10T09:00:00.000Z";

const criterion = (code, title, description, sortIndex, appliesToAllProducts, categoryHandles = []) => ({
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
  assignments: categoryHandles.map((handle, index) => ({
    id: gid("ReviewRatingCriterionAssignment", `${code}-${handle}`),
    criterionId: gid("ReviewRatingCriterion", code),
    targetType: "CATEGORY",
    targetId: gid("Category", handle),
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
  criterion("fit", "Pet fit", "How accurately the item fits compared with the size guide.", 2, false, ["dogs", "cats", "collars-leashes", "travel"]),
];
