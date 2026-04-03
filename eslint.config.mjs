import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import configPrettier from "eslint-config-prettier";
import globals from "globals";

export default [
  {
    ignores: ["**/assets/*.js"],
  },
  js.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  {
    files: ["**/*.js", "**/*.vue"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.commonjs,
        ...globals.es2021,
        // Your custom globals
        io: "readonly",
        logger: "readonly",
        error: "readonly",
        enums: "readonly",
        eventBus: "readonly",
        softError: "readonly",
        hardError: "readonly",
      },
    },
    rules: {
      "no-useless-assignment": "off",
      "no-unused-vars": "off",
      "vue/multi-word-component-names": "off",
    },
  },
  configPrettier,
];
