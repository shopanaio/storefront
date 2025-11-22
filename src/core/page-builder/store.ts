'use client';

import { createStore } from 'zustand/vanilla';
import { pageBuilderRegistry } from './registry';
import type {
  BlockInstance,
  BlockSchema,
  LayoutInstance,
  LayoutSchema,
  PageBuilderState,
  PageTemplate,
  SectionInstance,
  SectionSchema,
} from './types';

export function createPageBuilderStore<TData = any>(
  initialTemplate?: PageTemplate<TData>
) {
  return createStore<PageBuilderState<TData>>((set, _get) => ({
    pageId: initialTemplate?.id ?? '',
    pageName: initialTemplate?.name ?? '',
    data: initialTemplate?.data,
    metadata: initialTemplate?.metadata ?? {},
    layout: undefined,
    layoutSections: {},
    layoutSectionOrder: [],
    sections: {},
    sectionOrder: [],
    blocks: {},
    actions: {
      setPageData: (data: TData) => {
        set({ data });
      },
      updateMetadata: (metadata: Record<string, any>) => {
        set((state) => ({
          metadata: { ...state.metadata, ...metadata },
        }));
      },
      setLayout: (layout: LayoutInstance, schema?: LayoutSchema) => {
        set({ layout: { ...layout, schema } });
      },
      updateLayout: (updates: Partial<LayoutInstance>) => {
        set((state) => ({
          layout: state.layout ? { ...state.layout, ...updates } : undefined,
        }));
      },
      addLayoutSection: (section: SectionInstance, schema?: SectionSchema) => {
        set((state) => ({
          layoutSections: {
            ...state.layoutSections,
            [section.id]: { ...section, schema },
          },
          layoutSectionOrder: [...state.layoutSectionOrder, section.id],
        }));
      },
      updateLayoutSection: (sectionId: string, updates: Partial<SectionInstance>) => {
        set((state) => ({
          layoutSections: {
            ...state.layoutSections,
            [sectionId]: {
              ...state.layoutSections[sectionId],
              ...updates,
            },
          },
        }));
      },
      removeLayoutSection: (sectionId: string) => {
        set((state) => {
          const { [sectionId]: removed, ...rest } = state.layoutSections;
          return {
            layoutSections: rest,
            layoutSectionOrder: state.layoutSectionOrder.filter((id) => id !== sectionId),
          };
        });
      },
      reorderLayoutSections: (newOrder: string[]) => {
        set({ layoutSectionOrder: newOrder });
      },
      addSection: (section: SectionInstance, schema?: SectionSchema) => {
        set((state) => ({
          sections: {
            ...state.sections,
            [section.id]: { ...section, schema },
          },
          sectionOrder: [...state.sectionOrder, section.id],
        }));
      },
      updateSection: (sectionId: string, updates: Partial<SectionInstance>) => {
        set((state) => ({
          sections: {
            ...state.sections,
            [sectionId]: {
              ...state.sections[sectionId],
              ...updates,
            },
          },
        }));
      },
      removeSection: (sectionId: string) => {
        set((state) => {
          const { [sectionId]: removed, ...rest } = state.sections;
          return {
            sections: rest,
            sectionOrder: state.sectionOrder.filter((id) => id !== sectionId),
          };
        });
      },
      reorderSections: (newOrder: string[]) => {
        set({ sectionOrder: newOrder });
      },
      addBlock: (sectionId: string, block: BlockInstance, schema?: BlockSchema) => {
        set((state) => {
          const section = state.sections[sectionId];
          if (!section) return state;

          return {
            blocks: {
              ...state.blocks,
              [block.id]: { ...block, schema },
            },
            sections: {
              ...state.sections,
              [sectionId]: {
                ...section,
                blocks: [...(section.blocks ?? []), block],
              },
            },
          };
        });
      },
      updateBlock: (blockId: string, updates: Partial<BlockInstance>) => {
        set((state) => ({
          blocks: {
            ...state.blocks,
            [blockId]: {
              ...state.blocks[blockId],
              ...updates,
            },
          },
        }));
      },
      removeBlock: (blockId: string, sectionId: string) => {
        set((state) => {
          const { [blockId]: removed, ...restBlocks } = state.blocks;
          const section = state.sections[sectionId];
          if (!section) return state;

          return {
            blocks: restBlocks,
            sections: {
              ...state.sections,
              [sectionId]: {
                ...section,
                blocks: section.blocks?.filter((b) => b.id !== blockId) ?? [],
              },
            },
          };
        });
      },
      reset: () => {
        set({
          layout: undefined,
          layoutSections: {},
          layoutSectionOrder: [],
          sections: {},
          sectionOrder: [],
          blocks: {},
          data: undefined,
          metadata: {},
        });
      },
      initializeFromTemplate: (template: PageTemplate<TData>) => {
        const sections: PageBuilderState<TData>['sections'] = {};
        const blocks: PageBuilderState<TData>['blocks'] = {};
        const sectionOrder: string[] = [];
        const layoutSections: PageBuilderState<TData>['layoutSections'] = {};
        const layoutSectionOrder: string[] = [];
        let layout: PageBuilderState<TData>['layout'] = undefined;

        // Initialize layout if present
        if (template.layout) {
          const layoutSchema = pageBuilderRegistry.getLayoutSchema(template.layout.type);
          layout = { ...template.layout, schema: layoutSchema };

          // Process layout sections
          template.layout.sections?.forEach((section) => {
            const schema = pageBuilderRegistry.getSectionSchema(section.type);
            layoutSections[section.id] = { ...section, schema };
            layoutSectionOrder.push(section.id);

            section.blocks?.forEach((block) => {
              const blockSchema = pageBuilderRegistry.getBlockSchema(block.type);
              blocks[block.id] = { ...block, schema: blockSchema };
            });
          });
        }

        // Process page sections
        template.sections.forEach((section) => {
          const schema = pageBuilderRegistry.getSectionSchema(section.type);
          sections[section.id] = { ...section, schema };
          sectionOrder.push(section.id);

          section.blocks?.forEach((block) => {
            const blockSchema = pageBuilderRegistry.getBlockSchema(block.type);
            blocks[block.id] = { ...block, schema: blockSchema };
          });
        });

        set({
          pageId: template.id,
          pageName: template.name,
          data: template.data,
          metadata: template.metadata ?? {},
          layout,
          layoutSections,
          layoutSectionOrder,
          sections,
          sectionOrder,
          blocks,
        });
      },
    },
  }));
}
