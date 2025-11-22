import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ComponentType } from 'react';
import {
  PageBuilderRegistry,
  type SectionRegistryRecord,
  type BlockRegistryRecord,
  type AsyncLoader,
} from './registry';
import type {
  SectionProps,
  BlockProps,
  SectionSchema,
  BlockSchema,
  PageBuilderComponentModule,
} from './types';

describe('PageBuilderRegistry', () => {
  let registry: PageBuilderRegistry;

  beforeEach(() => {
    // Create a fresh registry instance for each test
    registry = new PageBuilderRegistry();
  });

  describe('Section Registration', () => {
    const mockSectionSchema: SectionSchema = {
      slug: 'hero',
      name: 'Hero Section',
      description: 'A hero section for landing pages',
      templates: ['home', 'page'],
      settings: [
        {
          type: 'text',
          id: 'title',
          label: 'Title',
          default: 'Welcome',
        },
      ],
    };

    const mockSectionLoader: AsyncLoader<PageBuilderComponentModule<SectionProps>> = () =>
      Promise.resolve({
        default: (() => null) as ComponentType<SectionProps>,
      });

    it('should register a section', () => {
      registry.registerSection('hero', mockSectionLoader, mockSectionSchema);

      const section = registry.getSection('hero');

      expect(section).toBeDefined();
      expect(section?.slug).toBe('hero');
      expect(section?.schema).toEqual(mockSectionSchema);
    });

    it('should list all registered sections', () => {
      registry.registerSection('hero', mockSectionLoader, mockSectionSchema);
      registry.registerSection('features', mockSectionLoader, {
        ...mockSectionSchema,
        slug: 'features',
      });

      const sections = registry.listSections();

      expect(sections).toHaveLength(2);
      expect(sections).toContain('hero');
      expect(sections).toContain('features');
    });

    it('should get section schema by slug', () => {
      registry.registerSection('hero', mockSectionLoader, mockSectionSchema);

      const schema = registry.getSectionSchema('hero');

      expect(schema).toEqual(mockSectionSchema);
    });

    it('should return undefined for non-existent section', () => {
      const section = registry.getSection('non-existent');

      expect(section).toBeUndefined();
    });

    it('should load section component', async () => {
      const mockComponent = vi.fn() as ComponentType<SectionProps>;
      const loader = () =>
        Promise.resolve({
          default: mockComponent,
        });

      registry.registerSection('hero', loader, mockSectionSchema);

      const component = await registry.loadSection('hero');

      expect(component).toBe(mockComponent);
    });

    it('should return null when loading non-existent section', async () => {
      const component = await registry.loadSection('non-existent');

      expect(component).toBeNull();
    });

    it('should handle synchronous loaders', async () => {
      const mockComponent = vi.fn() as ComponentType<SectionProps>;
      const syncLoader = () => ({
        default: mockComponent,
      });

      registry.registerSection('hero', syncLoader, mockSectionSchema);

      const component = await registry.loadSection('hero');

      expect(component).toBe(mockComponent);
    });
  });

  describe('Block Registration', () => {
    const mockBlockSchema: BlockSchema = {
      slug: 'button',
      name: 'Button Block',
      description: 'A clickable button',
      settings: [
        {
          type: 'text',
          id: 'label',
          label: 'Button Label',
          default: 'Click me',
        },
      ],
    };

    const mockBlockLoader: AsyncLoader<PageBuilderComponentModule<BlockProps>> = () =>
      Promise.resolve({
        default: (() => null) as ComponentType<BlockProps>,
      });

    it('should register a block', () => {
      registry.registerBlock('button', mockBlockLoader, mockBlockSchema);

      const block = registry.getBlock('button');

      expect(block).toBeDefined();
      expect(block?.slug).toBe('button');
      expect(block?.schema).toEqual(mockBlockSchema);
    });

    it('should list all registered blocks', () => {
      registry.registerBlock('button', mockBlockLoader, mockBlockSchema);
      registry.registerBlock('image', mockBlockLoader, {
        ...mockBlockSchema,
        slug: 'image',
      });

      const blocks = registry.listBlocks();

      expect(blocks).toHaveLength(2);
      expect(blocks).toContain('button');
      expect(blocks).toContain('image');
    });

    it('should get block schema by slug', () => {
      registry.registerBlock('button', mockBlockLoader, mockBlockSchema);

      const schema = registry.getBlockSchema('button');

      expect(schema).toEqual(mockBlockSchema);
    });

    it('should return undefined for non-existent block', () => {
      const block = registry.getBlock('non-existent');

      expect(block).toBeUndefined();
    });

    it('should load block component', async () => {
      const mockComponent = vi.fn() as ComponentType<BlockProps>;
      const loader = () =>
        Promise.resolve({
          default: mockComponent,
        });

      registry.registerBlock('button', loader, mockBlockSchema);

      const component = await registry.loadBlock('button');

      expect(component).toBe(mockComponent);
    });

    it('should return null when loading non-existent block', async () => {
      const component = await registry.loadBlock('non-existent');

      expect(component).toBeNull();
    });
  });

  describe('Mixed Registration', () => {
    it('should handle both sections and blocks independently', () => {
      const sectionSchema: SectionSchema = {
        slug: 'hero',
        name: 'Hero',
        settings: [],
      };

      const blockSchema: BlockSchema = {
        slug: 'button',
        name: 'Button',
        settings: [],
      };

      const loader = () => Promise.resolve({ default: (() => null) as any });

      registry.registerSection('hero', loader, sectionSchema);
      registry.registerBlock('button', loader, blockSchema);

      expect(registry.listSections()).toEqual(['hero']);
      expect(registry.listBlocks()).toEqual(['button']);
      expect(registry.getSectionSchema('hero')).toEqual(sectionSchema);
      expect(registry.getBlockSchema('button')).toEqual(blockSchema);
    });

    it('should allow sections and blocks with the same slug', () => {
      const sectionSchema: SectionSchema = {
        slug: 'content',
        name: 'Content Section',
        settings: [],
      };

      const blockSchema: BlockSchema = {
        slug: 'content',
        name: 'Content Block',
        settings: [],
      };

      const loader = () => Promise.resolve({ default: (() => null) as any });

      registry.registerSection('content', loader, sectionSchema);
      registry.registerBlock('content', loader, blockSchema);

      expect(registry.getSectionSchema('content')).toEqual(sectionSchema);
      expect(registry.getBlockSchema('content')).toEqual(blockSchema);
    });
  });

  describe('Overwriting Registration', () => {
    it('should overwrite section when registered again', () => {
      const schema1: SectionSchema = {
        slug: 'hero',
        name: 'Hero V1',
        settings: [],
      };

      const schema2: SectionSchema = {
        slug: 'hero',
        name: 'Hero V2',
        settings: [],
      };

      const loader = () => Promise.resolve({ default: (() => null) as any });

      registry.registerSection('hero', loader, schema1);
      registry.registerSection('hero', loader, schema2);

      const schema = registry.getSectionSchema('hero');
      expect(schema?.name).toBe('Hero V2');
    });

    it('should overwrite block when registered again', () => {
      const schema1: BlockSchema = {
        slug: 'button',
        name: 'Button V1',
        settings: [],
      };

      const schema2: BlockSchema = {
        slug: 'button',
        name: 'Button V2',
        settings: [],
      };

      const loader = () => Promise.resolve({ default: (() => null) as any });

      registry.registerBlock('button', loader, schema1);
      registry.registerBlock('button', loader, schema2);

      const schema = registry.getBlockSchema('button');
      expect(schema?.name).toBe('Button V2');
    });
  });
});
