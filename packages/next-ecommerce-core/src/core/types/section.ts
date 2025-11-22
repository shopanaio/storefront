import type { ComponentType, LazyExoticComponent } from 'react';

export interface BlockInstance<TSettings = Record<string, any>> {
  id: string;
  type: string;
  settings: TSettings;
  blocks?: BlockInstance[];
}

export interface SectionProps<TSettings = Record<string, any>, TData = unknown> {
  id: string;
  settings: TSettings;
  blocks?: BlockInstance[];
  data: TData;
}

export type SectionComponent<TSettings = any, TData = any> =
  | ComponentType<SectionProps<TSettings, TData>>
  | LazyExoticComponent<ComponentType<SectionProps<TSettings, TData>>>;

export interface SectionInstance<TSettings = any, TData = any> {
  id: string;
  component: SectionComponent<TSettings, TData>;
  settings: TSettings;
  blocks?: BlockInstance[];
}
