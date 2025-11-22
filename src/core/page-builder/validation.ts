import { pageBuilderRegistry } from './registry';
import type { PageTemplate, PageTemplateType, ValidationError } from './types';

export function validateTemplate(template: PageTemplate): ValidationError[] {
  const errors: ValidationError[] = [];

  template.sections.forEach((section) => {
    const schema = pageBuilderRegistry.getSectionSchema(section.type);

    if (!schema) {
      errors.push({
        sectionId: section.id,
        sectionType: section.type,
        message: `Section type "${section.type}" not found in registry`,
        severity: 'error',
      });
      return;
    }

    if (schema.templates && schema.templates.length > 0) {
      if (!schema.templates.includes(template.pageType)) {
        errors.push({
          sectionId: section.id,
          sectionType: section.type,
          message: `Section "${schema.name}" cannot be used on "${template.pageType}" pages. Allowed on: ${schema.templates.join(', ')}`,
          severity: 'error',
        });
      }
    }

    if (section.blocks) {
      section.blocks.forEach((block) => {
        const blockSchema = pageBuilderRegistry.getBlockSchema(block.type);

        if (!blockSchema) {
          errors.push({
            sectionId: section.id,
            sectionType: block.type,
            message: `Block type "${block.type}" not found in registry`,
            severity: 'error',
          });
          return;
        }

        if (schema.blocks?.types && !schema.blocks.types.includes(block.type)) {
          errors.push({
            sectionId: section.id,
            sectionType: block.type,
            message: `Block "${blockSchema.name}" is not allowed in section "${schema.name}". Allowed blocks: ${schema.blocks.types.join(', ')}`,
            severity: 'error',
          });
        }
      });

      if (schema.blocks?.max && section.blocks.length > schema.blocks.max) {
        errors.push({
          sectionId: section.id,
          sectionType: section.type,
          message: `Section "${schema.name}" has ${section.blocks.length} blocks, but max allowed is ${schema.blocks.max}`,
          severity: 'warning',
        });
      }
    }
  });

  return errors;
}

export function getAvailableSectionsForPageType(pageType: PageTemplateType): string[] {
  return pageBuilderRegistry.listSections().filter((slug) => {
    const schema = pageBuilderRegistry.getSectionSchema(slug);
    if (!schema) return false;

    if (!schema.templates || schema.templates.length === 0) {
      return true;
    }

    return schema.templates.includes(pageType);
  });
}

export function getAvailableBlocksForSection(sectionSlug: string): string[] {
  const schema = pageBuilderRegistry.getSectionSchema(sectionSlug);
  if (!schema || !schema.blocks) return [];
  return schema.blocks.types;
}

export function canSectionBeUsedOnPage(sectionSlug: string, pageType: PageTemplateType): boolean {
  const schema = pageBuilderRegistry.getSectionSchema(sectionSlug);
  if (!schema) return false;

  if (!schema.templates || schema.templates.length === 0) {
    return true;
  }

  return schema.templates.includes(pageType);
}
