import { describe, it, expect, beforeEach } from 'vitest';
import { pageBuilderRegistry } from './registry';
import type { LayoutSchema } from './types';

describe('Layout Registry', () => {
  const mockLayoutSchema: LayoutSchema = {
    slug: 'test-layout',
    name: 'Test Layout',
    description: 'A test layout',
    settings: [
      {
        type: 'text',
        id: 'title',
        label: 'Title',
        default: 'Default Title',
      },
    ],
    sections: {
      types: ['hero', 'footer'],
      max: 5,
    },
  };

  beforeEach(() => {
    // Clear any existing layouts
    const layouts = pageBuilderRegistry.listLayouts();
    layouts.forEach((slug) => {
      // Note: In a real implementation, you might want to add an unregister method
    });
  });

  it('should register a layout', () => {
    pageBuilderRegistry.registerLayout(
      'test-layout',
      () => Promise.resolve({ default: () => null } as any),
      mockLayoutSchema
    );

    const layout = pageBuilderRegistry.getLayout('test-layout');
    expect(layout).toBeDefined();
    expect(layout?.slug).toBe('test-layout');
    expect(layout?.schema).toEqual(mockLayoutSchema);
  });

  it('should get layout schema', () => {
    pageBuilderRegistry.registerLayout(
      'test-layout',
      () => Promise.resolve({ default: () => null } as any),
      mockLayoutSchema
    );

    const schema = pageBuilderRegistry.getLayoutSchema('test-layout');
    expect(schema).toEqual(mockLayoutSchema);
  });

  it('should return undefined for non-existent layout', () => {
    const layout = pageBuilderRegistry.getLayout('non-existent');
    expect(layout).toBeUndefined();
  });

  it('should list all layouts', () => {
    pageBuilderRegistry.registerLayout(
      'layout-1',
      () => Promise.resolve({ default: () => null } as any),
      mockLayoutSchema
    );
    pageBuilderRegistry.registerLayout(
      'layout-2',
      () => Promise.resolve({ default: () => null } as any),
      mockLayoutSchema
    );

    const layouts = pageBuilderRegistry.listLayouts();
    expect(layouts).toContain('layout-1');
    expect(layouts).toContain('layout-2');
  });

  it('should load layout component', async () => {
    const mockComponent = () => null;
    pageBuilderRegistry.registerLayout(
      'test-layout',
      () => Promise.resolve({ default: mockComponent } as any),
      mockLayoutSchema
    );

    const component = await pageBuilderRegistry.loadLayout('test-layout');
    expect(component).toBe(mockComponent);
  });

  it('should return null for non-existent layout when loading', async () => {
    const component = await pageBuilderRegistry.loadLayout('non-existent');
    expect(component).toBeNull();
  });
});

describe('Layout Schema Validation', () => {
  it('should have correct layout schema structure', () => {
    const schema: LayoutSchema = {
      slug: 'default',
      name: 'Default Layout',
      description: 'Standard layout',
      templates: ['home', 'page'],
      settings: [
        {
          type: 'color',
          id: 'bgColor',
          label: 'Background Color',
          default: '#ffffff',
        },
      ],
      sections: {
        types: ['hero', 'footer'],
        max: 10,
      },
    };

    expect(schema.slug).toBe('default');
    expect(schema.name).toBe('Default Layout');
    expect(schema.settings).toHaveLength(1);
    expect(schema.sections?.types).toContain('hero');
    expect(schema.sections?.max).toBe(10);
  });

  it('should allow layout schema without sections constraint', () => {
    const schema: LayoutSchema = {
      slug: 'simple',
      name: 'Simple Layout',
      settings: [],
    };

    expect(schema.sections).toBeUndefined();
  });

  it('should allow layout schema without templates constraint', () => {
    const schema: LayoutSchema = {
      slug: 'universal',
      name: 'Universal Layout',
      settings: [],
    };

    expect(schema.templates).toBeUndefined();
  });
});
