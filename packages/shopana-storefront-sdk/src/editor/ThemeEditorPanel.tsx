'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import {
  Alert,
  Button,
  ColorPicker,
  Divider,
  Drawer,
  Empty,
  Flex,
  Input,
  InputNumber,
  Radio,
  Segmented,
  Select,
  Slider,
  Switch,
  Typography,
} from 'antd';
import type { SectionSettingDefinition } from '../core/settings';
import type { PageType } from '../core/types';
import type { ThemeEditorScope } from './store';
import {
  useThemeEditorAvailable,
  useThemeEditorStore,
} from './ThemeEditorLayout';

const floatingButtonStyle: CSSProperties = {
  position: 'fixed',
  top: '50%',
  zIndex: 1101,
  width: 30,
  height: 44,
  padding: 0,
  borderRadius: '8px 0 0 8px',
  transform: 'translateY(-50%)',
  transition: 'right 0.3s ease',
  boxShadow: '0 6px 24px rgba(0, 0, 0, 0.18)',
};

const fieldStyle: CSSProperties = { marginBottom: 18 };
const labelStyle: CSSProperties = { display: 'block', marginBottom: 7 };

function titleFromKey(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/^./, (character) => character.toUpperCase());
}

function isVisible(
  definition: SectionSettingDefinition<any>,
  settings: Record<string, unknown>
) {
  if (!('visibleIf' in definition) || !definition.visibleIf) return true;
  const condition = definition.visibleIf;
  const value = settings[String(condition.id)];
  return 'equals' in condition
    ? value === condition.equals
    : value !== condition.notEquals;
}

interface SchemaFieldsProps {
  definitions: readonly SectionSettingDefinition<any>[];
  settings: Record<string, unknown>;
  generalSettings: Record<string, unknown>;
  onChange: (id: string, value: unknown) => void;
}

