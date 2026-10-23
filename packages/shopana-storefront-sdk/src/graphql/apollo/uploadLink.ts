import { ApolloLink, Observable } from '@apollo/client';
import { print } from 'graphql';

const isFile = (value: unknown): value is Blob =>
  typeof Blob !== 'undefined' && value instanceof Blob;

/** Replaces every file in `value` with null and records its object path. */
function extractFiles(
  value: unknown,
  path: string,
  files: Map<Blob, string[]>
): unknown {
  if (isFile(value)) {
    files.set(value, [...(files.get(value) ?? []), path]);
    return null;
  }
  if (Array.isArray(value)) {
    return value.map((item, index) =>
      extractFiles(item, `${path}.${index}`, files)
    );
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        extractFiles(item, `${path}.${key}`, files),
      ])
    );
  }
  return value;
}

/** True when the operation variables carry a `File` or `Blob` (an `Upload` argument). */
export function hasUploadVariables(variables: unknown): boolean {
  if (isFile(variables)) return true;
  if (Array.isArray(variables)) return variables.some(hasUploadVariables);
  if (variables && typeof variables === 'object') {
    return Object.values(variables).some(hasUploadVariables);
  }
  return false;
}

/**
 * Terminating link for operations with files: sends a GraphQL multipart request
 * (`operations`, `map` and one form part per file) with the headers the previous links set,
 * plus `apollo-require-preflight`, which the gateway requires against CSRF.
 */
export function createUploadLink(uri: string): ApolloLink {
  return new ApolloLink(
    (operation) =>
      new Observable((observer) => {
        const files = new Map<Blob, string[]>();
        const variables = extractFiles(operation.variables, 'variables', files);
        const form = new FormData();
        form.append(
          'operations',
          JSON.stringify({
            operationName: operation.operationName,
            query: print(operation.query),
            variables,
          })
        );
        const entries = [...files.entries()];
        form.append(
          'map',
          JSON.stringify(
            Object.fromEntries(
              entries.map(([, paths], index) => [index, paths])
            )
          )
        );
        entries.forEach(([file], index) => form.append(String(index), file));

        const controller = new AbortController();
        const context = operation.getContext();
        fetch(uri, {
          method: 'POST',
          credentials: 'include',
          // The browser sets the multipart content type with its boundary.
          headers: {
            ...(context.headers as Record<string, string> | undefined),
            'apollo-require-preflight': 'true',
          },
          body: form,
          signal: controller.signal,
        })
          .then(async (response) => {
            const result = await response.json().catch(() => null);
            if (!result || typeof result !== 'object') {
              throw new Error(
                `Upload request failed with status ${response.status}`
              );
            }
            observer.next(result);
            observer.complete();
          })
          .catch((error: unknown) => {
            if (!controller.signal.aborted) observer.error(error);
          });

        return () => controller.abort();
      })
  );
}
