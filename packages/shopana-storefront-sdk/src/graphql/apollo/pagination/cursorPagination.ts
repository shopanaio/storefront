import type { FieldFunctionOptions, FieldPolicy } from '@apollo/client';

interface EdgeLike {
  readonly cursor?: string | null;
  readonly node?: {
    readonly __typename?: string;
    readonly id?: string | null;
  } | null;
}

interface ConnectionLike {
  readonly edges?: readonly EdgeLike[] | null;
  readonly pageInfo?: unknown;
  readonly [key: string]: unknown;
}

function edgeKey(edge: EdgeLike, readField: FieldFunctionOptions['readField']) {
  const node = edge.node;
  const typename = node && readField<string>('__typename', node);
  const id = node && readField<string>('id', node);
  return typename && id ? `${typename}:${id}` : (edge.cursor ?? null);
}

export function cursorConnectionPolicy(
  keyArgs: FieldPolicy['keyArgs']
): FieldPolicy<ConnectionLike> {
  return {
    keyArgs,
    merge(existing, incoming, options) {
      if (!options.args?.after) {
        return incoming;
      }

      const edges = [...(existing?.edges ?? [])];
      const keys = new Set(
        edges
          .map((edge) => edgeKey(edge, options.readField))
          .filter((key): key is string => Boolean(key))
      );

      for (const edge of incoming.edges ?? []) {
        const key = edgeKey(edge, options.readField);
        if (!key || !keys.has(key)) {
          edges.push(edge);
          if (key) keys.add(key);
        }
      }

      return { ...existing, ...incoming, edges };
    },
  };
}
