type RuntimeRecordValue = string | string[] | undefined;

export type RuntimeTransportRecord = Readonly<
  Record<string, RuntimeRecordValue>
>;

type EncodedRecordValue =
  | ['string', string]
  | ['array', string[]]
  | ['undefined'];

export function stableSerializeRuntimeRecord(
  record?: RuntimeTransportRecord
): string {
  const entries = Object.keys(record ?? {})
    .sort()
    .map<[string, EncodedRecordValue]>((key) => {
      const value = record?.[key];
      if (Array.isArray(value)) {
        return [key, ['array', [...value]]];
      }
      if (typeof value === 'string') {
        return [key, ['string', value]];
      }
      return [key, ['undefined']];
    });

  return JSON.stringify(entries);
}

function parseStableRuntimeRecord(
  serialized: string
): Record<string, RuntimeRecordValue> {
  const entries = JSON.parse(serialized) as Array<[string, EncodedRecordValue]>;
  const record: Record<string, RuntimeRecordValue> = {};

  for (const [key, encoded] of entries) {
    switch (encoded[0]) {
      case 'array':
        record[key] = [...encoded[1]];
        break;
      case 'string':
        record[key] = encoded[1];
        break;
      case 'undefined':
        record[key] = undefined;
        break;
    }
  }

  return record;
}

export function parseStableRouteParamsRecord(
  serialized: string
): Record<string, string | undefined> {
  const record = parseStableRuntimeRecord(serialized);

  for (const [key, value] of Object.entries(record)) {
    if (Array.isArray(value)) {
      throw new TypeError(`Route parameter "${key}" cannot contain an array`);
    }
  }

  return record as Record<string, string | undefined>;
}

export function parseStableSearchParamsRecord(
  serialized: string
): Record<string, RuntimeRecordValue> {
  return parseStableRuntimeRecord(serialized);
}
