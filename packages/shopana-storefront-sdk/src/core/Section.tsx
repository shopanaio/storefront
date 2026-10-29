'use client';

import { useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
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

/** The block settings of a section without blocks: one array, so the selection stays equal. */
const NO_BLOCK_SETTINGS: readonly unknown[] = [];

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
  // The settings the editor holds, the section's own until registered: the store keeps the
  // section's objects until they are edited, so registering renders the section again for
  // nothing (it would be the whole page, synchronously, before the browser paints it).
  const settings = useThemeEditorStore(
    (state) =>
      ((editorScope &&
        state.scopes[editorScope]?.sections[config.id]?.settings) as
        | TSettings
        | undefined) ?? config.settings
  );
  // The settings of each block, in the order of `config.blocks`: the editor's, the block's
  // own until registered. A new array on every read, so compared item by item (useShallow):
  // the section renders again only when a block's settings object changes, on an edit.
  const blockSettings = useThemeEditorStore(
    useShallow((state) => {
      const section = editorScope
        ? state.scopes[editorScope]?.sections[config.id]
        : undefined;
      return (
        config.blocks?.map(
          (block) => section?.blocks[block.id]?.settings ?? block.settings
        ) ?? NO_BLOCK_SETTINGS
      );
    })
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

  // The section's own config while nothing is edited in the editor; with an edit, the config
  // with the edited settings of the section and its blocks.
  const liveConfig = useMemo(() => {
    const blocksEdited = config.blocks?.some(
      (block, index) => block.settings !== blockSettings[index]
    );
    if (settings === config.settings && !blocksEdited) return config;

    return {
      ...config,
      settings,
      blocks: config.blocks?.map((block, index) => ({
        ...block,
        settings: blockSettings[index],
      })),
    };
  }, [config, settings, blockSettings]);

  return (
    <SectionErrorBoundary sectionId={config.id}>
      <Component {...liveConfig} />
    </SectionErrorBoundary>
  );
}
