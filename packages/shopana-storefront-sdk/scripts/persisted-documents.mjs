/**
 * The manifest of the SDK's persisted documents for the gateway, written next to the build:
 *
 * - `dist/persisted-documents.json`: `{ "<id>": "<document>" }`, every query, mutation and
 *   subscription of the SDK by the id the browser sends (`persistedDocumentId`);
 * - `dist/persisted-documents.cache.json`: `{ "<id>": { operationName, class } }`, the guest
 *   queries the gateway answers with `Cache-Control: public` (`GUEST_CACHEABLE_OPERATIONS`).
 *
 * Run after `tsc`: the ids are computed by the built module the browser runs.
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../dist'
);
const operations = await import(
  path.join(dist, 'graphql/apollo/generated/operations.js')
);
const {
  GUEST_CACHEABLE_OPERATIONS,
  persistedDocumentId,
  persistedDocumentOf,
  persistedDocumentText,
} = await import(path.join(dist, 'graphql/apollo/persisted.js'));

const documents = {};
const cacheable = {};
const names = new Set();
for (const [exportName, document] of Object.entries(operations)) {
  if (!exportName.endsWith('Document') || document?.kind !== 'Document')
    continue;
  const operation = document.definitions.find(
    (definition) => definition.kind === 'OperationDefinition'
  );
  if (!operation?.name) continue;
  const sent = persistedDocumentOf(document);
  const id = await persistedDocumentId(sent);
  documents[id] = persistedDocumentText(sent);
  const operationName = operation.name.value;
  names.add(operationName);
  const cacheClass = GUEST_CACHEABLE_OPERATIONS[operationName];
  if (cacheClass) cacheable[id] = { operationName, class: cacheClass };
}
for (const operationName of Object.keys(GUEST_CACHEABLE_OPERATIONS)) {
  if (!names.has(operationName)) {
    throw new Error(`${operationName} is cacheable but no document of the SDK`);
  }
}
await writeFile(
  path.join(dist, 'persisted-documents.json'),
  `${JSON.stringify(documents, null, 2)}\n`
);
await writeFile(
  path.join(dist, 'persisted-documents.cache.json'),
  `${JSON.stringify(cacheable, null, 2)}\n`
);
console.log(
  `persisted-documents: ${Object.keys(documents).length} documents, ${Object.keys(cacheable).length} cacheable`
);
