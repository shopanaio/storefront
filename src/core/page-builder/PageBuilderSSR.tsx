import type { PageTemplate, SectionInstance, BlockInstance } from './types';
import { pageBuilderRegistry } from './registry';

export interface PageBuilderSSRProps<TData = any> {
  template: PageTemplate<TData>;
}

/**
 * Server-side rendering version of PageBuilder
 * This component renders directly from the template without using client-side store
 */
export async function PageBuilderSSR<TData = any>({
  template,
}: PageBuilderSSRProps<TData>) {
  // Load layout component
  const LayoutComponent = template.layout
    ? await pageBuilderRegistry.loadLayout(template.layout.type)
    : null;

  // Render page sections
  const pageSections = await Promise.all(
    template.sections.map((section) => renderSection(section))
  );

  // Render layout sections if layout exists
  const layoutSections = template.layout?.sections
    ? await Promise.all(
        template.layout.sections.map((section) => renderSection(section))
      )
    : [];

  // If no layout, render sections directly
  if (!LayoutComponent || !template.layout) {
    return <>{pageSections}</>;
  }

  // Render with layout - pass rendered sections as children
  return (
    <LayoutComponent
      id={template.layout.id}
      settings={template.layout.settings}
      sections={layoutSections}
    >
      {pageSections}
    </LayoutComponent>
  );
}

async function renderSection(section: SectionInstance) {
  const SectionComponent = await pageBuilderRegistry.loadSection(section.type);

  if (!SectionComponent) {
    console.error(`Section type "${section.type}" not found`);
    return null;
  }

  // Render blocks for this section
  const blocks = section.blocks
    ? await Promise.all(section.blocks.map((block) => renderBlock(block)))
    : [];

  return (
    <SectionComponent
      key={section.id}
      id={section.id}
      settings={section.settings}
      blocks={blocks}
    />
  );
}

async function renderBlock(block: BlockInstance) {
  const BlockComponent = await pageBuilderRegistry.loadBlock(block.type);

  if (!BlockComponent) {
    console.error(`Block type "${block.type}" not found`);
    return null;
  }

  return (
    <BlockComponent key={block.id} id={block.id} settings={block.settings} />
  );
}
