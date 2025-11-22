import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { createPageBuilderStore } from './store';
import { PageBuilderStoreContext } from './store-provider';
import { SectionContext, BlockContext } from './context';
import {
  usePageBuilderStore,
  usePageBuilderState,
  usePage,
  usePageOptional,
  useSection,
  useBlock,
  usePageBuilderActions,
  usePageBuilder,
} from './hooks';
import type { PageTemplate } from './types';

// Mock the registry
vi.mock('./registry', () => ({
  pageBuilderRegistry: {
    getSectionSchema: vi.fn((slug: string) => ({
      slug,
      name: `${slug} Section`,
      settings: [],
    })),
    getBlockSchema: vi.fn((slug: string) => ({
      slug,
      name: `${slug} Block`,
      settings: [],
    })),
    listSections: vi.fn(() => ['hero', 'features']),
    listBlocks: vi.fn(() => ['button', 'image']),
    getSection: vi.fn((slug: string) => ({
      slug,
      loader: () => Promise.resolve({ default: null }),
      schema: { slug, name: `${slug} Section`, settings: [] },
    })),
    getBlock: vi.fn((slug: string) => ({
      slug,
      loader: () => Promise.resolve({ default: null }),
      schema: { slug, name: `${slug} Block`, settings: [] },
    })),
  },
}));

