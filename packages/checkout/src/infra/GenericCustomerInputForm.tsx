'use client';

import { Checkbox, Flex, Select, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { useMemo, useState, type ReactNode } from 'react';
import { FloatingLabelInput } from '#checkout/ui/FloatingLabelInput';
import { validateCustomerInput } from '#checkout/utils/jsonSchema';
import {
  contractFormModel,
  formInput,
  formValues,
  pathKey,
  pickedBranch,
  type FieldNode,
  type FormValues,
  type ObjectModel,
} from './customerInputForm';

interface GenericCustomerInputFormProps {
  contract: unknown;
  data: unknown;
  onSubmit: (data: unknown) => void;
  /**
   * Destination the input belongs to (country, city and carrier data of the address). A new
   * destination starts the form over; other edits of the address keep what was typed.
   */
  resetKey: string;
}

/**
 * Customer input form of a delivery option without its own module (FedEx, UPS and other
 * carriers), built from the option's `customerInputContract`: text, number, checkbox and
 * choice fields, nested objects and `oneOf` branches told apart by a constant. Empty fields
 * are left out of the input. Every change is submitted; the checkout saves it once typing
 * pauses. A field the contract rejects shows why once the customer has touched it.
 */
export function GenericCustomerInputForm({
  resetKey,
  ...props
}: GenericCustomerInputFormProps) {
  return <GenericCustomerInputFields key={resetKey} {...props} />;
}

function GenericCustomerInputFields({
  contract,
  data,
  onSubmit,
}: Omit<GenericCustomerInputFormProps, 'resetKey'>) {
  const t = useTranslations('Checkout');
  const model = useMemo(() => contractFormModel(contract), [contract]);
  const [values, setValues] = useState<FormValues>(() =>
    model ? formValues(model, data) : {}
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const issues = useMemo(() => {
    if (!model) {
      return new Map<string, string>();
    }
    const found = validateCustomerInput(contract, formInput(model, values));
    return new Map(found.map((issue) => [issue.path, issue.keyword]));
  }, [contract, model, values]);

  if (!model) {
    return null;
  }
  if (!model.supported) {
    return <Typography.Text type="secondary">{t('delivery-form-unsupported')}</Typography.Text>;
  }

  const change = (path: string[], value: unknown) => {
    const next = { ...values, [pathKey(path)]: value };
    setValues(next);
    setTouched((current) => ({ ...current, [pathKey(path)]: true }));
    onSubmit(formInput(model, next));
  };

  const errorOf = (path: string[]) => {
    const key = pathKey(path);
    const keyword = touched[key] ? issues.get(key) : undefined;
    if (!keyword) {
      return undefined;
    }
    return t(keyword === 'required' ? 'delivery-field-required' : 'delivery-field-invalid');
  };

  const renderField = (node: FieldNode) => {
    const key = pathKey(node.path);
    const value = values[key];
    const error = errorOf(node.path);
    if (node.schema.enum) {
      return (
        <Flex key={key} vertical gap={4}>
          <Select
            placeholder={node.title}
            value={value}
            allowClear={!node.required}
            status={error ? 'error' : undefined}
            options={node.schema.enum
              .filter((option) => option !== null)
              .map((option) => ({ value: option as string | number, label: String(option) }))}
            onChange={(option) => change(node.path, option ?? undefined)}
          />
          {error ? <Typography.Text type="danger">{error}</Typography.Text> : null}
        </Flex>
      );
    }
    if (node.type === 'boolean') {
      return (
        <Checkbox
          key={key}
          checked={value === true}
          onChange={(event) => change(node.path, event.target.checked)}
        >
          {node.title}
        </Checkbox>
      );
    }
    const numeric = node.type === 'number' || node.type === 'integer';
    return (
      <FloatingLabelInput
        key={key}
        label={node.title}
        value={typeof value === 'string' ? value : ''}
        maxLength={node.schema.maxLength}
        inputMode={numeric ? (node.type === 'integer' ? 'numeric' : 'decimal') : undefined}
        error={error}
        onChange={(event) => change(node.path, event.target.value)}
        onBlur={() => setTouched((current) => ({ ...current, [key]: true }))}
      />
    );
  };

  const renderModel = (current: ObjectModel): ReactNode => {
    const { choice } = current;
    const branch = choice ? pickedBranch(choice, values, current.path) : null;
    const choicePath = choice ? [...current.path, choice.discriminator] : [];
    const choiceError = choice ? errorOf(choicePath) : undefined;
    return (
      <>
        {current.nodes.map((node) =>
          node.kind === 'field' ? (
            renderField(node)
          ) : (
            <Flex key={pathKey(node.path)} vertical gap={8}>
              <Typography.Text strong>{node.title}</Typography.Text>
              {renderModel(node.model)}
            </Flex>
          )
        )}
        {choice && (
          <Flex vertical gap={4}>
            <Select
              value={branch ? choice.branches.indexOf(branch) : undefined}
              status={choiceError ? 'error' : undefined}
              options={choice.branches.map((option, index) => ({
                value: index,
                label: option.title,
                disabled: !option.model.supported,
              }))}
              onChange={(index: number) =>
                change(choicePath, choice.branches[index]?.value)
              }
            />
            {choiceError ? <Typography.Text type="danger">{choiceError}</Typography.Text> : null}
          </Flex>
        )}
        {branch && renderModel(branch.model)}
      </>
    );
  };

  return (
    <Flex vertical gap={12}>
      {renderModel(model)}
    </Flex>
  );
}