function SchemaFields({
  definitions,
  settings,
  generalSettings,
  onChange,
}: SchemaFieldsProps) {
  return definitions.map((definition, index) => {
    if (!isVisible(definition, settings)) return null;

    if (definition.type === 'header') {
      return (
        <div key={`header-${index}`}>
          <Divider
            style={{
              margin: index === 0 ? '0 0 16px' : '28px 0 16px',
              borderBlockStartColor: 'rgba(5, 5, 5, 0.14)',
            }}
          />
          <Typography.Title
            level={5}
            style={{ margin: '0 0 18px', textAlign: 'left' }}
          >
            {definition.content}
          </Typography.Title>
        </div>
      );
    }
    if (definition.type === 'paragraph') {
      return (
        <Typography.Paragraph key={`paragraph-${index}`} type="secondary">
          {definition.content}
        </Typography.Paragraph>
      );
    }
    if (definition.type === 'notice') {
      return (
        <Alert
          key={`notice-${index}`}
          message={definition.content}
          type={definition.tone === 'warning' ? 'warning' : 'info'}
          showIcon
          style={fieldStyle}
        />
      );
    }
    if (definition.type === 'divider') {
      return <Divider key={`divider-${index}`} />;
    }

    const id = String(definition.id);
    const value = settings[id] ?? definition.default;
    let control: ReactNode;

    switch (definition.type) {
      case 'checkbox':
        control = (
          <Switch
            checked={Boolean(value)}
            onChange={(checked) => onChange(id, checked)}
          />
        );
        break;
      case 'number':
        control = (
          <InputNumber
            value={typeof value === 'number' ? value : undefined}
            min={definition.min}
            max={definition.max}
            step={definition.step}
            addonAfter={definition.unit}
            style={{ width: '100%' }}
            onChange={(next) => onChange(id, next)}
          />
        );
        break;
      case 'range':
        control = (
          <Flex gap={12} align="center">
            <Slider
              value={typeof value === 'number' ? value : definition.default}
              min={definition.min}
              max={definition.max}
              step={definition.step}
              style={{ flex: 1 }}
              onChange={(next) => onChange(id, next)}
            />
            <InputNumber
              value={typeof value === 'number' ? value : definition.default}
              min={definition.min}
              max={definition.max}
              step={definition.step}
              suffix={definition.unit}
              style={{ width: 100 }}
              onChange={(next) => onChange(id, next)}
            />
          </Flex>
        );
        break;
      case 'select': {
        const options = definition.options.map((option) => ({
          label: option.label,
          value: option.value,
        }));
        control =
          definition.presentation === 'segmented' ? (
            <Segmented
              block
              value={value as string | number | undefined}
              options={options}
              onChange={(next) => onChange(id, next)}
            />
          ) : (
            <Select
              value={value as string | number | undefined}
              options={options}
              style={{ width: '100%' }}
              onChange={(next) => onChange(id, next)}
            />
          );
        break;
      }
      case 'radio':
        control = (
          <Radio.Group
            value={value}
            options={definition.options.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
            onChange={(event) => onChange(id, event.target.value)}
          />
        );
        break;
      case 'color':
        control = (
          <ColorPicker
            value={String(value ?? '')}
            showText
            onChange={(_, css) => onChange(id, css)}
          />
        );
        break;
      case 'color_scheme': {
        const colors = generalSettings.colors as
          | { schemes?: Record<string, unknown> }
          | undefined;
        control = (
          <Select
            value={value as string | undefined}
            options={Object.keys(colors?.schemes ?? {}).map((scheme) => ({
              label: titleFromKey(scheme),
              value: scheme,
            }))}
            style={{ width: '100%' }}
            onChange={(next) => onChange(id, next)}
          />
        );
        break;
      }
      case 'textarea':
        control = (
          <Input.TextArea
            value={String(value ?? '')}
            placeholder={definition.placeholder}
            autoSize={{ minRows: 3, maxRows: 8 }}
            onChange={(event) => onChange(id, event.target.value)}
          />
        );
        break;
      default:
        control = (
          <Input
            value={String(value ?? '')}
            placeholder={
              'placeholder' in definition ? definition.placeholder : undefined
            }
            onChange={(event) => onChange(id, event.target.value)}
          />
        );
    }

    return (
      <div key={id} style={fieldStyle}>
        <Typography.Text style={labelStyle}>{definition.label}</Typography.Text>
        {control}
        {definition.info ? (
          <Typography.Text
            type="secondary"
            style={{ display: 'block', marginTop: 6 }}
          >
            {definition.info}
          </Typography.Text>
        ) : null}
      </div>
    );
  });
}

const PAGE_TYPES: PageType[] = [
  'home',
  'product',
  'category',
  'collection',
  'search',
  'blog',
  'article',
  'page',
  'cart',
  'list-collections',
  'vendor',
  '404',
];

type EditorRoute =
  | { type: 'root'; title: string }
  | { type: 'global'; title: string; path: string[] }
  | { type: 'scope'; title: string; scope: ThemeEditorScope }
  | {
      type: 'section';
      title: string;
      scope: ThemeEditorScope;
      sectionId: string;
    }
  | {
      type: 'block';
      title: string;
      scope: ThemeEditorScope;
      sectionId: string;
      blockId: string;
    };

const rootRoute: EditorRoute = { type: 'root', title: 'Theme editor' };

function NavigationRow({
  title,
  description,
  active,
  onClick,
}: {
  title: string;
  description?: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="text"
      block
      onClick={onClick}
      style={{
        height: 'auto',
        minHeight: 54,
        padding: '11px 12px',
        marginBottom: 6,
        border: '1px solid rgba(5, 5, 5, 0.08)',
        textAlign: 'left',
        justifyContent: 'flex-start',
      }}
    >
      <Flex
        align="center"
        justify="space-between"
        gap={12}
        style={{ width: '100%' }}
      >
        <span style={{ minWidth: 0 }}>
          <Typography.Text strong>{title}</Typography.Text>
          {active ? (
            <Typography.Text type="secondary"> · Current</Typography.Text>
          ) : null}
          {description ? (
            <Typography.Text
              type="secondary"
              style={{ display: 'block', marginTop: 2 }}
            >
              {description}
            </Typography.Text>
          ) : null}
        </span>
        <span aria-hidden="true" style={{ flex: '0 0 auto', fontSize: 20 }}>
          ›
        </span>
      </Flex>
    </Button>
  );
}

function getObjectAtPath(
  root: Record<string, unknown>,
  path: string[]
): Record<string, unknown> {
  return path.reduce<Record<string, unknown>>((current, part) => {
    const next = current[part];
    return next && typeof next === 'object' && !Array.isArray(next)
      ? (next as Record<string, unknown>)
      : {};
  }, root);
}

function GlobalSettingsLevel({
  path,
  onOpenGroup,
}: {
  path: string[];
  onOpenGroup: (key: string) => void;
}) {
  const generalSettings = useThemeEditorStore((state) => state.generalSettings);
  const update = useThemeEditorStore((state) => state.updateGeneralSetting);
  const reset = useThemeEditorStore((state) => state.resetGeneralSettings);
  const value = getObjectAtPath(generalSettings, path);
  const entries = Object.entries(value);
  const groups = entries.filter(
    ([, fieldValue]) =>
      fieldValue && typeof fieldValue === 'object' && !Array.isArray(fieldValue)
  );
  const leaves = entries.filter(
    ([, fieldValue]) =>
      !fieldValue || typeof fieldValue !== 'object' || Array.isArray(fieldValue)
  );

  return (
    <>
      {groups.map(([key, fieldValue]) => (
        <NavigationRow
          key={key}
          title={titleFromKey(key)}
          description={`${Object.keys(fieldValue as Record<string, unknown>).length} settings`}
          onClick={() => onOpenGroup(key)}
        />
      ))}
      {groups.length && leaves.length ? <Divider /> : null}
      {leaves.map(([key, fieldValue]) => {
        const fieldPath = [...path, key];
        let control: ReactNode;

        if (typeof fieldValue === 'boolean') {
          control = (
            <Switch
              checked={fieldValue}
              onChange={(next) => update(fieldPath, next)}
            />
          );
        } else if (typeof fieldValue === 'number') {
          control = (
            <InputNumber
              value={fieldValue}
              style={{ width: '100%' }}
              onChange={(next) => update(fieldPath, next)}
            />
          );
        } else if (
          key === 'defaultScheme' &&
          value.schemes &&
          typeof value.schemes === 'object'
        ) {
          control = (
            <Select
              value={String(fieldValue ?? '')}
              options={Object.keys(
                value.schemes as Record<string, unknown>
              ).map((scheme) => ({
                value: scheme,
                label: titleFromKey(scheme),
              }))}
              style={{ width: '100%' }}
              onChange={(next) => update(fieldPath, next)}
            />
          );
        } else if (
          typeof fieldValue === 'string' &&
          /^(#|rgb\(|rgba\(|hsl\(|hsla\()/.test(fieldValue)
        ) {
          control = (
            <ColorPicker
              value={fieldValue}
              showText
              onChange={(_, css) => update(fieldPath, css)}
            />
          );
        } else {
          control = (
            <Input
              value={String(fieldValue ?? '')}
              onChange={(event) => update(fieldPath, event.target.value)}
            />
          );
        }

        return (
          <div key={key} style={fieldStyle}>
            <Typography.Text style={labelStyle}>
              {titleFromKey(key)}
            </Typography.Text>
            {control}
          </div>
        );
      })}
      {!path.length ? (
        <Button type="link" size="small" onClick={reset}>
          Reset global settings
        </Button>
      ) : null}
    </>
  );
}

function ScopeLevel({
  scope,
  onOpenSection,
}: {
  scope: ThemeEditorScope;
  onOpenSection: (sectionId: string, title: string) => void;
}) {
  const registeredScope = useThemeEditorStore((state) => state.scopes[scope]);

  if (!registeredScope?.sectionOrder.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No editable sections registered"
      />
    );
  }

  return registeredScope.sectionOrder.map((sectionId) => {
    const section = registeredScope.sections[sectionId];
    const settingsCount = section?.schema?.settings.length ?? 0;
    const blocksCount = section?.blockOrder.length ?? 0;
    return (
      <NavigationRow
        key={sectionId}
        title={section?.name ?? titleFromKey(sectionId)}
        description={`${settingsCount} settings · ${blocksCount} blocks`}
        onClick={() =>
          onOpenSection(sectionId, section?.name ?? titleFromKey(sectionId))
        }
      />
    );
  });
}

function SectionLevel({
  scope,
  sectionId,
  onOpenBlock,
}: {
  scope: ThemeEditorScope;
  sectionId: string;
  onOpenBlock: (blockId: string, title: string) => void;
}) {
  const section = useThemeEditorStore(
    (state) => state.scopes[scope]?.sections[sectionId]
  );
  const generalSettings = useThemeEditorStore((state) => state.generalSettings);
  const update = useThemeEditorStore((state) => state.updateSectionSetting);
  const reset = useThemeEditorStore((state) => state.resetSection);

  if (!section) return <Empty description="Section is not registered" />;

  return (
    <>
      {section.schema?.settings.length ? (
        <SchemaFields
          definitions={section.schema.settings}
          settings={section.settings}
          generalSettings={generalSettings}
          onChange={(id, value) => update(scope, sectionId, id, value)}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No section settings"
        />
      )}
      {section.schema?.settings.length ? (
        <Button
          type="link"
          size="small"
          onClick={() => reset(scope, sectionId)}
        >
          Reset section
        </Button>
      ) : null}
      {section.blockOrder.length ? (
        <>
          <Divider titlePlacement="start">Blocks</Divider>
          {section.blockOrder.map((blockId) => {
            const block = section.blocks[blockId];
            return (
              <NavigationRow
                key={blockId}
                title={block?.name ?? titleFromKey(blockId)}
                description={`${block?.schema?.settings.length ?? 0} settings`}
                onClick={() =>
                  onOpenBlock(blockId, block?.name ?? titleFromKey(blockId))
                }
              />
            );
          })}
        </>
      ) : null}
    </>
  );
}

function BlockLevel({
  scope,
  sectionId,
  blockId,
}: {
  scope: ThemeEditorScope;
  sectionId: string;
  blockId: string;
}) {
  const block = useThemeEditorStore(
    (state) => state.scopes[scope]?.sections[sectionId]?.blocks[blockId]
  );
  const generalSettings = useThemeEditorStore((state) => state.generalSettings);
  const update = useThemeEditorStore((state) => state.updateBlockSetting);
  const reset = useThemeEditorStore((state) => state.resetBlock);

  if (!block?.schema?.settings.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No block settings"
      />
    );
  }

  return (
    <>
      <SchemaFields
        definitions={block.schema.settings}
        settings={block.settings}
        generalSettings={generalSettings}
        onChange={(id, value) => update(scope, sectionId, blockId, id, value)}
      />
      <Button
        type="link"
        size="small"
        onClick={() => reset(scope, sectionId, blockId)}
      >
        Reset block
      </Button>
    </>
  );
}