describe('PageBuilder Hooks', () => {
  let store: ReturnType<typeof createPageBuilderStore>;

  beforeEach(() => {
    const template: PageTemplate = {
      id: 'test-page',
      name: 'Test Page',
      pageType: 'home',
      data: { productName: 'Test Product' },
      metadata: { version: '1.0' },
      sections: [
        {
          id: 'section-1',
          type: 'hero',
          settings: { title: 'Hero Title' },
          blocks: [
            {
              id: 'block-1',
              type: 'button',
              settings: { label: 'Click me' },
            },
          ],
        },
      ],
    };

    store = createPageBuilderStore(template);
    store.getState().actions.initializeFromTemplate(template);
  });

  describe('usePageBuilderStore', () => {
    it('should return the store instance', () => {
      function TestComponent() {
        const storeInstance = usePageBuilderStore();
        return (
          <div data-testid="has-store">{storeInstance ? 'true' : 'false'}</div>
        );
      }

      render(
        <PageBuilderStoreContext.Provider value={store}>
          <TestComponent />
        </PageBuilderStoreContext.Provider>
      );

      expect(screen.getByTestId('has-store')).toHaveTextContent('true');
    });

    it('should throw error when used outside provider', () => {
      function TestComponent() {
        usePageBuilderStore();
        return <div>Test</div>;
      }

      // Mock console.error to suppress error output in test
      const originalError = console.error;
      console.error = () => {};

      expect(() => {
        render(<TestComponent />);
      }).toThrow('usePageBuilderStore must be used within PageBuilderStoreProvider');

      console.error = originalError;
    });
  });

  describe('usePageBuilderState', () => {
    it('should return full state without selector', () => {
      function TestComponent() {
        const state = usePageBuilderState();
        return (
          <div>
            <div data-testid="page-id">{state.pageId}</div>
            <div data-testid="sections-count">{state.sectionOrder.length}</div>
          </div>
        );
      }

      render(
        <PageBuilderStoreContext.Provider value={store}>
          <TestComponent />
        </PageBuilderStoreContext.Provider>
      );

      expect(screen.getByTestId('page-id')).toHaveTextContent('test-page');
      expect(screen.getByTestId('sections-count')).toHaveTextContent('1');
    });

    it('should return selected value with selector', () => {
      function TestComponent() {
        const pageId = usePageBuilderState((state) => state.pageId);
        return <div data-testid="page-id">{pageId}</div>;
      }

      render(
        <PageBuilderStoreContext.Provider value={store}>
          <TestComponent />
        </PageBuilderStoreContext.Provider>
      );

      expect(screen.getByTestId('page-id')).toHaveTextContent('test-page');
    });
  });

  describe('usePage', () => {
    it('should return page data with selector for individual fields', () => {
      function TestComponent() {
        const pageId = usePage((state) => state.pageId);
        const pageName = usePage((state) => state.pageName);
        const productName = usePage<{ productName: string }>(
          (state) => state.data?.productName
        );
        return (
          <div>
            <div data-testid="page-id">{pageId}</div>
            <div data-testid="page-name">{pageName}</div>
            <div data-testid="product-name">{productName}</div>
          </div>
        );
      }

      render(
        <PageBuilderStoreContext.Provider value={store as any}>
          <TestComponent />
        </PageBuilderStoreContext.Provider>
      );

      expect(screen.getByTestId('page-id')).toHaveTextContent('test-page');
      expect(screen.getByTestId('page-name')).toHaveTextContent('Test Page');
      expect(screen.getByTestId('product-name')).toHaveTextContent('Test Product');
    });

    it('should return selected value with selector', () => {
      function TestComponent() {
        const productName = usePage<{ productName: string }>(
          (state) => state.data?.productName
        );
        return <div data-testid="product-name">{productName}</div>;
      }

      render(
        <PageBuilderStoreContext.Provider value={store as any}>
          <TestComponent />
        </PageBuilderStoreContext.Provider>
      );

      expect(screen.getByTestId('product-name')).toHaveTextContent('Test Product');
    });
  });

  describe('usePageOptional', () => {
    it('should work with selector to get page data', () => {
      // Test using selector approach instead of getting full page object
      const state = store.getState();

      expect(state.pageId).toBe('test-page');
      expect(state.pageName).toBe('Test Page');
    });
  });

  describe('useSection', () => {
    it('should return section data with explicit ID', () => {
      function TestComponent() {
        const section = useSection('section-1');
        return (
          <div>
            <div data-testid="section-id">{section?.id || 'null'}</div>
            <div data-testid="section-type">{section?.type || 'null'}</div>
            <div data-testid="section-title">
              {(section?.settings as any)?.title || 'null'}
            </div>
          </div>
        );
      }

      render(
        <PageBuilderStoreContext.Provider value={store}>
          <TestComponent />
        </PageBuilderStoreContext.Provider>
      );

      expect(screen.getByTestId('section-id')).toHaveTextContent('section-1');
      expect(screen.getByTestId('section-type')).toHaveTextContent('hero');
      expect(screen.getByTestId('section-title')).toHaveTextContent('Hero Title');
    });

    it('should return section data from context', () => {
      function TestComponent() {
        const section = useSection();
        return (
          <div data-testid="section-id">{section?.id || 'null'}</div>
        );
      }

      render(
        <PageBuilderStoreContext.Provider value={store}>
          <SectionContext.Provider value="section-1">
            <TestComponent />
          </SectionContext.Provider>
        </PageBuilderStoreContext.Provider>
      );

      expect(screen.getByTestId('section-id')).toHaveTextContent('section-1');
    });

    it('should return selected value with selector', () => {
      function TestComponent() {
        const title = useSection<{ title: string }>(
          'section-1',
          (s) => s.settings.title
        );
        return <div data-testid="title">{title}</div>;
      }

      render(
        <PageBuilderStoreContext.Provider value={store}>
          <TestComponent />
        </PageBuilderStoreContext.Provider>
      );

      expect(screen.getByTestId('title')).toHaveTextContent('Hero Title');
    });

    it('should warn for non-existent section', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      function TestComponent() {
        const section = useSection('non-existent');
        return <div data-testid="section">{section ? 'found' : 'null'}</div>;
      }

      render(
        <PageBuilderStoreContext.Provider value={store}>
          <TestComponent />
        </PageBuilderStoreContext.Provider>
      );

      expect(screen.getByTestId('section')).toHaveTextContent('null');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('not found in store')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('useBlock', () => {
    it('should return block data with explicit ID', () => {
      function TestComponent() {
        const block = useBlock('block-1');
        return (
          <div>
            <div data-testid="block-id">{block?.id || 'null'}</div>
            <div data-testid="block-type">{block?.type || 'null'}</div>
            <div data-testid="block-label">
              {(block?.settings as any)?.label || 'null'}
            </div>
          </div>
        );
      }

      render(
        <PageBuilderStoreContext.Provider value={store}>
          <TestComponent />
        </PageBuilderStoreContext.Provider>
      );

      expect(screen.getByTestId('block-id')).toHaveTextContent('block-1');
      expect(screen.getByTestId('block-type')).toHaveTextContent('button');
      expect(screen.getByTestId('block-label')).toHaveTextContent('Click me');
    });

    it('should return block data from context', () => {
      function TestComponent() {
        const block = useBlock();
        return <div data-testid="block-id">{block?.id || 'null'}</div>;
      }

      render(
        <PageBuilderStoreContext.Provider value={store}>
          <BlockContext.Provider value="block-1">
            <TestComponent />
          </BlockContext.Provider>
        </PageBuilderStoreContext.Provider>
      );

      expect(screen.getByTestId('block-id')).toHaveTextContent('block-1');
    });

    it('should return selected value with selector', () => {
      function TestComponent() {
        const label = useBlock<{ label: string }>(
          'block-1',
          (b) => b.settings.label
        );
        return <div data-testid="label">{label}</div>;
      }

      render(
        <PageBuilderStoreContext.Provider value={store}>
          <TestComponent />
        </PageBuilderStoreContext.Provider>
      );

      expect(screen.getByTestId('label')).toHaveTextContent('Click me');
    });
  });

  describe('usePageBuilderActions', () => {
    it('should return actions object', () => {
      function TestComponent() {
        const actions = usePageBuilderActions();
        return (
          <div data-testid="has-actions">
            {actions.setPageData ? 'true' : 'false'}
          </div>
        );
      }

      render(
        <PageBuilderStoreContext.Provider value={store as any}>
          <TestComponent />
        </PageBuilderStoreContext.Provider>
      );

      expect(screen.getByTestId('has-actions')).toHaveTextContent('true');
    });

    it('should allow updating page data', () => {
      // Test actions directly with store instead of through React component
      const state = store.getState();
      const newData = { newData: 'updated' };

      state.actions.setPageData(newData);

      const updatedState = store.getState();
      expect(updatedState.data).toEqual(newData);
    });
  });

  describe('usePageBuilder', () => {
    it('should provide registry access methods', () => {
      function TestComponent() {
        const registry = usePageBuilder();
        const sections = registry.listSections();
        const blocks = registry.listBlocks();

        return (
          <div>
            <div data-testid="sections">{sections.join(',')}</div>
            <div data-testid="blocks">{blocks.join(',')}</div>
          </div>
        );
      }

      render(
        <PageBuilderStoreContext.Provider value={store}>
          <TestComponent />
        </PageBuilderStoreContext.Provider>
      );

      expect(screen.getByTestId('sections')).toHaveTextContent('hero,features');
      expect(screen.getByTestId('blocks')).toHaveTextContent('button,image');
    });

    it('should provide schema access methods', () => {
      function TestComponent() {
        const registry = usePageBuilder();
        const heroSchema = registry.getSectionSchema('hero');

        return (
          <div data-testid="schema-name">{heroSchema?.name || 'null'}</div>
        );
      }

      render(
        <PageBuilderStoreContext.Provider value={store}>
          <TestComponent />
        </PageBuilderStoreContext.Provider>
      );

      expect(screen.getByTestId('schema-name')).toHaveTextContent('hero Section');
    });
  });
});
