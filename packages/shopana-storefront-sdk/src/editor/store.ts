import { createStore } from 'zustand/vanilla';
import type {
  BlockSettingsSchema,
  SectionSettingsSchema,
} from '../core/settings';
import type { PageType } from '../core/types';

export type ThemeEditorScope = PageType | 'theme';

export interface RegisteredEditorBlock {
  id: string;
  name: string;
  initialSettings: Record<string, unknown>;
  settings: Record<string, unknown>;
  schema?: BlockSettingsSchema<any>;
}

export interface RegisteredEditorSection {
  id: string;
  name: string;
  initialSettings: Record<string, unknown>;
  settings: Record<string, unknown>;
  schema?: SectionSettingsSchema<any>;
  blockOrder: string[];
  blocks: Record<string, RegisteredEditorBlock>;
}

interface RegisteredEditorScope {
  sectionOrder: string[];
  sections: Record<string, RegisteredEditorSection>;
}

export interface RegisterEditorSectionInput {
  scope: ThemeEditorScope;
  id: string;
  settings: Record<string, unknown>;
  schema?: SectionSettingsSchema<any>;
  blocks?: Array<{
    id: string;
    settings: Record<string, unknown>;
    schema?: BlockSettingsSchema<any>;
  }>;
}

export interface ThemeEditorState {
  open: boolean;
  initialGeneralSettings: Record<string, unknown>;
  generalSettings: Record<string, unknown>;
  currentPageType?: PageType;
  scopes: Partial<Record<ThemeEditorScope, RegisteredEditorScope>>;
  setOpen: (open: boolean) => void;
  registerSection: (input: RegisterEditorSectionInput) => void;
  updateGeneralSetting: (path: string[], value: unknown) => void;
  resetGeneralSettings: () => void;
  updateSectionSetting: (
    scope: ThemeEditorScope,
    sectionId: string,
    settingId: string,
    value: unknown
  ) => void;
  resetSection: (scope: ThemeEditorScope, sectionId: string) => void;
  updateBlockSetting: (
    scope: ThemeEditorScope,
    sectionId: string,
    blockId: string,
    settingId: string,
    value: unknown
  ) => void;
  resetBlock: (
    scope: ThemeEditorScope,
    sectionId: string,
    blockId: string
  ) => void;
}

function clone<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

function setAtPath(
  source: Record<string, unknown>,
  path: string[],
  value: unknown
): Record<string, unknown> {
  const result = { ...source };
  let cursor: Record<string, unknown> = result;

  path.forEach((part, index) => {
    if (index === path.length - 1) {
      cursor[part] = value;
      return;
    }

    const next = cursor[part];
    const nextObject =
      next && typeof next === 'object' && !Array.isArray(next)
        ? { ...(next as Record<string, unknown>) }
        : {};
    cursor[part] = nextObject;
    cursor = nextObject;
  });

  return result;
}

export function createThemeEditorStore(
  initialGeneralSettings: Record<string, unknown>
) {
  const initial = clone(initialGeneralSettings);

  return createStore<ThemeEditorState>()((set) => ({
    open: false,
    initialGeneralSettings: initial,
    generalSettings: clone(initial),
    scopes: {},
    setOpen: (open) => set({ open }),
    registerSection: (input) =>
      set((state) => {
        const existingScope = state.scopes[input.scope];
        const existingSection = existingScope?.sections[input.id];
        const blocks = { ...(existingSection?.blocks ?? {}) };
        const blockOrder = input.blocks?.map((block) => block.id) ?? [];

        input.blocks?.forEach((block) => {
          const existingBlock = blocks[block.id];
          blocks[block.id] = {
            id: block.id,
            name: block.schema?.name ?? block.id,
            schema: block.schema,
            initialSettings: clone(block.settings),
            settings: existingBlock?.settings ?? clone(block.settings),
          };
        });

        const section: RegisteredEditorSection = {
          id: input.id,
          name: input.schema?.name ?? input.id,
          schema: input.schema,
          initialSettings: clone(input.settings),
          settings: existingSection?.settings ?? clone(input.settings),
          blockOrder,
          blocks,
        };
        const sectionOrder = existingScope?.sectionOrder.includes(input.id)
          ? existingScope.sectionOrder
          : [...(existingScope?.sectionOrder ?? []), input.id];

        return {
          currentPageType:
            input.scope === 'theme' ? state.currentPageType : input.scope,
          scopes: {
            ...state.scopes,
            [input.scope]: {
              sectionOrder,
              sections: {
                ...(existingScope?.sections ?? {}),
                [input.id]: section,
              },
            },
          },
        };
      }),
    updateGeneralSetting: (path, value) =>
      set((state) => ({
        generalSettings: setAtPath(state.generalSettings, path, value),
      })),
    resetGeneralSettings: () =>
      set((state) => ({
        generalSettings: clone(state.initialGeneralSettings),
      })),
    updateSectionSetting: (scope, sectionId, settingId, value) =>
      set((state) => {
        const registeredScope = state.scopes[scope];
        const section = registeredScope?.sections[sectionId];
        if (!registeredScope || !section) return state;

        return {
          scopes: {
            ...state.scopes,
            [scope]: {
              ...registeredScope,
              sections: {
                ...registeredScope.sections,
                [sectionId]: {
                  ...section,
                  settings: { ...section.settings, [settingId]: value },
                },
              },
            },
          },
        };
      }),
    resetSection: (scope, sectionId) =>
      set((state) => {
        const registeredScope = state.scopes[scope];
        const section = registeredScope?.sections[sectionId];
        if (!registeredScope || !section) return state;

        return {
          scopes: {
            ...state.scopes,
            [scope]: {
              ...registeredScope,
              sections: {
                ...registeredScope.sections,
                [sectionId]: {
                  ...section,
                  settings: clone(section.initialSettings),
                },
              },
            },
          },
        };
      }),
    updateBlockSetting: (scope, sectionId, blockId, settingId, value) =>
      set((state) => {
        const registeredScope = state.scopes[scope];
        const section = registeredScope?.sections[sectionId];
        const block = section?.blocks[blockId];
        if (!registeredScope || !section || !block) return state;

        return {
          scopes: {
            ...state.scopes,
            [scope]: {
              ...registeredScope,
              sections: {
                ...registeredScope.sections,
                [sectionId]: {
                  ...section,
                  blocks: {
                    ...section.blocks,
                    [blockId]: {
                      ...block,
                      settings: { ...block.settings, [settingId]: value },
                    },
                  },
                },
              },
            },
          },
        };
      }),
    resetBlock: (scope, sectionId, blockId) =>
      set((state) => {
        const registeredScope = state.scopes[scope];
        const section = registeredScope?.sections[sectionId];
        const block = section?.blocks[blockId];
        if (!registeredScope || !section || !block) return state;

        return {
          scopes: {
            ...state.scopes,
            [scope]: {
              ...registeredScope,
              sections: {
                ...registeredScope.sections,
                [sectionId]: {
                  ...section,
                  blocks: {
                    ...section.blocks,
                    [blockId]: {
                      ...block,
                      settings: clone(block.initialSettings),
                    },
                  },
                },
              },
            },
          },
        };
      }),
  }));
}

export type ThemeEditorStore = ReturnType<typeof createThemeEditorStore>;
