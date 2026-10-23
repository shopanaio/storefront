'use client';

import { useEffect, useMemo } from 'react';
import type { SectionProps, SectionComponent } from './types';
import type { BlockSettingsSchema, SectionSettingsSchema } from './settings';
import { SectionErrorBoundary } from './ErrorBoundary';
import type { ThemeEditorScope } from '../editor/store';
import {
  useThemeEditorAvailable,
  useThemeEditorStore,
} from '../editor/ThemeEditorLayout';

export interface SectionEditorBlockConfig {
  id: string;
  settings: Record<string, unknown>;
  schema?: BlockSettingsSchema<any>;
}

interface SectionRendererProps<
  TSettings = any,
  TData = any,
> extends SectionProps<TSettings, TData> {
  component: SectionComponent<TSettings, TData>;
  schema?: SectionSettingsSchema<any>;
  editorScope?: ThemeEditorScope;
  editorBlocks?: SectionEditorBlockConfig[];
}

export function Section<TSettings = any, TData = any>({
  component,
  schema,
  editorScope,
  editorBlocks,
  ...config
}: SectionRendererProps<TSettings, TData>) {
  const Component = component;
  const editorAvailable = useThemeEditorAvailable();
  const registerSection = useThemeEditorStore((state) => state.registerSection);
  const registeredSection = useThemeEditorStore((state) =>
    editorScope ? state.scopes[editorScope]?.sections[config.id] : undefined
  );

  useEffect(() => {
    if (!editorAvailable || !editorScope) return;

    registerSection({
      scope: editorScope,
      id: config.id,
      settings: config.settings as Record<string, unknown>,
      schema,
      blocks: editorBlocks,
    });
  }, [
    config.id,
    config.settings,
    editorAvailable,
    editorBlocks,
    editorScope,
    registerSection,
    schema,
  ]);

  const liveConfig = useMemo(() => {
    if (!registeredSection) return config;

    return {
      ...config,
      settings: registeredSection.settings as TSettings,
      blocks: config.blocks?.map((block) => ({
        ...block,
        settings:
          registeredSection.blocks[block.id]?.settings ?? block.settings,
      })),
    };
  }, [config, registeredSection]);

  return (
    <SectionErrorBoundary sectionId={config.id}>
      <Component {...liveConfig} />
    </SectionErrorBoundary>
  );
}
