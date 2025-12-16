module.exports = {
  env: {
    browser: true,
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "plugin:vue/vue3-recommended", "prettier"],
  overrides: [],
  ignorePatterns: ["**/assets/*.js"],
  parserOptions: {
    ecmaVersion: "latest",
  },
  plugins: ["vue"],
  rules: {},
  globals: {
    io: "readonly",
    logger: "readonly",
    error: "readonly",
    enums: "readonly",
    eventBus: "readonly",
    softError: "readonly",
    hardError: "readonly",
  },
};
