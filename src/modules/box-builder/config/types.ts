/**
 * TypeScript types for Box Builder configuration
 */

export interface CategoryConfig {
  /** Unique handle/identifier for the category */
  handle: string;
  /** Display name key for translations - optional */
  titleKey?: string;
  /** Whether this category is required for the step to work */
  required?: boolean;
  /** Optional description key for translations */
  descriptionKey?: string;
}

export interface Step1Config {
  /** Default category handle for boxes if not provided via route params */
  defaultBoxCategory: string;
}

export interface Step2Config {
  /** List of categories that will be shown in step 2 */
  categories: CategoryConfig[];
}

export interface Step3Config {
  /** Category configuration for cards/postcards */
  category: CategoryConfig;
}

export interface BoxBuilderConfig {
  /** Step 1: Box selection configuration */
  step1: Step1Config;
  /** Step 2: Product selection configuration */
  step2: Step2Config;
  /** Step 3: Card selection configuration */
  step3: Step3Config;
}

/**
 * Runtime validation for category config
 */
export const validateCategoryConfig = (config: CategoryConfig): boolean => {
  return !!(config.handle && typeof config.handle === 'string' && config.handle.trim().length > 0);
};

/**
 * Runtime validation for box builder config
 */
export const validateBoxBuilderConfig = (config: BoxBuilderConfig): string[] => {
  const errors: string[] = [];

  // Validate step 1
  if (!config.step1?.defaultBoxCategory) {
    errors.push('Step 1: defaultBoxCategory is required');
  }

  // Validate step 2
  if (!config.step2?.categories || !Array.isArray(config.step2.categories)) {
    errors.push('Step 2: categories array is required');
  } else if (config.step2.categories.length === 0) {
    errors.push('Step 2: at least one category is required');
  } else {
    config.step2.categories.forEach((cat, index) => {
      if (!validateCategoryConfig(cat)) {
        errors.push(`Step 2: category at index ${index} has invalid handle`);
      }
    });
  }

  // Validate step 3
  if (!config.step3?.category) {
    errors.push('Step 3: category config is required');
  } else if (!validateCategoryConfig(config.step3.category)) {
    errors.push('Step 3: category has invalid handle');
  }

  return errors;
};
