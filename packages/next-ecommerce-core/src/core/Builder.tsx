import type {
  BlockInstance,
  PageBuilderProps,
  SectionConfig,
  SectionCollection,
} from './types';
import { TemplateDataProvider } from './TemplateDataContext';
import { Section } from './Section';

function resolveBlocks(
  sectionConfig: SectionConfig<any, any>,
): BlockInstance[] | undefined {
  if (!sectionConfig.blocks) return undefined;

  const collection = sectionConfig.blocks;

  if (!Array.isArray(collection.order)) {
    return undefined;
  }

  const blocks: BlockInstance[] = [];

  for (const blockId of collection.order) {
    const blockConfig = collection[blockId];

    if (!blockConfig || Array.isArray(blockConfig)) continue;

    blocks.push({
      id: blockId,
      component: blockConfig.component,
      settings: blockConfig.settings,
    });
  }

  return blocks.length ? blocks : undefined;
}

function resolveSections<TData>(
  sections: SectionCollection<TData>,
  data: TData,
) {
  if (!Array.isArray(sections.order)) {
    return [];
  }

  return sections.order
    .map((sectionId) => {
      const sectionConfig = sections[sectionId];

      if (!sectionConfig || Array.isArray(sectionConfig)) {
        return null;
      }

      const blocks = resolveBlocks(sectionConfig);

      return (
        <Section
          key={sectionId}
          id={sectionId}
          settings={sectionConfig.settings}
          blocks={blocks}
          data={data}
          component={sectionConfig.component}
        />
      );
    })
    .filter(Boolean);
}

export function Builder<TData>({
  template,
  data,
  pageType,
  fallback,
}: PageBuilderProps<TData>) {
  const LayoutComponent = template.layout.component;

  const sections = resolveSections(template.sections, data);

  if (!sections.length && fallback) {
    return <>{fallback}</>;
  }

  return (
    <TemplateDataProvider value={{ pageType, data }}>
      <LayoutComponent>{sections}</LayoutComponent>
    </TemplateDataProvider>
  );
}

