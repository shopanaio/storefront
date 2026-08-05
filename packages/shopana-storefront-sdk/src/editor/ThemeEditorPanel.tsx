'use client';

import type { CSSProperties, ReactNode } from 'react';
import {
  Alert,
  Button,
  Collapse,
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
import type {
  RegisteredEditorBlock,
  RegisteredEditorSection,
  ThemeEditorScope,
} from './store';
import {
  useThemeEditorAvailable,
  useThemeEditorStore,
} from './ThemeEditorLayout';

const floatingButtonStyle: CSSProperties = {
  position: 'fixed',
  top: '50%',
  zIndex: 1101,
  width: 38,
  height: 56,
  padding: 0,
  borderRadius: '10px 0 0 10px',
  transform: 'translateY(-50%)',
  transition: 'right 0.2s ease',
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
        <Typography.Title key={`header-${index}`} level={5}>
          {definition.content}
        </Typography.Title>
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

interface ObjectFieldsProps {
  value: Record<string, unknown>;
  path?: string[];
  onChange: (path: string[], value: unknown) => void;
}

function ObjectFields({ value, path = [], onChange }: ObjectFieldsProps) {
  const leaves: ReactNode[] = [];
  const groups: Array<{ key: string; value: Record<string, unknown> }> = [];

  Object.entries(value).forEach(([key, fieldValue]) => {
    if (
      fieldValue &&
      typeof fieldValue === 'object' &&
      !Array.isArray(fieldValue)
    ) {
      groups.push({ key, value: fieldValue as Record<string, unknown> });
      return;
    }

    const fieldPath = [...path, key];
    const label = titleFromKey(key);
    let control: ReactNode;

    if (typeof fieldValue === 'boolean') {
      control = (
        <Switch
          checked={fieldValue}
          onChange={(next) => onChange(fieldPath, next)}
        />
      );
    } else if (typeof fieldValue === 'number') {
      control = (
        <InputNumber
          value={fieldValue}
          style={{ width: '100%' }}
          onChange={(next) => onChange(fieldPath, next)}
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
          options={Object.keys(value.schemes as Record<string, unknown>).map(
            (scheme) => ({
              value: scheme,
              label: titleFromKey(scheme),
            })
          )}
          style={{ width: '100%' }}
          onChange={(next) => onChange(fieldPath, next)}
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
          onChange={(_, css) => onChange(fieldPath, css)}
        />
      );
    } else {
      control = (
        <Input
          value={String(fieldValue ?? '')}
          onChange={(event) => onChange(fieldPath, event.target.value)}
        />
      );
    }

    leaves.push(
      <div key={key} style={fieldStyle}>
        <Typography.Text style={labelStyle}>{label}</Typography.Text>
        {control}
      </div>
    );
  });

  return (
    <>
      {leaves}
      {groups.length ? (
        <Collapse
          size="small"
          items={groups.map((group) => ({
            key: group.key,
            label: titleFromKey(group.key),
            children: (
              <ObjectFields
                value={group.value}
                path={[...path, group.key]}
                onChange={onChange}
              />
            ),
          }))}
        />
      ) : null}
    </>
  );
}

function BlockEditor({
  scope,
  sectionId,
  block,
  generalSettings,
}: {
  scope: ThemeEditorScope;
  sectionId: string;
  block: RegisteredEditorBlock;
  generalSettings: Record<string, unknown>;
}) {
  const update = useThemeEditorStore((state) => state.updateBlockSetting);
  const reset = useThemeEditorStore((state) => state.resetBlock);

  if (!block.schema?.settings.length) {
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
        onChange={(id, value) => update(scope, sectionId, block.id, id, value)}
      />
      <Button
        type="link"
        size="small"
        onClick={() => reset(scope, sectionId, block.id)}
      >
        Reset block
      </Button>
    </>
  );
}

function SectionEditor({
  scope,
  section,
  generalSettings,
}: {
  scope: ThemeEditorScope;
  section: RegisteredEditorSection;
  generalSettings: Record<string, unknown>;
}) {
  const update = useThemeEditorStore((state) => state.updateSectionSetting);
  const reset = useThemeEditorStore((state) => state.resetSection);
  const hasSettings = Boolean(section.schema?.settings.length);

  return (
    <>
      {hasSettings ? (
        <SchemaFields
          definitions={section.schema!.settings}
          settings={section.settings}
          generalSettings={generalSettings}
          onChange={(id, value) => update(scope, section.id, id, value)}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No section settings"
        />
      )}
      {hasSettings ? (
        <Button
          type="link"
          size="small"
          onClick={() => reset(scope, section.id)}
        >
          Reset section
        </Button>
      ) : null}
      {section.blockOrder.length ? (
        <Divider titlePlacement="start">Blocks</Divider>
      ) : null}
      {section.blockOrder.length ? (
        <Collapse
          size="small"
          items={section.blockOrder.map((blockId) => ({
            key: blockId,
            label: section.blocks[blockId]?.name ?? blockId,
            children: section.blocks[blockId] ? (
              <BlockEditor
                scope={scope}
                sectionId={section.id}
                block={section.blocks[blockId]}
                generalSettings={generalSettings}
              />
            ) : null,
          }))}
        />
      ) : null}
    </>
  );
}

function ScopeEditor({
  scope,
  generalSettings,
}: {
  scope: ThemeEditorScope;
  generalSettings: Record<string, unknown>;
}) {
  const registeredScope = useThemeEditorStore((state) => state.scopes[scope]);

  if (!registeredScope?.sectionOrder.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No editable sections"
      />
    );
  }

  return (
    <Collapse
      items={registeredScope.sectionOrder.map((sectionId) => {
        const section = registeredScope.sections[sectionId];
        return {
          key: sectionId,
          label: section?.name ?? sectionId,
          children: section ? (
            <SectionEditor
              scope={scope}
              section={section}
              generalSettings={generalSettings}
            />
          ) : null,
        };
      })}
    />
  );
}

export function ThemeEditorPanel() {
  const available = useThemeEditorAvailable();
  const open = useThemeEditorStore((state) => state.open);
  const setOpen = useThemeEditorStore((state) => state.setOpen);
  const generalSettings = useThemeEditorStore((state) => state.generalSettings);
  const currentPageType = useThemeEditorStore((state) => state.currentPageType);
  const updateGeneral = useThemeEditorStore(
    (state) => state.updateGeneralSetting
  );
  const resetGeneral = useThemeEditorStore(
    (state) => state.resetGeneralSettings
  );

  if (!available) return null;

  return (
    <>
      <Button
        type="primary"
        aria-label={open ? 'Close theme settings' : 'Open theme settings'}
        style={{ ...floatingButtonStyle, right: open ? 380 : 0 }}
        onClick={() => setOpen(!open)}
      >
        <span aria-hidden="true" style={{ fontSize: 22, lineHeight: 1 }}>
          {open ? '›' : '‹'}
        </span>
      </Button>
      <Drawer
        title="Theme settings"
        placement="right"
        width={380}
        open={open}
        mask={false}
        onClose={() => setOpen(false)}
        styles={{ body: { padding: 16 } }}
      >
        <Collapse
          defaultActiveKey={['page']}
          items={[
            {
              key: 'global',
              label: 'Global settings',
              children: (
                <>
                  <ObjectFields
                    value={generalSettings}
                    onChange={updateGeneral}
                  />
                  <Button type="link" size="small" onClick={resetGeneral}>
                    Reset global settings
                  </Button>
                </>
              ),
            },
            {
              key: 'theme',
              label: 'Theme sections',
              children: (
                <ScopeEditor scope="theme" generalSettings={generalSettings} />
              ),
            },
            {
              key: 'page',
              label: currentPageType
                ? `${titleFromKey(currentPageType)} page`
                : 'Current page',
              children: currentPageType ? (
                <ScopeEditor
                  scope={currentPageType}
                  generalSettings={generalSettings}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Page is loading"
                />
              ),
            },
          ]}
        />
      </Drawer>
    </>
  );
}
