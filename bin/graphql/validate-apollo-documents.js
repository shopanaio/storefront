import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import fg from 'fast-glob';
import { Kind, parse, visit } from 'graphql';

const forbiddenDirectives = new Set([
  'connection',
  'refetchable',
  'argumentDefinitions',
  'arguments',
  'inline',
]);

export async function validateApolloDocuments() {
  const files = await fg([
    'src/**/*.graphql',
    'packages/shopana-storefront-sdk/src/**/*.graphql',
  ]);
  const names = new Map();
  const errors = [];

  for (const file of files) {
    const document = parse(await fs.readFile(file, 'utf8'));
    visit(document, {
      Directive(node) {
        if (forbiddenDirectives.has(node.name.value)) {
          errors.push(`${file}: forbidden @${node.name.value} directive`);
        }
      },
      [Kind.OPERATION_DEFINITION](node) {
        if (!node.name) errors.push(`${file}: operation must be named`);
        else register(node.name.value, file);
      },
      [Kind.FRAGMENT_DEFINITION](node) {
        register(node.name.value, file);
        const hasTypename = node.selectionSet.selections.some(
          (selection) =>
            selection.kind === Kind.FIELD &&
            selection.name.value === '__typename'
        );
        if (!hasTypename) {
          errors.push(
            `${file}: fragment ${node.name.value} must select __typename`
          );
        }
      },
    });
  }

  function register(name, file) {
    const previous = names.get(name);
    if (previous)
      errors.push(`${file}: duplicate ${name} (also in ${previous})`);
    else names.set(name, file);
  }

  if (errors.length) throw new Error(errors.join('\n'));
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await validateApolloDocuments();
}
