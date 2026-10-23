import {
  contractSchema,
  resolveSchema,
  type JsonSchema,
} from '#checkout/utils/jsonSchema';

/**
 * Form model of a delivery customer input contract (JSON Schema): which fields a generic
 * form shows, and how their values make up the input. Carriers without their own module
 * (FedEx, UPS and others) are completed with it.
 */

export type ScalarType = 'string' | 'number' | 'integer' | 'boolean';

export interface FieldNode {
  kind: 'field';
  /** Path of the value in the input. */
  path: string[];
  title: string;
  schema: JsonSchema;
  /** Scalar type; with `enum` the field is a choice of its values. */
  type: ScalarType;
  required: boolean;
  /** The contract also accepts `null`. */
  nullable: boolean;
}

export interface GroupNode {
  kind: 'group';
  path: string[];
  title: string;
  required: boolean;
  model: ObjectModel;
}

export interface Choice {
  /** Property whose constant tells the branches apart, e.g. `type`. */
  discriminator: string;
  branches: Array<{ value: unknown; title: string; model: ObjectModel }>;
}

export interface ObjectModel {
  path: string[];
  nodes: Array<FieldNode | GroupNode>;
  /** Constant properties: the form fills them in itself. */
  consts: Record<string, unknown>;
  /** `oneOf`/`anyOf` of the object, when its branches have a discriminator. */
  choice: Choice | null;
  /** False when the contract needs a value the form cannot enter (an array, say). */
  supported: boolean;
}

const SCALARS: ScalarType[] = ['string', 'number', 'integer', 'boolean'];

const typesOf = (schema: JsonSchema): string[] => {
  if (schema.type !== undefined) {
    return Array.isArray(schema.type) ? schema.type : [schema.type];
  }
  if (schema.enum?.length) {
    return [
      ...new Set(
        schema.enum.map((value) => (value === null ? 'null' : typeof value))
      ),
    ];
  }
  if (schema.properties || schema.oneOf || schema.anyOf) {
    return ['object'];
  }
  return [];
};

export const humanize = (key: string) => {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1).toLowerCase();
};

function discriminatorOf(branches: JsonSchema[]): string | null {
  const [first] = branches;
  const keys = Object.keys(first?.properties ?? {});
  return (
    keys.find((key) =>
      branches.every((branch) => branch.properties?.[key]?.const !== undefined)
    ) ?? null
  );
}

function objectModel(
  input: JsonSchema,
  root: JsonSchema,
  path: string[]
): ObjectModel {
  const schema = resolveSchema(input, root);
  const required = new Set(schema.required ?? []);
  const model: ObjectModel = {
    path,
    nodes: [],
    consts: {},
    choice: null,
    supported: true,
  };

  for (const [key, raw] of Object.entries(schema.properties ?? {})) {
    const property = resolveSchema(raw, root);
    const isRequired = required.has(key);
    const at = [...path, key];
    const title = property.title ?? humanize(key);
    if (property.const !== undefined) {
      model.consts[key] = property.const;
      continue;
    }
    const types = typesOf(property);
    const main = types.filter((type) => type !== 'null');
    const nullable = types.includes('null');
    if (main.length === 1 && SCALARS.includes(main[0] as ScalarType)) {
      model.nodes.push({
        kind: 'field',
        path: at,
        title,
        schema: property,
        type: main[0] as ScalarType,
        required: isRequired,
        nullable,
      });
    } else if (main.length === 1 && main[0] === 'object') {
      const inner = objectModel(property, root, at);
      model.nodes.push({
        kind: 'group',
        path: at,
        title,
        required: isRequired,
        model: inner,
      });
      if (!inner.supported && isRequired) {
        model.supported = false;
      }
    } else if (isRequired) {
      model.supported = false;
    }
  }

  const variants = schema.oneOf ?? schema.anyOf;
  if (variants?.length) {
    const branches = variants.map((branch) => resolveSchema(branch, root));
    const discriminator = discriminatorOf(branches);
    if (discriminator) {
      model.choice = {
        discriminator,
        branches: branches.map((branch) => {
          const inner = objectModel(branch, root, path);
          const value = branch.properties?.[discriminator]?.const;
          return { value, title: branch.title ?? String(value), model: inner };
        }),
      };
      if (!model.choice.branches.some((branch) => branch.model.supported)) {
        model.supported = false;
      }
    } else {
      model.supported = false;
    }
  }
  return model;
}

