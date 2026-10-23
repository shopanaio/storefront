function serializeValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  switch (typeof value) {
    case 'string':
      return `string:${JSON.stringify(value)}`;
    case 'number':
      return `number:${Object.is(value, -0) ? '-0' : String(value)}`;
    case 'boolean':
      return `boolean:${value ? 'true' : 'false'}`;
    case 'bigint':
      return `bigint:${String(value)}`;
    case 'object':
      if (Array.isArray(value)) {
        return `[${value.map(serializeValue).join(',')}]`;
      }
      return `{${Object.keys(value)
        .sort()
        .map(
          (key) =>
            `${JSON.stringify(key)}:${serializeValue(
              (value as Record<string, unknown>)[key]
            )}`
        )
        .join(',')}}`;
    default:
      return `${typeof value}:${String(value)}`;
  }
}

/** Canonical identity for GraphQL variables; object key order is irrelevant. */
export function stableSerializeOperationVariables(
  variables: Readonly<Record<string, unknown>>
): string {
  return serializeValue(variables);
}
