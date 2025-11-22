import type { ComponentType } from 'react';
import type {
  BlockProps,
  BlockSchema,
  SectionProps,
  SectionSchema,
  LayoutProps,
  LayoutSchema,
  PageBuilderComponentModule,
} from './types';

export type SectionSlug = string;
export type BlockSlug = string;
export type LayoutSlug = string;

export type AsyncLoader<T> = () => Promise<T> | T;

export interface SectionRegistryRecord {
  slug: SectionSlug;
  loader: AsyncLoader<PageBuilderComponentModule<SectionProps>>;
  schema: SectionSchema;
}

export interface BlockRegistryRecord {
  slug: BlockSlug;
  loader: AsyncLoader<PageBuilderComponentModule<BlockProps>>;
  schema: BlockSchema;
}

export interface LayoutRegistryRecord {
  slug: LayoutSlug;
  loader: AsyncLoader<PageBuilderComponentModule<LayoutProps>>;
  schema: LayoutSchema;
}

export class PageBuilderRegistry {
  private sections = new Map<SectionSlug, SectionRegistryRecord>();

  private blocks = new Map<BlockSlug, BlockRegistryRecord>();

  private layouts = new Map<LayoutSlug, LayoutRegistryRecord>();

  private sectionCache = new Map<SectionSlug, ComponentType<SectionProps>>();

  private blockCache = new Map<BlockSlug, ComponentType<BlockProps>>();

  private layoutCache = new Map<LayoutSlug, ComponentType<LayoutProps>>();

  registerSection(
    slug: SectionSlug,
    loader: SectionRegistryRecord['loader'],
    schema: SectionSchema
  ): void {
    this.sections.set(slug, { slug, loader, schema });
  }

  registerBlock(
    slug: BlockSlug,
    loader: BlockRegistryRecord['loader'],
    schema: BlockSchema
  ): void {
    this.blocks.set(slug, { slug, loader, schema });
  }

  registerLayout(
    slug: LayoutSlug,
    loader: LayoutRegistryRecord['loader'],
    schema: LayoutSchema
  ): void {
    this.layouts.set(slug, { slug, loader, schema });
  }

  getSection(slug: SectionSlug): SectionRegistryRecord | undefined {
    return this.sections.get(slug);
  }

  getBlock(slug: BlockSlug): BlockRegistryRecord | undefined {
    return this.blocks.get(slug);
  }

  getLayout(slug: LayoutSlug): LayoutRegistryRecord | undefined {
    return this.layouts.get(slug);
  }

  async loadSection(slug: SectionSlug): Promise<ComponentType<SectionProps> | null> {
    const cached = this.sectionCache.get(slug);
    if (cached) return cached;

    const record = this.sections.get(slug);
    if (!record) return null;
    const module = await record.loader();
    const component = module.default ?? null;

    if (component) {
      this.sectionCache.set(slug, component);
    }

    return component;
  }

  async loadBlock(slug: BlockSlug): Promise<ComponentType<BlockProps> | null> {
    const cached = this.blockCache.get(slug);
    if (cached) return cached;

    const record = this.blocks.get(slug);
    if (!record) return null;
    const module = await record.loader();
    const component = module.default ?? null;

    if (component) {
      this.blockCache.set(slug, component);
    }

    return component;
  }

  async loadLayout(slug: LayoutSlug): Promise<ComponentType<LayoutProps> | null> {
    const cached = this.layoutCache.get(slug);
    if (cached) return cached;

    const record = this.layouts.get(slug);
    if (!record) return null;
    const module = await record.loader();
    const component = module.default ?? null;

    if (component) {
      this.layoutCache.set(slug, component);
    }

    return component;
  }

  getSectionComponent(slug: SectionSlug): ComponentType<SectionProps> | null {
    return this.sectionCache.get(slug) ?? null;
  }

  getBlockComponent(slug: BlockSlug): ComponentType<BlockProps> | null {
    return this.blockCache.get(slug) ?? null;
  }

  getLayoutComponent(slug: LayoutSlug): ComponentType<LayoutProps> | null {
    return this.layoutCache.get(slug) ?? null;
  }

  setSectionComponent(slug: SectionSlug, component: ComponentType<SectionProps>): void {
    this.sectionCache.set(slug, component);
  }

  setBlockComponent(slug: BlockSlug, component: ComponentType<BlockProps>): void {
    this.blockCache.set(slug, component);
  }

  setLayoutComponent(slug: LayoutSlug, component: ComponentType<LayoutProps>): void {
    this.layoutCache.set(slug, component);
  }

  getSectionSchema(slug: SectionSlug): SectionSchema | undefined {
    return this.sections.get(slug)?.schema;
  }

  getBlockSchema(slug: BlockSlug): BlockSchema | undefined {
    return this.blocks.get(slug)?.schema;
  }

  getLayoutSchema(slug: LayoutSlug): LayoutSchema | undefined {
    return this.layouts.get(slug)?.schema;
  }

  listSections(): SectionSlug[] {
    return Array.from(this.sections.keys());
  }

  listBlocks(): BlockSlug[] {
    return Array.from(this.blocks.keys());
  }

  listLayouts(): LayoutSlug[] {
    return Array.from(this.layouts.keys());
  }

  async preloadAll(): Promise<void> {
    const promises: Promise<any>[] = [];

    // Preload all sections
    for (const slug of this.sections.keys()) {
      promises.push(this.loadSection(slug));
    }

    // Preload all blocks
    for (const slug of this.blocks.keys()) {
      promises.push(this.loadBlock(slug));
    }

    // Preload all layouts
    for (const slug of this.layouts.keys()) {
      promises.push(this.loadLayout(slug));
    }

    await Promise.all(promises);
  }
}

export const pageBuilderRegistry = new PageBuilderRegistry();

export function registerSection(
  slug: SectionSlug,
  loader: SectionRegistryRecord['loader'],
  schema: SectionSchema
): void {
  pageBuilderRegistry.registerSection(slug, loader, schema);
}

export function registerBlock(
  slug: BlockSlug,
  loader: BlockRegistryRecord['loader'],
  schema: BlockSchema
): void {
  pageBuilderRegistry.registerBlock(slug, loader, schema);
}

export function registerLayout(
  slug: LayoutSlug,
  loader: LayoutRegistryRecord['loader'],
  schema: LayoutSchema
): void {
  pageBuilderRegistry.registerLayout(slug, loader, schema);
}
