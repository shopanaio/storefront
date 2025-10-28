import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import atlaskitDesignSystem from "@atlaskit/eslint-plugin-design-system";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: [
        ...nextCoreWebVitals,
        ...nextTypescript,
        ...compat.extends("plugin:jsx-a11y/recommended")
    ],

    plugins: {
        "@atlaskit/design-system": atlaskitDesignSystem,
    },

    rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-namespace": "off",
    },
}]);