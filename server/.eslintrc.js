module.exports = {
  env: {
    node: true,
    es6: true,
  },
  extends: ["eslint:recommended"],
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
