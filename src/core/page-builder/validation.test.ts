import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  validateTemplate,
  getAvailableSectionsForPageType,
  getAvailableBlocksForSection,
  canSectionBeUsedOnPage,
} from './validation';
import { pageBuilderRegistry } from './registry';
import type { PageTemplate, SectionSchema, BlockSchema } from './types';

describe('Validation', () => {
  // Mock schemas
  const heroSchema: SectionSchema = {
    slug: 'hero',
    name: 'Hero Section',
    templates: ['home', 'page'],
    settings: [],
    blocks: {
      types: ['button', 'image'],
      max: 3,
    },
  };

  const featuresSchema: SectionSchema = {
    slug: 'features',
    name: 'Features Section',
    templates: ['home'],
    settings: [],
  };

  const universalSchema: SectionSchema = {
    slug: 'footer',
    name: 'Footer Section',
    settings: [],
  };

  const buttonSchema: BlockSchema = {
    slug: 'button',
    name: 'Button Block',
    settings: [],
  };

  const imageSchema: BlockSchema = {
    slug: 'image',
    name: 'Image Block',
    settings: [],
  };

  const textSchema: BlockSchema = {
    slug: 'text',
    name: 'Text Block',
    settings: [],
  };

  beforeEach(() => {
    // Register mock sections and blocks
    pageBuilderRegistry.registerSection('hero', () => Promise.resolve({ default: null as any }), heroSchema);
    pageBuilderRegistry.registerSection('features', () => Promise.resolve({ default: null as any }), featuresSchema);
    pageBuilderRegistry.registerSection('footer', () => Promise.resolve({ default: null as any }), universalSchema);
    pageBuilderRegistry.registerBlock('button', () => Promise.resolve({ default: null as any }), buttonSchema);
    pageBuilderRegistry.registerBlock('image', () => Promise.resolve({ default: null as any }), imageSchema);
    pageBuilderRegistry.registerBlock('text', () => Promise.resolve({ default: null as any }), textSchema);
  });

  afterEach(() => {
    // Clean up the registry
    // Note: This is a simplified cleanup. In a real scenario, you might want to add a reset method to the registry.
  });

  describe('validateTemplate', () => {
    it('should return no errors for a valid template', () => {
      const template: PageTemplate = {
        id: 'home-page',
        name: 'Home Page',
        pageType: 'home',
        sections: [
          {
            id: 'section-1',
            type: 'hero',
            settings: {},
            blocks: [
              { id: 'block-1', type: 'button', settings: {} },
              { id: 'block-2', type: 'image', settings: {} },
            ],
          },
          {
            id: 'section-2',
            type: 'features',
            settings: {},
          },
        ],
      };

      const errors = validateTemplate(template);

      expect(errors).toEqual([]);
    });

    it('should return error for non-existent section type', () => {
      const template: PageTemplate = {
        id: 'home-page',
        name: 'Home Page',
        pageType: 'home',
        sections: [
          {
            id: 'section-1',
            type: 'non-existent',
            settings: {},
          },
        ],
      };

      const errors = validateTemplate(template);

      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('error');
      expect(errors[0].message).toContain('not found in registry');
      expect(errors[0].sectionId).toBe('section-1');
    });

    it('should return error for section used on wrong page type', () => {
      const template: PageTemplate = {
        id: 'product-page',
        name: 'Product Page',
        pageType: 'product',
        sections: [
          {
            id: 'section-1',
            type: 'features', // Only allowed on 'home'
            settings: {},
          },
        ],
      };

      const errors = validateTemplate(template);

      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('error');
      expect(errors[0].message).toContain('cannot be used on "product" pages');
    });

    it('should allow universal sections on any page type', () => {
      const template: PageTemplate = {
        id: 'product-page',
        name: 'Product Page',
        pageType: 'product',
        sections: [
          {
            id: 'section-1',
            type: 'footer', // No templates restriction
            settings: {},
          },
        ],
      };

      const errors = validateTemplate(template);

      expect(errors).toEqual([]);
    });

    it('should return error for non-existent block type', () => {
      const template: PageTemplate = {
        id: 'home-page',
        name: 'Home Page',
        pageType: 'home',
        sections: [
          {
            id: 'section-1',
            type: 'hero',
            settings: {},
            blocks: [
              { id: 'block-1', type: 'non-existent-block', settings: {} },
            ],
          },
        ],
      };

      const errors = validateTemplate(template);

      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('error');
      expect(errors[0].message).toContain('not found in registry');
    });

    it('should return error for block not allowed in section', () => {
      const template: PageTemplate = {
        id: 'home-page',
        name: 'Home Page',
        pageType: 'home',
        sections: [
          {
            id: 'section-1',
            type: 'hero',
            settings: {},
            blocks: [
              { id: 'block-1', type: 'text', settings: {} }, // Not in allowed types
            ],
          },
        ],
      };

      const errors = validateTemplate(template);

      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('error');
      expect(errors[0].message).toContain('not allowed in section');
    });

    it('should return warning for exceeding max blocks', () => {
      const template: PageTemplate = {
        id: 'home-page',
        name: 'Home Page',
        pageType: 'home',
        sections: [
          {
            id: 'section-1',
            type: 'hero',
            settings: {},
            blocks: [
              { id: 'block-1', type: 'button', settings: {} },
              { id: 'block-2', type: 'button', settings: {} },
              { id: 'block-3', type: 'button', settings: {} },
              { id: 'block-4', type: 'button', settings: {} }, // Exceeds max of 3
            ],
          },
        ],
      };

      const errors = validateTemplate(template);

      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('warning');
      expect(errors[0].message).toContain('max allowed is 3');
    });

    it('should handle multiple validation errors', () => {
      const template: PageTemplate = {
        id: 'product-page',
        name: 'Product Page',
        pageType: 'product',
        sections: [
          {
            id: 'section-1',
            type: 'features', // Wrong page type
            settings: {},
          },
          {
            id: 'section-2',
            type: 'non-existent', // Doesn't exist
            settings: {},
          },
        ],
      };

      const errors = validateTemplate(template);

      expect(errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getAvailableSectionsForPageType', () => {
    it('should return sections for home page type', () => {
      const sections = getAvailableSectionsForPageType('home');

      expect(sections).toContain('hero');
      expect(sections).toContain('features');
      expect(sections).toContain('footer');
    });

    it('should return sections for page type', () => {
      const sections = getAvailableSectionsForPageType('page');

      expect(sections).toContain('hero');
      expect(sections).not.toContain('features');
      expect(sections).toContain('footer');
    });

    it('should include universal sections for any page type', () => {
      const sections = getAvailableSectionsForPageType('product');

      expect(sections).toContain('footer');
    });

    it('should return only universal sections for unmatched page type', () => {
      const sections = getAvailableSectionsForPageType('account');

      expect(sections).toContain('footer');
      expect(sections).not.toContain('hero');
      expect(sections).not.toContain('features');
    });
  });

  describe('getAvailableBlocksForSection', () => {
    it('should return allowed blocks for a section', () => {
      const blocks = getAvailableBlocksForSection('hero');

      expect(blocks).toEqual(['button', 'image']);
    });

    it('should return empty array for section without block restrictions', () => {
      const blocks = getAvailableBlocksForSection('footer');

      expect(blocks).toEqual([]);
    });

    it('should return empty array for non-existent section', () => {
      const blocks = getAvailableBlocksForSection('non-existent');

      expect(blocks).toEqual([]);
    });
  });

  describe('canSectionBeUsedOnPage', () => {
    it('should return true for section allowed on page type', () => {
      expect(canSectionBeUsedOnPage('hero', 'home')).toBe(true);
      expect(canSectionBeUsedOnPage('hero', 'page')).toBe(true);
    });

    it('should return false for section not allowed on page type', () => {
      expect(canSectionBeUsedOnPage('features', 'product')).toBe(false);
      expect(canSectionBeUsedOnPage('hero', 'product')).toBe(false);
    });

    it('should return true for universal sections on any page type', () => {
      expect(canSectionBeUsedOnPage('footer', 'home')).toBe(true);
      expect(canSectionBeUsedOnPage('footer', 'product')).toBe(true);
      expect(canSectionBeUsedOnPage('footer', 'account')).toBe(true);
    });

    it('should return false for non-existent section', () => {
      expect(canSectionBeUsedOnPage('non-existent', 'home')).toBe(false);
    });
  });
});
