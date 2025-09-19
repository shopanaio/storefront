import { writeFileSync } from "fs";
import path from "path";
import { getIntrospectionQuery, buildClientSchema, printSchema } from "graphql";

const { NEXT_PUBLIC_API_KEY, NEXT_PUBLIC_GRAPHQL_URL } = process.env;

if (!NEXT_PUBLIC_API_KEY) {
  console.error("Missing NEXT_PUBLIC_API_KEY in .env");
  process.exit(1);
}

async function main() {
  const res = await fetch(NEXT_PUBLIC_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": NEXT_PUBLIC_API_KEY,
    },
    body: JSON.stringify({
      query: getIntrospectionQuery({ descriptions: true }),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(
      `HTTP ${res.status} while requesting introspection.\n${text}`
    );
    process.exit(1);
  }

  const json = await res.json();
  if (json.errors?.length) {
    console.error(
      "Introspection errors:",
      JSON.stringify(json.errors, null, 2)
    );
    process.exit(1);
  }
  if (!json.data) {
    console.error("Empty introspection response (no data field).");
    process.exit(1);
  }

  const schema = buildClientSchema(json.data);
  const sdl = printSchema(schema);

  const outPath = path.resolve(process.cwd(), "schema.shopify.graphql");
  writeFileSync(outPath, sdl, "utf8");
  console.log(`Done: ${outPath}`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
