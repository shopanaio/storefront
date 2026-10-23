/**
 * Validation of delivery customer input against the option's `customerInputContract`
 * (JSON Schema 2020-12 from the API).
 *
 * Covers the keywords carriers use in their contracts: `type`, `const`, `enum`,
 * `properties`, `required`, `additionalProperties`, `oneOf`, `anyOf`, `allOf`, `items`,
 * `minItems`, `maxItems`, local `$ref` (`#/$defs/…`, `#/definitions/…`), `minLength`,
 * `maxLength`, `pattern`, `format: uuid`, `minimum`, `maximum`, `exclusiveMinimum`,
 * `exclusiveMaximum`. Other keywords are not checked here; the backend validates the
 * input in full.
 */

export type JsonSchema = {
  type?: string | string[];
  const?: unknown;
  enum?: unknown[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean | JsonSchema;
  oneOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  allOf?: JsonSchema[];
  items?: JsonSchema;
  minItems?: number;
  maxItems?: number;
  $ref?: string;
  $defs?: Record<string, JsonSchema>;
  definitions?: Record<string, JsonSchema>;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  title?: string;
  description?: string;
};

export interface JsonSchemaIssue {
  /** Dot path of the invalid value, empty for the root. */
  path: string;
  keyword: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * RegExp of a JSON Schema `pattern`. JSON Schema patterns are ECMA-262 with the `u` flag, but
 * contracts also use patterns that are valid only without it (for example `[\w\-]`): those
 * are read without the flag instead of failing the whole validation. A pattern invalid either
 * way accepts any value; the API validates the input again.
 */
function patternOf(pattern: string): RegExp {
  try {
    return new RegExp(pattern, 'u');
  } catch {
    try {
      return new RegExp(pattern);
    } catch {
      return /(?:)/;
    }
  }
}

/**
 * The schema of a contract. The API returns `{ schemaDialect, schema }`; a bare schema is
 * accepted as well. Returns `null` when the option takes no customer input.
 */
export function contractSchema(contract: unknown): JsonSchema | null {
  if (!isObject(contract)) {
    return null;
  }
  if ('schema' in contract) {
    return isObject(contract.schema) ? (contract.schema as JsonSchema) : null;
  }
  return contract as JsonSchema;
}

const matchesType = (type: string, value: unknown): boolean => {
  switch (type) {
    case 'object':
      return isObject(value);
    case 'array':
      return Array.isArray(value);
    case 'string':
      return typeof value === 'string';
    case 'integer':
      return Number.isInteger(value);
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'null':
      return value === null;
    default:
      return true;
  }
};

const join = (path: string, key: string) => (path ? `${path}.${key}` : key);

/** Target of a local `$ref` (`#/$defs/name`, `#/definitions/name`), or `null`. */
function refTarget(ref: string, root: JsonSchema): JsonSchema | null {
  if (!ref.startsWith('#/')) {
    return null;
  }
  let node: unknown = root;
  for (const part of ref.slice(2).split('/')) {
    const key = decodeURIComponent(part)
      .replace(/~1/g, '/')
      .replace(/~0/g, '~');
    node = isObject(node) ? node[key] : undefined;
  }
  return isObject(node) ? (node as JsonSchema) : null;
}

/**
 * The schema with its `$ref` followed and its `allOf` merged into one: properties and
 * `required` of every part together. For building forms; validation checks each part.
 */
export function resolveSchema(
  schema: JsonSchema,
  root: JsonSchema
): JsonSchema {
  let current = schema;
  for (let depth = 0; current.$ref && depth < 16; depth++) {
    const { $ref, ...rest } = current;
    const target = refTarget($ref, root);
    if (!target) {
      return rest;
    }
    current = { ...target, ...rest };
  }
  if (!current.allOf) {
    return current;
  }
  const { allOf, ...rest } = current;
  return allOf
    .map((part) => resolveSchema(part, root))
    .reduce<JsonSchema>(
      (merged, part) => ({
        ...part,
        ...merged,
        properties: { ...merged.properties, ...part.properties },
        required: [...(merged.required ?? []), ...(part.required ?? [])],
      }),
      rest
    );
}

function validateAt(
  schema: JsonSchema,
  value: unknown,
  path: string,
  root: JsonSchema = schema
): JsonSchemaIssue[] {
  const issues: JsonSchemaIssue[] = [];
  const fail = (keyword: string, at = path) =>
    issues.push({ path: at, keyword });
  const validate = (next: JsonSchema, item: unknown, at: string) =>
    validateAt(next, item, at, root);

  if (schema.$ref !== undefined) {
    const target = refTarget(schema.$ref, root);
    if (target) {
      issues.push(...validate(target, value, path));
    }
  }
  for (const part of schema.allOf ?? []) {
    issues.push(...validate(part, value, path));
  }

  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((type) => matchesType(type, value))) {
      fail('type');
      return issues;
    }
  }
  if ('const' in schema && value !== schema.const) {
    fail('const');
  }
  if (schema.enum && !schema.enum.includes(value)) {
    fail('enum');
  }

  if (typeof value === 'string') {
    const length = [...value].length;
    if (schema.minLength !== undefined && length < schema.minLength) {
      fail('minLength');
    }
    if (schema.maxLength !== undefined && length > schema.maxLength) {
      fail('maxLength');
    }
    if (
      schema.pattern !== undefined &&
      !patternOf(schema.pattern).test(value)
    ) {
      fail('pattern');
    }
    if (schema.format === 'uuid' && !UUID.test(value)) {
      fail('format');
    }
  }

  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      fail('minimum');
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      fail('maximum');
    }
    if (
      schema.exclusiveMinimum !== undefined &&
      value <= schema.exclusiveMinimum
    ) {
      fail('exclusiveMinimum');
    }
    if (
      schema.exclusiveMaximum !== undefined &&
      value >= schema.exclusiveMaximum
    ) {
      fail('exclusiveMaximum');
    }
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      fail('minItems');
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      fail('maxItems');
    }
    if (schema.items) {
      const items = schema.items;
      value.forEach((item, index) =>
        issues.push(...validate(items, item, join(path, String(index))))
      );
    }
  }

  if (isObject(value)) {
    for (const key of schema.required ?? []) {
      if (value[key] === undefined) {
        fail('required', join(path, key));
      }
    }
    const properties = schema.properties ?? {};
    for (const [key, item] of Object.entries(value)) {
      if (item === undefined) {
        continue;
      }
      const property = properties[key];
      if (property) {
        issues.push(...validate(property, item, join(path, key)));
      } else if (schema.additionalProperties === false) {
        fail('additionalProperties', join(path, key));
      } else if (isObject(schema.additionalProperties)) {
        issues.push(
          ...validate(schema.additionalProperties, item, join(path, key))
        );
      }
    }
  }

  if (schema.oneOf) {
    const results = schema.oneOf.map((branch) => validate(branch, value, path));
    const passed = results.filter((result) => result.length === 0).length;
    if (passed !== 1) {
      // Report the closest branch so the form can point at the field.
      const closest = results.reduce((best, result) =>
        result.length < best.length ? result : best
      );
      issues.push(...(passed === 0 ? closest : [{ path, keyword: 'oneOf' }]));
    }
  }
  if (schema.anyOf) {
    const results = schema.anyOf.map((branch) => validate(branch, value, path));
    if (!results.some((result) => result.length === 0)) {
      issues.push(
        ...results.reduce((best, result) =>
          result.length < best.length ? result : best
        )
      );
    }
  }

  return issues;
}

/**
 * Validates customer input against a contract. With no contract the option takes no
 * input, so only an absent value is valid.
 */
export function validateCustomerInput(
  contract: unknown,
  value: unknown
): JsonSchemaIssue[] {
  const schema = contractSchema(contract);
  if (!schema) {
    return value === undefined || value === null
      ? []
      : [{ path: '', keyword: 'additionalProperties' }];
  }
  return validateAt(schema, value ?? undefined, '');
}

/**
 * The `oneOf` branch of a contract whose `type` property is the given constant
 * (for example the `DOOR` branch of a Nova Poshta contract).
 */
export function contractBranch(
  contract: unknown,
  type: string
): JsonSchema | null {
  const schema = contractSchema(contract);
  const branches = schema?.oneOf ?? (schema ? [schema] : []);
  return (
    branches.find((branch) => branch.properties?.type?.const === type) ?? null
  );
}