function RootLevel({
  currentPageType,
  onNavigate,
}: {
  currentPageType?: PageType;
  onNavigate: (route: EditorRoute) => void;
}) {
  const scopes = useThemeEditorStore((state) => state.scopes);

  return (
    <>
      <NavigationRow
        title="Global settings"
        description="Colors, typography and shared theme values"
        onClick={() =>
          onNavigate({ type: 'global', title: 'Global settings', path: [] })
        }
      />
      <NavigationRow
        title="Layout"
        description="Header, footer and shared sections"
        onClick={() =>
          onNavigate({ type: 'scope', title: 'Layout', scope: 'theme' })
        }
      />
      <Divider style={{ margin: '28px 0 18px' }} />
      <Typography.Title
        level={5}
        style={{ margin: '0 0 14px', textAlign: 'left' }}
      >
        Pages
      </Typography.Title>
      {PAGE_TYPES.map((pageType) => (
        <NavigationRow
          key={pageType}
          title={titleFromKey(pageType)}
          description={
            scopes[pageType]?.sectionOrder.length
              ? `${scopes[pageType]!.sectionOrder.length} sections`
              : 'Open this page to register its sections'
          }
          active={pageType === currentPageType}
          onClick={() =>
            onNavigate({
              type: 'scope',
              title: `${titleFromKey(pageType)} page`,
              scope: pageType,
            })
          }
        />
      ))}
    </>
  );
}

