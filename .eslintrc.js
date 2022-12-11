module.exports = {
  env: {
    browser: true,
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: ["plugin:vue/vue3-essential", "eslint:recommended"],
  overrides: [],
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
