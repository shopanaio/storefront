import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPageBuilderStore } from './store';
import type {
  PageTemplate,
  SectionInstance,
  BlockInstance,
  LayoutInstance,
  SectionSchema,
  BlockSchema,
  LayoutSchema,
} from './types';

// Mock the registry
vi.mock('./registry', () => ({
  pageBuilderRegistry: {
    getSectionSchema: vi.fn((slug: string) => {
      const schemas: Record<string, SectionSchema> = {
        hero: {
          slug: 'hero',
          name: 'Hero Section',
          settings: [],
        },
        features: {
          slug: 'features',
          name: 'Features Section',
          settings: [],
        },
        footer: {
          slug: 'footer',
          name: 'Footer Section',
          settings: [],
        },
      };
      return schemas[slug];
    }),
    getBlockSchema: vi.fn((slug: string) => {
      const schemas: Record<string, BlockSchema> = {
        button: {
          slug: 'button',
          name: 'Button Block',
          settings: [],
        },
        image: {
          slug: 'image',
          name: 'Image Block',
          settings: [],
        },
      };
      return schemas[slug];
    }),
    getLayoutSchema: vi.fn((slug: string) => {
      const schemas: Record<string, LayoutSchema> = {
        default: {
          slug: 'default',
          name: 'Default Layout',
          settings: [],
        },
      };
      return schemas[slug];
    }),
  },
}));