export function ThemeEditorPanel() {
  const available = useThemeEditorAvailable();
  const open = useThemeEditorStore((state) => state.open);
  const setOpen = useThemeEditorStore((state) => state.setOpen);
  const currentPageType = useThemeEditorStore((state) => state.currentPageType);
  const [history, setHistory] = useState<EditorRoute[]>([rootRoute]);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const route = history[history.length - 1];

  const navigate = (nextRoute: EditorRoute) => {
    setDirection('forward');
    setHistory((current) => [...current, nextRoute]);
  };
  const goBack = () => {
    setDirection('back');
    setHistory((current) =>
      current.length > 1 ? current.slice(0, -1) : current
    );
  };

  const routeKey =
    route.type === 'global'
      ? `${route.type}:${route.path.join('.')}`
      : route.type === 'scope'
        ? `${route.type}:${route.scope}`
        : route.type === 'section'
          ? `${route.type}:${route.scope}:${route.sectionId}`
          : route.type === 'block'
            ? `${route.type}:${route.scope}:${route.sectionId}:${route.blockId}`
            : route.type;

  let content: ReactNode;
  if (route.type === 'root') {
    content = (
      <RootLevel currentPageType={currentPageType} onNavigate={navigate} />
    );
  } else if (route.type === 'global') {
    content = (
      <GlobalSettingsLevel
        path={route.path}
        onOpenGroup={(key) =>
          navigate({
            type: 'global',
            title: titleFromKey(key),
            path: [...route.path, key],
          })
        }
      />
    );
  } else if (route.type === 'scope') {
    content = (
      <ScopeLevel
        scope={route.scope}
        onOpenSection={(sectionId, title) =>
          navigate({
            type: 'section',
            title,
            scope: route.scope,
            sectionId,
          })
        }
      />
    );
  } else if (route.type === 'section') {
    content = (
      <SectionLevel
        scope={route.scope}
        sectionId={route.sectionId}
        onOpenBlock={(blockId, title) =>
          navigate({
            type: 'block',
            title,
            scope: route.scope,
            sectionId: route.sectionId,
            blockId,
          })
        }
      />
    );
  } else {
    content = (
      <BlockLevel
        scope={route.scope}
        sectionId={route.sectionId}
        blockId={route.blockId}
      />
    );
  }

  if (!available) return null;

  return (
    <>
      <Button
        type="primary"
        aria-label={open ? 'Close theme settings' : 'Open theme settings'}
        style={{ ...floatingButtonStyle, right: open ? 380 : 0 }}
        onClick={() => setOpen(!open)}
      >
        <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>
          {open ? '›' : '‹'}
        </span>
      </Button>
      <Drawer
        title={
          <Flex align="center" gap={8}>
            {history.length > 1 ? (
              <Button
                type="text"
                aria-label="Back"
                onClick={goBack}
                style={{ marginLeft: -10, fontSize: 22 }}
              >
                ‹
              </Button>
            ) : null}
            <Typography.Title level={4} style={{ margin: 0 }}>
              {route.title}
            </Typography.Title>
          </Flex>
        }
        placement="right"
        width={380}
        open={open}
        mask={false}
        closable={{ placement: 'end' }}
        onClose={() => setOpen(false)}
        styles={{ body: { padding: 16 } }}
      >
        <style>{`
          @keyframes shopana-editor-forward {
            from { opacity: 0; transform: translateX(22px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes shopana-editor-back {
            from { opacity: 0; transform: translateX(-22px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
        <div
          key={routeKey}
          style={{
            animation: `shopana-editor-${direction} 180ms ease-out`,
          }}
        >
          {content}
        </div>
      </Drawer>
    </>
  );
}
