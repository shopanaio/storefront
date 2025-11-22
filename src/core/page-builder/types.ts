import type { ComponentType } from 'react';
import type { StoreApi } from 'zustand/vanilla';

export type SettingType =
  | 'text'
  | 'textarea'
  | 'image'
  | 'select'
  | 'number'
  | 'checkbox'
  | 'color'
  | 'range';

export interface SettingOption {
  label: string;
  value: string | number;
}

export interface Setting {
  type: SettingType;
  id: string;
  label: string;
  default?: any;
  options?: SettingOption[];
  min?: number;
  max?: number;
  step?: number;
  helpText?: string;
}

export type PageTemplateType =
  | 'product'
  | 'collection'
  | 'cart'
  | 'page'
  | 'home'
  | 'blog'
  | 'article'
  | 'search'
  | 'account';

export interface SectionSchema {
  slug: string;
  name: string;
  description?: string;
  templates?: PageTemplateType[];
  settings: Setting[];
  blocks?: {
    types: string[];
    max?: number;
  };
}

export interface BlockSchema {
  slug: string;
  name: string;
  description?: string;
  settings: Setting[];
}

export interface SectionInstance<TSettings = Record<string, any>> {
  id: string;
  type: string;
  settings: TSettings;
  blocks?: BlockInstance[];
}

export interface BlockInstance<TSettings = Record<string, any>> {
  id: string;
  type: string;
  settings: TSettings;
}

export interface SectionProps<TSettings = Record<string, any>> {
  id: string;
  settings: TSettings;
  blocks?: BlockInstance[];
}

export interface BlockProps<TSettings = Record<string, any>> {
  id: string;
  settings: TSettings;
}

export interface PageTemplate<TData = any> {
  id: string;
  name: string;
  pageType: PageTemplateType;
  sections: SectionInstance[];
  data?: TData;
  metadata?: Record<string, any>;
}

export type TemplateGenerator<TData = any, TContext = any> = (
  context?: TContext
) => PageTemplate<TData>;

export interface SectionState<TSettings = Record<string, any>>
  extends SectionInstance<TSettings> {
  schema?: SectionSchema;
}

export interface BlockState<TSettings = Record<string, any>>
  extends BlockInstance<TSettings> {
  schema?: BlockSchema;
}

export interface PageBuilderState<TData = any> {
  pageId: string;
  pageName: string;
  data?: TData;
  metadata?: Record<string, any>;
  sections: Record<string, SectionState>;
  sectionOrder: string[];
  blocks: Record<string, BlockState>;
  actions: PageBuilderActions<TData>;
}

export interface PageBuilderActions<TData = any> {
  setPageData: (data: TData) => void;
  updateMetadata: (metadata: Record<string, any>) => void;
  addSection: (section: SectionInstance, schema?: SectionSchema) => void;
  updateSection: (sectionId: string, updates: Partial<SectionInstance>) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (newOrder: string[]) => void;
  addBlock: (sectionId: string, block: BlockInstance, schema?: BlockSchema) => void;
  updateBlock: (blockId: string, updates: Partial<BlockInstance>) => void;
  removeBlock: (blockId: string, sectionId: string) => void;
  reset: () => void;
  initializeFromTemplate: (template: PageTemplate<TData>) => void;
}

export type PageSelector<TData = any, R = any> = (state: PageBuilderState<TData>) => R;
export type SectionSelector<TSettings = Record<string, any>, R = any> = (
  section: SectionState<TSettings>
) => R;
export type BlockSelector<TSettings = Record<string, any>, R = any> = (
  block: BlockState<TSettings>
) => R;

export interface ValidationError {
  sectionId: string;
  sectionType: string;
  message: string;
  severity: 'error' | 'warning';
}

export type PageBuilderStore<TData = any> = StoreApi<PageBuilderState<TData>>;

export interface PageBuilderComponentModule<TProps> {
  default: ComponentType<TProps>;
}
