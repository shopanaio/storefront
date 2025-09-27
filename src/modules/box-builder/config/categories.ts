/**
 * Box Builder categories configuration
 *
 * This config defines which categories are used in each step of the box builder process.
 * You can modify these handles to change which categories appear in each step.
 */

import {
  BoxBuilderConfig,
  validateBoxBuilderConfig
} from './types';

/**
 * Default box builder configuration
 * Modify this object to change which categories are used in each step
 */
export const BOX_BUILDER_CONFIG: BoxBuilderConfig = {
  step1: {
    defaultBoxCategory: "electronics"
  },

  step2: {
    categories: [
      {
        handle: "electronics",
        titleKey: "categories.electronics",
        required: true
      },
      {
        handle: "sport-i-otdyh",
        titleKey: "categories.sport",
        required: true
      },
      {
        handle: "toys-kids",
        titleKey: "categories.toys",
        required: true
      }
    ]
  },

  step3: {
    category: {
      handle: "electronics",
      titleKey: "categories.postcards",
      required: false
    }
  }
};

/**
 * Get all category handles used in step 2
 */
export const getStep2CategoryHandles = (): string[] => {
  return BOX_BUILDER_CONFIG.step2.categories.map(cat => cat.handle);
};

/**
 * Get step 3 category handle
 */
export const getStep3CategoryHandle = (): string => {
  return BOX_BUILDER_CONFIG.step3.category.handle;
};

/**
 * Get default box category handle for step 1
 */
export const getDefaultBoxCategoryHandle = (): string => {
  return BOX_BUILDER_CONFIG.step1.defaultBoxCategory;
};

/**
 * Get all category handles used across all steps
 */
export const getAllCategoryHandles = (): string[] => {
  const step2Handles = getStep2CategoryHandles();
  const step3Handle = getStep3CategoryHandle();

  return [...step2Handles, step3Handle];
};

/**
 * Validate the current box builder configuration
 * Throws an error if the config is invalid
 */
export const validateConfig = (): void => {
  const errors = validateBoxBuilderConfig(BOX_BUILDER_CONFIG);

  if (errors.length > 0) {
    throw new Error(`Box Builder configuration is invalid:\n${errors.join('\n')}`);
  }
};

// Validate config on module load
validateConfig();
