module.exports = {
  env: {
    node: true,
    es6: true,
  },
  extends: ["eslint:recommended", "prettier", "eslint-config-prettier"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
  },
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
