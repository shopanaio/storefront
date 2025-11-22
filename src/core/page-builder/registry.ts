import type { ComponentType } from 'react';
import type {
  BlockProps,
  BlockSchema,
  SectionProps,
  SectionSchema,
  PageBuilderComponentModule,
} from './types';

export type SectionSlug = string;
export type BlockSlug = string;

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

class PageBuilderRegistry {
  private sections = new Map<SectionSlug, SectionRegistryRecord>();

  private blocks = new Map<BlockSlug, BlockRegistryRecord>();

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

  getSection(slug: SectionSlug): SectionRegistryRecord | undefined {
    return this.sections.get(slug);
  }

  getBlock(slug: BlockSlug): BlockRegistryRecord | undefined {
    return this.blocks.get(slug);
  }

  async loadSection(slug: SectionSlug): Promise<ComponentType<SectionProps> | null> {
    const record = this.sections.get(slug);
    if (!record) return null;
    const module = await record.loader();
    return module.default ?? null;
  }

  async loadBlock(slug: BlockSlug): Promise<ComponentType<BlockProps> | null> {
    const record = this.blocks.get(slug);
    if (!record) return null;
    const module = await record.loader();
    return module.default ?? null;
  }

  getSectionSchema(slug: SectionSlug): SectionSchema | undefined {
    return this.sections.get(slug)?.schema;
  }

  getBlockSchema(slug: BlockSlug): BlockSchema | undefined {
    return this.blocks.get(slug)?.schema;
  }

  listSections(): SectionSlug[] {
    return Array.from(this.sections.keys());
  }

  listBlocks(): BlockSlug[] {
    return Array.from(this.blocks.keys());
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