describe('PageBuilder Store', () => {
  describe('Initial State', () => {
    it('should create store with default state', () => {
      const store = createPageBuilderStore();
      const state = store.getState();

      expect(state.pageId).toBe('');
      expect(state.pageName).toBe('');
      expect(state.data).toBeUndefined();
      expect(state.metadata).toEqual({});
      expect(state.sections).toEqual({});
      expect(state.sectionOrder).toEqual([]);
      expect(state.blocks).toEqual({});
      expect(state.actions).toBeDefined();
    });

    it('should create store with initial template', () => {
      const template: PageTemplate = {
        id: 'home-page',
        name: 'Home Page',
        pageType: 'home',
        sections: [],
        data: { test: 'data' },
        metadata: { version: '1.0' },
      };

      const store = createPageBuilderStore(template);
      const state = store.getState();

      expect(state.pageId).toBe('home-page');
      expect(state.pageName).toBe('Home Page');
      expect(state.data).toEqual({ test: 'data' });
      expect(state.metadata).toEqual({ version: '1.0' });
    });
  });

  describe('Page Data Actions', () => {
    it('should set page data', () => {
      const store = createPageBuilderStore();
      const newData = { user: { name: 'John' } };

      store.getState().actions.setPageData(newData);

      expect(store.getState().data).toEqual(newData);
    });

    it('should update metadata', () => {
      const store = createPageBuilderStore();

      store.getState().actions.updateMetadata({ version: '1.0' });
      expect(store.getState().metadata).toEqual({ version: '1.0' });

      store.getState().actions.updateMetadata({ author: 'John' });
      expect(store.getState().metadata).toEqual({ version: '1.0', author: 'John' });
    });
  });

  describe('Section Actions', () => {
    let store: ReturnType<typeof createPageBuilderStore>;

    beforeEach(() => {
      store = createPageBuilderStore();
    });

    it('should add a section', () => {
      const section: SectionInstance = {
        id: 'section-1',
        type: 'hero',
        settings: { title: 'Welcome' },
      };

      store.getState().actions.addSection(section);

      const state = store.getState();
      expect(state.sections['section-1']).toBeDefined();
      expect(state.sections['section-1'].id).toBe('section-1');
      expect(state.sections['section-1'].type).toBe('hero');
      expect(state.sectionOrder).toEqual(['section-1']);
    });

    it('should add section with schema', () => {
      const section: SectionInstance = {
        id: 'section-1',
        type: 'hero',
        settings: {},
      };

      const schema: SectionSchema = {
        slug: 'hero',
        name: 'Hero',
        settings: [],
      };

      store.getState().actions.addSection(section, schema);

      expect(store.getState().sections['section-1'].schema).toEqual(schema);
    });

    it('should update a section', () => {
      const section: SectionInstance = {
        id: 'section-1',
        type: 'hero',
        settings: { title: 'Welcome' },
      };

      store.getState().actions.addSection(section);
      store.getState().actions.updateSection('section-1', {
        settings: { title: 'Updated Title' },
      });

      expect(store.getState().sections['section-1'].settings).toEqual({
        title: 'Updated Title',
      });
    });

    it('should remove a section', () => {
      const section: SectionInstance = {
        id: 'section-1',
        type: 'hero',
        settings: {},
      };

      store.getState().actions.addSection(section);
      store.getState().actions.removeSection('section-1');

      expect(store.getState().sections['section-1']).toBeUndefined();
      expect(store.getState().sectionOrder).toEqual([]);
    });

    it('should reorder sections', () => {
      const section1: SectionInstance = {
        id: 'section-1',
        type: 'hero',
        settings: {},
      };
      const section2: SectionInstance = {
        id: 'section-2',
        type: 'features',
        settings: {},
      };

      store.getState().actions.addSection(section1);
      store.getState().actions.addSection(section2);

      expect(store.getState().sectionOrder).toEqual(['section-1', 'section-2']);

      store.getState().actions.reorderSections(['section-2', 'section-1']);

      expect(store.getState().sectionOrder).toEqual(['section-2', 'section-1']);
    });
  });

  describe('Block Actions', () => {
    let store: ReturnType<typeof createPageBuilderStore>;

    beforeEach(() => {
      store = createPageBuilderStore();

      // Add a parent section first
      const section: SectionInstance = {
        id: 'section-1',
        type: 'hero',
        settings: {},
      };
      store.getState().actions.addSection(section);
    });

    it('should add a block to a section', () => {
      const block: BlockInstance = {
        id: 'block-1',
        type: 'button',
        settings: { label: 'Click me' },
      };

      store.getState().actions.addBlock('section-1', block);

      const state = store.getState();
      expect(state.blocks['block-1']).toBeDefined();
      expect(state.blocks['block-1'].type).toBe('button');
      expect(state.sections['section-1'].blocks).toContainEqual(block);
    });

    it('should not add block to non-existent section', () => {
      const block: BlockInstance = {
        id: 'block-1',
        type: 'button',
        settings: {},
      };

      store.getState().actions.addBlock('non-existent', block);

      expect(store.getState().blocks['block-1']).toBeUndefined();
    });

    it('should add block with schema', () => {
      const block: BlockInstance = {
        id: 'block-1',
        type: 'button',
        settings: {},
      };

      const schema: BlockSchema = {
        slug: 'button',
        name: 'Button',
        settings: [],
      };

      store.getState().actions.addBlock('section-1', block, schema);

      expect(store.getState().blocks['block-1'].schema).toEqual(schema);
    });

    it('should update a block', () => {
      const block: BlockInstance = {
        id: 'block-1',
        type: 'button',
        settings: { label: 'Click me' },
      };

      store.getState().actions.addBlock('section-1', block);
      store.getState().actions.updateBlock('block-1', {
        settings: { label: 'Updated Label' },
      });

      expect(store.getState().blocks['block-1'].settings).toEqual({
        label: 'Updated Label',
      });
    });

    it('should remove a block from a section', () => {
      const block: BlockInstance = {
        id: 'block-1',
        type: 'button',
        settings: {},
      };

      store.getState().actions.addBlock('section-1', block);
      store.getState().actions.removeBlock('block-1', 'section-1');

      expect(store.getState().blocks['block-1']).toBeUndefined();
      expect(store.getState().sections['section-1'].blocks).toEqual([]);
    });

    it('should handle removing block from non-existent section', () => {
      const block: BlockInstance = {
        id: 'block-1',
        type: 'button',
        settings: {},
      };

      store.getState().actions.addBlock('section-1', block);
      store.getState().actions.removeBlock('block-1', 'non-existent');

      // Block should still exist since section doesn't exist
      expect(store.getState().blocks['block-1']).toBeDefined();
    });
  });

  describe('Reset Action', () => {
    it('should reset store to initial state', () => {
      const store = createPageBuilderStore();

      // Add some data
      store.getState().actions.setPageData({ test: 'data' });
      store.getState().actions.updateMetadata({ version: '1.0' });
      store.getState().actions.addSection({
        id: 'section-1',
        type: 'hero',
        settings: {},
      });

      // Reset
      store.getState().actions.reset();

      const state = store.getState();
      expect(state.data).toBeUndefined();
      expect(state.metadata).toEqual({});
      expect(state.sections).toEqual({});
      expect(state.sectionOrder).toEqual([]);
      expect(state.blocks).toEqual({});
    });
  });

  describe('Initialize from Template', () => {
    it('should initialize store from template', () => {
      const store = createPageBuilderStore();

      const template: PageTemplate = {
        id: 'home-page',
        name: 'Home Page',
        pageType: 'home',
        data: { test: 'data' },
        metadata: { version: '1.0' },
        sections: [
          {
            id: 'section-1',
            type: 'hero',
            settings: { title: 'Welcome' },
            blocks: [
              {
                id: 'block-1',
                type: 'button',
                settings: { label: 'Click' },
              },
            ],
          },
          {
            id: 'section-2',
            type: 'features',
            settings: {},
          },
        ],
      };

      store.getState().actions.initializeFromTemplate(template);

      const state = store.getState();
      expect(state.pageId).toBe('home-page');
      expect(state.pageName).toBe('Home Page');
      expect(state.data).toEqual({ test: 'data' });
      expect(state.metadata).toEqual({ version: '1.0' });
      expect(state.sectionOrder).toEqual(['section-1', 'section-2']);
      expect(state.sections['section-1']).toBeDefined();
      expect(state.sections['section-2']).toBeDefined();
      expect(state.blocks['block-1']).toBeDefined();
    });

    it('should load schemas when initializing from template', () => {
      const store = createPageBuilderStore();

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
              {
                id: 'block-1',
                type: 'button',
                settings: {},
              },
            ],
          },
        ],
      };

      store.getState().actions.initializeFromTemplate(template);

      const state = store.getState();
      expect(state.sections['section-1'].schema).toBeDefined();
      expect(state.sections['section-1'].schema?.slug).toBe('hero');
      expect(state.blocks['block-1'].schema).toBeDefined();
      expect(state.blocks['block-1'].schema?.slug).toBe('button');
    });

    it('should handle template without metadata', () => {
      const store = createPageBuilderStore();

      const template: PageTemplate = {
        id: 'home-page',
        name: 'Home Page',
        pageType: 'home',
        sections: [],
      };

      store.getState().actions.initializeFromTemplate(template);

      expect(store.getState().metadata).toEqual({});
    });
  });

  describe('Store Subscription', () => {
    it('should notify subscribers on state change', () => {
      const store = createPageBuilderStore();
      const listener = vi.fn();

      store.subscribe(listener);
      store.getState().actions.setPageData({ test: 'data' });

      expect(listener).toHaveBeenCalled();
    });

    it('should allow unsubscribe', () => {
      const store = createPageBuilderStore();
      const listener = vi.fn();

      const unsubscribe = store.subscribe(listener);
      unsubscribe();

      store.getState().actions.setPageData({ test: 'data' });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Layout Actions', () => {
    let store: ReturnType<typeof createPageBuilderStore>;

    beforeEach(() => {
      store = createPageBuilderStore();
    });

    it('should set layout', () => {
      const layout: LayoutInstance = {
        id: 'layout-1',
        type: 'default',
        settings: { backgroundColor: '#ffffff' },
      };

      store.getState().actions.setLayout(layout);

      const state = store.getState();
      expect(state.layout).toBeDefined();
      expect(state.layout?.id).toBe('layout-1');
      expect(state.layout?.type).toBe('default');
    });

    it('should set layout with schema', () => {
      const layout: LayoutInstance = {
        id: 'layout-1',
        type: 'default',
        settings: {},
      };

      const schema: LayoutSchema = {
        slug: 'default',
        name: 'Default Layout',
        settings: [],
      };

      store.getState().actions.setLayout(layout, schema);

      expect(store.getState().layout?.schema).toEqual(schema);
    });

    it('should update layout', () => {
      const layout: LayoutInstance = {
        id: 'layout-1',
        type: 'default',
        settings: { backgroundColor: '#ffffff' },
      };

      store.getState().actions.setLayout(layout);
      store.getState().actions.updateLayout({
        settings: { backgroundColor: '#000000' },
      });

      expect(store.getState().layout?.settings).toEqual({
        backgroundColor: '#000000',
      });
    });

    it('should not update if layout is not set', () => {
      store.getState().actions.updateLayout({
        settings: { backgroundColor: '#000000' },
      });

      expect(store.getState().layout).toBeUndefined();
    });

    it('should add layout section', () => {
      const section: SectionInstance = {
        id: 'header-1',
        type: 'hero',
        settings: {},
      };

      store.getState().actions.addLayoutSection(section);

      const state = store.getState();
      expect(state.layoutSections['header-1']).toBeDefined();
      expect(state.layoutSectionOrder).toContain('header-1');
    });

    it('should update layout section', () => {
      const section: SectionInstance = {
        id: 'header-1',
        type: 'hero',
        settings: { title: 'Header' },
      };

      store.getState().actions.addLayoutSection(section);
      store.getState().actions.updateLayoutSection('header-1', {
        settings: { title: 'Updated Header' },
      });

      expect(store.getState().layoutSections['header-1'].settings).toEqual({
        title: 'Updated Header',
      });
    });

    it('should remove layout section', () => {
      const section: SectionInstance = {
        id: 'header-1',
        type: 'hero',
        settings: {},
      };

      store.getState().actions.addLayoutSection(section);
      store.getState().actions.removeLayoutSection('header-1');

      expect(store.getState().layoutSections['header-1']).toBeUndefined();
      expect(store.getState().layoutSectionOrder).not.toContain('header-1');
    });

    it('should reorder layout sections', () => {
      const section1: SectionInstance = {
        id: 'header-1',
        type: 'hero',
        settings: {},
      };
      const section2: SectionInstance = {
        id: 'footer-1',
        type: 'footer',
        settings: {},
      };

      store.getState().actions.addLayoutSection(section1);
      store.getState().actions.addLayoutSection(section2);

      expect(store.getState().layoutSectionOrder).toEqual(['header-1', 'footer-1']);

      store.getState().actions.reorderLayoutSections(['footer-1', 'header-1']);

      expect(store.getState().layoutSectionOrder).toEqual(['footer-1', 'header-1']);
    });

    it('should initialize layout from template', () => {
      const template: PageTemplate = {
        id: 'home-page',
        name: 'Home Page',
        pageType: 'home',
        layout: {
          id: 'layout-1',
          type: 'default',
          settings: { backgroundColor: '#ffffff' },
          sections: [
            {
              id: 'header-1',
              type: 'hero',
              settings: {},
            },
            {
              id: 'footer-1',
              type: 'footer',
              settings: {},
            },
          ],
        },
        sections: [],
      };

      store.getState().actions.initializeFromTemplate(template);

      const state = store.getState();
      expect(state.layout).toBeDefined();
      expect(state.layout?.id).toBe('layout-1');
      expect(state.layoutSectionOrder).toEqual(['header-1', 'footer-1']);
      expect(state.layoutSections['header-1']).toBeDefined();
      expect(state.layoutSections['footer-1']).toBeDefined();
    });

    it('should reset layout when resetting store', () => {
      const layout: LayoutInstance = {
        id: 'layout-1',
        type: 'default',
        settings: {},
      };

      store.getState().actions.setLayout(layout);
      store.getState().actions.addLayoutSection({
        id: 'header-1',
        type: 'hero',
        settings: {},
      });

      store.getState().actions.reset();

      const state = store.getState();
      expect(state.layout).toBeUndefined();
      expect(state.layoutSections).toEqual({});
      expect(state.layoutSectionOrder).toEqual([]);
    });
  });
});