/** Form model of a contract, or `null` when the option takes no input. */
export function contractFormModel(contract: unknown): ObjectModel | null {
  const schema = contractSchema(contract);
  return schema ? objectModel(schema, schema, []) : null;
}

const hasFields = (model: ObjectModel): boolean =>
  model.choice !== null ||
  model.nodes.some((node) => node.kind === 'field' || hasFields(node.model));

/**
 * Whether the option needs a form: it has fields to enter, or it needs input the generic
 * form cannot take (the form then says so instead of leaving the section stuck).
 */
export function contractNeedsForm(contract: unknown): boolean {
  const model = contractFormModel(contract);
  return !!model && (!model.supported || hasFields(model));
}

/** Values the customer entered: field text, checkbox or picked value by path. */
export type FormValues = Record<string, unknown>;

export const pathKey = (path: string[]) => path.join('.');

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function fieldValue(node: FieldNode, entry: unknown): unknown {
  if (node.schema.enum || node.type === 'boolean') {
    return entry;
  }
  const text = typeof entry === 'string' ? entry.trim() : '';
  if (text.length === 0) {
    return node.required && node.nullable ? null : undefined;
  }
  if (node.type === 'number' || node.type === 'integer') {
    const number = Number(text.replace(',', '.'));
    // A malformed number stays text, so the contract check points at the field.
    return Number.isFinite(number) ? number : text;
  }
  return text;
}

/** The branch picked for an object, by its discriminator value. */
export const pickedBranch = (
  choice: Choice,
  values: FormValues,
  path: string[]
) => {
  const picked = values[pathKey([...path, choice.discriminator])];
  return choice.branches.find((branch) => branch.value === picked) ?? null;
};

function objectValue(
  model: ObjectModel,
  values: FormValues
): { value: Record<string, unknown>; entered: boolean } {
  const value: Record<string, unknown> = { ...model.consts };
  let entered = false;
  for (const node of model.nodes) {
    const key = node.path[node.path.length - 1];
    if (node.kind === 'field') {
      const item = fieldValue(node, values[pathKey(node.path)]);
      if (item !== undefined) {
        value[key] = item;
        entered ||= item !== null;
      }
    } else {
      const inner = objectValue(node.model, values);
      if (inner.entered || node.required) {
        value[key] = inner.value;
        entered ||= inner.entered;
      }
    }
  }
  const branch = model.choice
    ? pickedBranch(model.choice, values, model.path)
    : null;
  if (branch) {
    const inner = objectValue(branch.model, values);
    Object.assign(value, inner.value);
    entered = true;
  }
  return { value, entered };
}

/** Customer input made of the entered values. Empty fields are left out. */
export function formInput(model: ObjectModel, values: FormValues): unknown {
  return objectValue(model, values).value;
}

/** Values of the form for an input entered before. */
export function formValues(model: ObjectModel, data: unknown): FormValues {
  const values: FormValues = {};
  const visit = (current: ObjectModel, value: unknown) => {
    if (!isObject(value)) {
      return;
    }
    for (const node of current.nodes) {
      const item = value[node.path[node.path.length - 1]];
      if (node.kind === 'group') {
        visit(node.model, item);
      } else if (item !== undefined && item !== null) {
        values[pathKey(node.path)] =
          node.schema.enum || node.type === 'boolean' ? item : String(item);
      }
    }
    if (current.choice) {
      const { discriminator } = current.choice;
      const branch = current.choice.branches.find(
        (candidate) => candidate.value === value[discriminator]
      );
      if (branch) {
        values[pathKey([...current.path, discriminator])] = branch.value;
        visit(branch.model, value);
      }
    }
  };
  visit(model, data);
  return values;
}
