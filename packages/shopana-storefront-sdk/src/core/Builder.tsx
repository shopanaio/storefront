import type {
  BlockInstance,
  PageBuilderProps,
  SectionConfig,
  SectionCollection,
} from './types';
import { TemplateDataProvider } from './TemplateDataContext';
import { Section, type SectionEditorBlockConfig } from './Section';

function resolveBlocks(sectionConfig: SectionConfig<any, any>): {
  blocks?: BlockInstance[];
  editorBlocks?: SectionEditorBlockConfig[];
} {
  if (!sectionConfig.blocks) return {};

  const collection = sectionConfig.blocks;

  if (!Array.isArray(collection.order)) {
    return {};
  }

  const blocks: BlockInstance[] = [];
  const editorBlocks: SectionEditorBlockConfig[] = [];

  for (const blockId of collection.order) {
    const blockConfig = collection[blockId];

    if (!blockConfig || Array.isArray(blockConfig)) continue;

    blocks.push({
      id: blockId,
      component: blockConfig.component,
      settings: blockConfig.settings,
    });
    editorBlocks.push({
      id: blockId,
      settings: blockConfig.settings,
      schema: blockConfig.schema,
    });
  }

  return {
    blocks: blocks.length ? blocks : undefined,
    editorBlocks: editorBlocks.length ? editorBlocks : undefined,
  };
}

function resolveSections<TData>(
  sections: SectionCollection<TData>,
  data: TData,
  pageType: PageBuilderProps<TData>['pageType']
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

      const { blocks, editorBlocks } = resolveBlocks(sectionConfig);

      return (
        <Section
          key={sectionId}
          id={sectionId}
          settings={sectionConfig.settings}
          blocks={blocks}
          data={data}
          component={sectionConfig.component}
          schema={sectionConfig.schema}
          editorScope={pageType}
          editorBlocks={editorBlocks}
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
  const sections = resolveSections(template.sections, data, pageType);

  if (!sections.length && fallback) {
    return <>{fallback}</>;
  }

  return (
    <TemplateDataProvider value={{ pageType, data }}>
      {sections}
    </TemplateDataProvider>
  );
}
